expo-three-view
===============

**An Expo Component for [Three.js]() visualization with auto-resizing and built-in
orbit controls**

The `ThreeView` component simplifies the usage of
[Three.js](https://threejs.org/) for simple 3D visualization. It automatically
ajusts the camera aspect and context dimensions on resize and offers orbit
controls out of the box:

* *rotate:* drag (all platforms);

* *rotate:* drag with two fingers (Android or iOS) or shift (web);

* *zoom:* pinch (Android or iOS) and mouse wheel (web).

The implementation was heavily inspired by [Evan
Bacon](https://github.com/EvanBacon)'s
[expo-three-orbit-controls](https://github.com/EvanBacon/expo-three-orbit-controls).


Peer dependencies
-----------------

``` json
{
    "@hashiprobr/react-use-mount-and-update": "^1.0.3",
    "@hashiprobr/react-use-refs": "^1.0.9",
    "expo": "^43.0.5",
    "expo-gl": "^11.0.3",
    "expo-three": "^6.0.1",
    "react": "^17.0.1",
    "react-native": ">=0.64.3",
    "react-native-gesture-handler": "^1.10.2",
    "react-native-reanimated": "^2.2.0",
    "three": ">=0.136.0"
}
```


Install
-------

With npm:

```
npm install @hashiprobr/expo-three-view
```

With yarn:

```
yarn add @hashiprobr/expo-three-view
```

With expo:

```
expo install @hashiprobr/expo-three-view
```

If using Expo, add the module to `webpack.config.js`:

``` js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
    const config = await createExpoWebpackConfigAsync({
        ...env,
        babel: {
            dangerouslyAddModulePathsToTranspile: [
                '@hashiprobr/expo-three-view',
            ]
        },
    }, argv);
    return config;
};
```

If `webpack.config.js` does not exist, create it with:

```
expo customize:web
````


Props
-----

| name      | description                                                                                          |
|-----------|------------------------------------------------------------------------------------------------------|
| onCreate  | a funcion called after the rendering context has been created or recreated (see below for arguments) |
| onResize  | a funcion called after the component is resized (no arguments)                                       |
| onDispose | a funcion called before the renderer is disposed (no arguments)                                      |

[...View props](https://reactnative.dev/docs/view#props)


onCreate
--------

Receives an object with four properties:

* `renderer`, a special [expo-three](https://github.com/expo/expo-three)
  renderer that uses a rendering context provided by an [Expo
  GLView](https://docs.expo.dev/versions/latest/sdk/gl-view/), and automatically
  updates its dimensions accordingly;

* `scene`, an initially empty [Three.js](https://threejs.org/) scene;

* `camera`, a special [Three.js](https://threejs.org/) perspective camera that
  sets the argument of `lookAt` as the orbit controls center, and automatically
  updates its aspect according to the rendering context size;

* `canvas`, an object with three methods:

  * `refresh`, that executes a single render using the renderer, scene, and
    camera above;

  * `play`, that starts an animation based on a given function, using the
    renderer, scene, and camera above;

  * `stop`, that stops the animation.

This function is called the first time the context is created and whenever the
context is recreated for whatever reason. Please note that, while the renderer
is updated on each call, *all other arguments remain the same*. This means you
don't need to rebuild the scene on each call.


onResize
--------

This function is called whenever the component is resized. The most common usage
is calling `refresh`, but note that this is not necessary when an animation is
running.


onDispose
---------

This function is called whenever the renderer is disposed. This happens either
on unmount or when the context is recreated for whatever reason. The most common
usage is executing clean up tasks.


Example
-------

Simple example without animation:

``` js
import {
    AmbientLight,
    BoxBufferGeometry,
    Fog,
    GridHelper,
    Mesh,
    MeshStandardMaterial,
    PointLight,
    SpotLight,
} from 'three';

import React from 'react';

import ThreeView from '@hashiprobr/expo-three-view';

export default function MyComponent() {
    let refresh;

    function onCreate({ renderer, scene, camera, canvas }) {
        const sceneColor = 0x6ad6f0;
        renderer.setClearColor(sceneColor);

        scene.fog = new Fog(sceneColor, 1, 10000);
        scene.add(new GridHelper(10, 10));

        const ambientLight = new AmbientLight(0x101010);
        scene.add(ambientLight);

        const pointLight = new PointLight(0xffffff, 2, 1000, 1);
        pointLight.position.set(0, 200, 200);
        scene.add(pointLight);

        const spotLight = new SpotLight(0xffffff, 0.5);
        spotLight.position.set(0, 500, 100);
        spotLight.lookAt(scene.position);
        scene.add(spotLight);

        const geometry = new BoxBufferGeometry(1.0, 1.0, 1.0);
        const material = new MeshStandardMaterial({ color: 0xff0000 });
        const cube = new Mesh(geometry, material);
        scene.add(cube);

        camera.position.set(2, 5, 5);
        camera.lookAt(cube.position);

        refresh = canvas.refresh;
        refresh();
    }

    function onResize() {
        refresh();
    }

    return (
        <ThreeView
            style={{
                flexGrow: 1,
            }}
            onCreate={onCreate}
            onResize={onResize}
        />
    );
}
```

Simple example with animation:

``` js
import {
    AmbientLight,
    BoxBufferGeometry,
    Fog,
    GridHelper,
    Mesh,
    MeshStandardMaterial,
    PointLight,
    SpotLight,
} from 'three';

import React from 'react';

import ThreeView from '@hashiprobr/expo-three-view';

export default function MyComponent() {
    function onCreate({ renderer, scene, camera, canvas }) {
        const sceneColor = 0x6ad6f0;
        renderer.setClearColor(sceneColor);

        scene.fog = new Fog(sceneColor, 1, 10000);
        scene.add(new GridHelper(10, 10));

        const ambientLight = new AmbientLight(0x101010);
        scene.add(ambientLight);

        const pointLight = new PointLight(0xffffff, 2, 1000, 1);
        pointLight.position.set(0, 200, 200);
        scene.add(pointLight);

        const spotLight = new SpotLight(0xffffff, 0.5);
        spotLight.position.set(0, 500, 100);
        spotLight.lookAt(scene.position);
        scene.add(spotLight);

        const geometry = new BoxBufferGeometry(1.0, 1.0, 1.0);
        const material = new MeshStandardMaterial({ color: 0xff0000 });
        const cube = new Mesh(geometry, material);
        scene.add(cube);

        camera.position.set(2, 5, 5);
        camera.lookAt(cube.position);

        canvas.play(() => {
            cube.rotation.y += 0.05;
            cube.rotation.x += 0.025;
        });
    }

    return (
        <ThreeView
            style={{
                flexGrow: 1,
            }}
            onCreate={onCreate}
        />
    );
}
```

Slightly more complex example with animation, that considers the possibility of
losing the context and cleans up on unmount:

``` js
import {
    AmbientLight,
    BoxBufferGeometry,
    Fog,
    GridHelper,
    Mesh,
    MeshStandardMaterial,
    PointLight,
    SpotLight,
} from 'three';

import React, { useRef, useEffect } from 'react';

import ThreeView from '@hashiprobr/expo-three-view';

export default function MyComponent() {
    const ref = useRef(null);

    function onCreate({ renderer, scene, camera, canvas }) {
        const sceneColor = 0x6ad6f0;
        renderer.setClearColor(sceneColor);

        let update;

        if (ref.current) {
            update = ref.current.update;
        } else {
            camera.position.set(2, 5, 5);

            scene.fog = new Fog(sceneColor, 1, 10000);
            scene.add(new GridHelper(10, 10));

            const ambientLight = new AmbientLight(0x101010);
            scene.add(ambientLight);

            const pointLight = new PointLight(0xffffff, 2, 1000, 1);
            pointLight.position.set(0, 200, 200);
            scene.add(pointLight);

            const spotLight = new SpotLight(0xffffff, 0.5);
            spotLight.position.set(0, 500, 100);
            spotLight.lookAt(scene.position);
            scene.add(spotLight);

            const geometry = new BoxBufferGeometry(1.0, 1.0, 1.0);
            const material = new MeshStandardMaterial({ color: 0xff0000 });
            const cube = new Mesh(geometry, material);
            scene.add(cube);

            camera.lookAt(cube.position);

            update = () => {
                cube.rotation.y += 0.05;
                cube.rotation.x += 0.025;
            }

            ref.current = { geometry, material, update };
        }

        canvas.play(update);
    }

    useEffect(() => {
        return () => {
            if (ref.current) {
                ref.material.dispose();
                ref.geometry.dispose();
                ref.current = null;
            }
        };
    });

    return (
        <ThreeView
            style={{
                flexGrow: 1,
            }}
            onCreate={onCreate}
        />
    );
}
```
