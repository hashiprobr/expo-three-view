import { Vector3, Spherical, Quaternion, Scene } from 'three';

import React from 'react';

import { Platform } from 'react-native';

import { State } from 'react-native-gesture-handler';

import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';

import useRefs from '@hashiprobr/react-use-refs';
import { useMount } from '@hashiprobr/react-use-mount-and-update';

import Camera from './Camera';
import GestureHandler from './GestureHandler';

export default function ThreeView(props) {
    const defaultTarget = new Vector3();

    const refs = useRefs({
        width: 0,
        height: 0,
        context: null,
        renderer: null,
        scene: new Scene(),
        camera: new Camera(defaultTarget),
        target: defaultTarget,
        pan: null,
        shift: false,
        frame: 0,
    });

    function getSize(gl) {
        const portrait = refs.width < refs.height;
        const glWidth = gl.drawingBufferWidth;
        const glHeight = gl.drawingBufferHeight;
        if (portrait === glWidth < glHeight) {
            return [glWidth, glHeight];
        } else {
            return [glHeight, glWidth];
        }
    }

    function updateCamera(aspect) {
        refs.camera.aspect = aspect;
        refs.camera.updateProjectionMatrix();
    }

    function createRenderer(glWidth, glHeight) {
        refs.renderer = new Renderer({ gl: refs.context });
        refs.renderer.setSize(glWidth, glHeight);
        if (props.onCreate) {
            props.onCreate({
                renderer: refs.renderer,
                scene: refs.scene,
                camera: refs.camera,
                canvas: {
                    refresh,
                    play,
                    stop,
                },
            });
        }
    }

    function render() {
        if (refs.renderer) {
            refs.renderer.render(refs.scene, refs.camera);
            refs.context.endFrameEXP();
        }
    }

    function refresh() {
        requestAnimationFrame(render);
        requestAnimationFrame(render);
    }

    function play(update) {
        function renderFrame() {
            render();
            update();
            refs.frame = requestAnimationFrame(renderFrame);
        }
        if (refs.frame) {
            cancelAnimationFrame(refs.frame);
        }
        refs.frame = requestAnimationFrame(renderFrame);
    }

    function stop() {
        if (refs.frame) {
            cancelAnimationFrame(refs.frame);
            refs.frame = 0;
        }
    }

    function disposeRenderer() {
        if (props.onDispose) {
            props.onDispose();
        }
        stop();
        refs.renderer.dispose();
    }

    function destroyRenderer() {
        if (refs.renderer) {
            disposeRenderer();
            refs.renderer = null;
        }
        if (refs.camera.aspect !== 1) {
            updateCamera(1);
        }
    }

    async function destroyContext(gl) {
        const success = await GLView.destroyContextAsync(gl);
        if (!success) {
            throw new Error('Could not destroy context');
        }
    }

    async function replaceContext(gl) {
        [refs.context, gl] = [gl, refs.context];
        if (gl) {
            await destroyContext(gl);
        }
    }

    async function destroy() {
        destroyRenderer();
        const gl = refs.context;
        if (gl) {
            refs.context = null;
            await destroyContext(gl);
        }
    }

    function translate(translationX, translationY) {
        const { absolute, target, baseX, baseY, scale } = refs.pan;
        const deltaX = baseX.clone().multiplyScalar(translationX * scale);
        const deltaY = baseY.clone().multiplyScalar(translationY * scale);
        refs.camera.position.copy(absolute)
            .sub(deltaX)
            .add(deltaY);
        refs.target.copy(target)
            .sub(deltaX)
            .add(deltaY);
    }

    function rotate(translationX, translationY) {
        const { relative, angle, rotation } = refs.pan;
        const spherical = relative.clone();
        spherical.theta -= translationX * angle;
        spherical.phi -= translationY * angle;
        spherical.makeSafe();
        refs.camera.position.setFromSpherical(spherical)
            .applyQuaternion(rotation)
            .add(refs.target);
        refs.camera.peekAt(refs.target);
    }

    function zoom(forward) {
        const direction = refs.target.clone().sub(refs.camera.position);
        if (forward) {
            const distance = direction.length() - refs.camera.near;
            if (distance > 0) {
                direction.normalize();
                if (distance < 1) {
                    direction.multiplyScalar(distance);
                }
                refs.camera.position.add(direction);
            }
        } else {
            refs.camera.position.sub(direction.normalize());
        }
        requestAnimationFrame(render);
    }

    function onPanStateChange({ nativeEvent }) {
        if (nativeEvent.state === State.BEGAN) {
            const vector = refs.camera.position.clone();
            const unrotation = new Quaternion();
            refs.pan = {
                relative: new Spherical(),
                baseX: new Vector3(1, 0, 0),
                baseY: new Vector3(0, 1, 0),
            };
            vector.sub(refs.target);
            unrotation.setFromUnitVectors(refs.camera.up, refs.pan.baseY);
            refs.pan.relative.setFromVector3(vector.applyQuaternion(unrotation));
            refs.pan.angle = Math.PI / refs.height;
            refs.pan.rotation = unrotation.invert();
            refs.pan.absolute = refs.camera.position.clone();
            refs.pan.target = refs.target.clone();
            refs.pan.baseX.applyQuaternion(refs.camera.quaternion);
            refs.pan.baseY.applyQuaternion(refs.camera.quaternion);
            refs.pan.scale = refs.pan.relative.radius / refs.height;
            refs.pan.modifier = null;
        }
    }

    function onPanEvent({ nativeEvent }) {
        if (nativeEvent.state === State.ACTIVE) {
            if (refs.pan.modifier === null) {
                refs.pan.modifier = refs.shift || nativeEvent.numberOfPointers > 1;
            }
            const { translationX, translationY } = nativeEvent;
            if (refs.pan.modifier) {
                translate(translationX, translationY);
            } else {
                rotate(translationX, translationY);
            }
            requestAnimationFrame(render);
        }
    }

    function onPinchEvent({ nativeEvent }) {
        zoom(nativeEvent.scale > 1);
    }

    function onWheel(event) {
        zoom(event.deltaY < 0);
        if (props.onWheel) {
            props.onWheel(event);
        }
    }

    function onLayout({ nativeEvent }) {
        const { width, height } = nativeEvent.layout;
        let changed = false;
        if (refs.width !== width) {
            refs.width = width;
            changed = true;
        }
        if (refs.height !== height) {
            refs.height = height;
            changed = true;
        }
        if (changed) {
            if (refs.width > 0 && refs.height > 0) {
                const gl = refs.context;
                if (gl) {
                    requestAnimationFrame(() => {
                        const [glWidth, glHeight] = getSize(gl);
                        updateCamera(glWidth / glHeight);
                        if (refs.renderer) {
                            refs.renderer.setSize(glWidth, glHeight);
                            if (props.onResize) {
                                props.onResize();
                            }
                        } else {
                            createRenderer(glWidth, glHeight);
                        }
                    });
                }
            } else {
                destroyRenderer();
            }
        }
        if (props.onLayout) {
            props.onLayout({ nativeEvent });
        }
    }

    async function onContextCreate(gl) {
        if (refs.context !== gl) {
            if (gl) {
                if (refs.width > 0 && refs.height > 0) {
                    requestAnimationFrame(() => {
                        const [glWidth, glHeight] = getSize(gl);
                        updateCamera(glWidth / glHeight);
                        if (refs.renderer) {
                            disposeRenderer();
                        }
                        await replaceContext(gl);
                        createRenderer(glWidth, glHeight);
                    });
                } else {
                    await replaceContext(gl);
                }
            } else {
                await destroy();
            }
        }
    }

    useMount(() => {
        if (Platform.OS === 'web') {
            const onKeydown = (event) => {
                if (event.key === 'Shift') {
                    refs.shift = true;
                }
            };
            const onKeyup = (event) => {
                if (event.key === 'Shift') {
                    refs.shift = false;
                }
            };
            addEventListener('keydown', onKeydown);
            addEventListener('keyup', onKeyup);
            return async () => {
                await destroy();
                removeEventListener('keyup', onKeyup);
                removeEventListener('keydown', onKeydown);
            };
        } else {
            return destroy;
        }
    });

    return (
        <GestureHandler
            {...props}
            style={{
                ...props.style,
                flexDirection: 'column',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                padding: 0,
                paddingTop: 0,
                paddingRight: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                overflow: 'visible',
            }}
            onWheel={onWheel}
            onLayout={onLayout}
            onPanStateChange={onPanStateChange}
            onPanEvent={onPanEvent}
            onPinchEvent={onPinchEvent}
        >
            <GLView
                style={{
                    flexGrow: 1,
                }}
                onContextCreate={onContextCreate}
            />
        </GestureHandler>
    );
}
