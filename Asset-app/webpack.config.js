const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa-react");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = (webpackConfigEnv, argv) => {
  const defaultConfig = singleSpaDefaults({
    orgName: "AssetHierarchy",
    projectName: "Asset-mfe",
    webpackConfigEnv,
    argv,
    outputSystemJS: false,
  });

  return merge(defaultConfig, {
    plugins: [
      new ModuleFederationPlugin({
        name: "asset_mfe",
        filename: "remoteEntry.js",
        remotes: {
          shared_mfe: "shared_mfe@http://localhost:8085/remoteEntry.js",
        },
        shared: { react: { singleton: true }, "react-dom": { singleton: true } },
      }),
    ],
  });
};
