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
```
