const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react");
const { ModuleFederationPlugin } = require("webpack").container; // <-- ye import karna jaruri hai
const path = require("path");

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "AssetHierarchy",
    projectName: "Shared-mfe",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  return merge(defaultConfig, {
    plugins: [
      new ModuleFederationPlugin({
        name: "shared_mfe",
        filename: "remoteEntry.js",
        exposes: {
          "./SignalOverlay": "./src/Components/SignalOverlay.jsx",
          "./eventBus": "./src/utils/eventBus.js",
          "./signalEvents": "./src/Events/signalEvents.js",
        },
        shared: {
          react: { singleton: true, requiredVersion: false },
          "react-dom": { singleton: true, requiredVersion: false },
        },
      }),
    ],

    // output: {
    //   ...defaultConfig.output,
    //   publicPath: "http://localhost:8089/", // shared-mfe ka host port
    // },

    // devServer: {
    //   port: 8089,
    //   historyApiFallback: true,
    //   hot: true,
    // },
  });
};
