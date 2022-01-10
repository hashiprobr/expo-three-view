expo-three-view
===============

**An Expo Component for Three.js visualization with auto-resizing and built-in orbit controls**


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
                '@hashiprobr/expo-pdf-reader',
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
  updates its size accordingly;

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
during unmount or when the context is recreated for whatever reason. The most
common usage is executing cleanup tasks.
