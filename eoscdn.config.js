const resourceGroups = [
  {
    name: "preact-all",
    loadOrder: "strict",
    dependsOn: [],
    resources: [
      {
        type: "script",
        sources: [
          "npm://preact@10.5.4/dist/preact.umd.js",
          "eos://assetstorage/resources/184ba2fcc628c9ba29b6181887f59129b75d0c407e906ea57d8b86bc69a7201a?scope=assetstorage&dataKey=data&index_position=2&key_type=sha256&storageEncoding=base64&compression=deflate&network=mainnet",
          "https://unpkg.com/preact@10.5.4/dist/preact.umd.js",
        ],
        externals: {
          "preact": "preact",
        },
      },
      {
        type: "script",
        sources: [
          "npm://preact@10.5.4/hooks/dist/hooks.umd.js",
          "eos://assetstorage/resources/81292fdd0e629469bad1aa747ecd0059ed5ffadeb38edbf6c57618cb94caa33c?scope=assetstorage&dataKey=data&index_position=2&key_type=sha256&storageEncoding=base64&compression=deflate&network=mainnet",
          "https://unpkg.com/preact@10.5.4/hooks/dist/hooks.umd.js",
        ],
        externals: {
          "preact/hooks": "preactHooks",
        },
      },
      {
        type: "script",
        sources: [
          "npm://preact@10.5.4/compat/dist/compat.umd.js",
          "eos://assetstorage/resources/3e139032e6cd82575935ed3f04c545fd5d31f776364878652cbae1dbd1f0261f?scope=assetstorage&dataKey=data&index_position=2&key_type=sha256&storageEncoding=base64&compression=deflate&network=mainnet",
          "https://unpkg.com/preact@10.5.4/compat/dist/compat.umd.js",
        ],
        externals: {
          "preact/compat": "preactCompat",
          "react": "preactCompat",
          "react-dom": "preactCompat",
        },
      },
    ],
  },
  {
    name: "preact-react",
    loadOrder: "strict",
    dependsOn: ["preact-all"],
    resources: [
      {
        type: "inject",
        injectType: "inline-script",
        content: "(function(){window.React = window.preactCompat;window.ReactDOM = window.preactCompat;})();",
      }
    ],
  },
  {
    name: "preact-router",
    loadOrder: "any",
    dependsOn: ["preact-react"],
    resources: [
      {
        type: "script",
        sources: [
          "npm://preact-router@3.2.1/dist/preact-router.js",
          "eos://assetstorage/resources/613e6eed837b0ed7bb3e32f924c84bd5d2d1521c5b134f63b5c792d989ac2c56?scope=assetstorage&dataKey=data&index_position=2&key_type=sha256&storageEncoding=base64&compression=deflate&network=mainnet",
          "https://unpkg.com/preact-router@3.2.1/dist/preact-router.js",
        ],
        externals: {
          "preact-router": "preactRouter",
        },
      }
    ],
  },
  /*
  {
    name: "redux-zero",
    loadOrder: "strict",
    dependsOn: ["preact-react"],
    resources: [
      {
        type: "script",
        sources: [
          "npm://redux-zero@5.1.7/dist/redux-zero.min.js",
          "https://unpkg.com/redux-zero@5.1.7/dist/redux-zero.min.js",
        ],
        externals: {
          "redux-zero": "redux-zero",
        },
      },
      {
        type: "script",
        sources: [
          "npm://redux-zero@5.1.7/preact/index.min.js",
          "https://unpkg.com/redux-zero@5.1.7/preact/index.min.js",
        ],
        externals: {
          "redux-zero/preact": "redux-zero",
        },
      },
    ],
  },
  {
    name: "classnames",
    loadOrder: "any",
    dependsOn: [],
    resources: [
      {
        type: "script",
        sources: [
          "npm://classnames@2.3.1/index.js",
          "https://unpkg.com/classnames@2.3.1/index.js",
        ],
        externals: {
          "classnames": "classNames",
        },
      }
    ],
  },*/
  {
    name: "antd",
    loadOrder: "any",
    dependsOn: ["preact-react"],
    resources: [
      {
        type: "script",
        sources: [
          "npm://antd@4.15.1/dist/antd.min.js",
          "eos://assetstorage/resources/d8112c32b524abefee10b2b7bc17e56da416951b89538c87bef04420658daf52?scope=assetstorage&dataKey=data&index_position=2&key_type=sha256&storageEncoding=base64&compression=deflate&network=mainnet",
          //"https://cdnjs.cloudflare.com/ajax/libs/antd/4.15.1/antd.min.js",
        ],
        externals: {
          "antd": "antd",
        },
      },
      {
        type: "css",
        sources: [
          "npm://antd@4.15.1/dist/antd.min.css",
          "eos://assetstorage/resources/bc0eccbc727a88e2cf346ea0c9ee81dd4d39d4ce0555436ea0acea065c0406fe?scope=assetstorage&dataKey=data&index_position=2&key_type=sha256&storageEncoding=base64&compression=deflate&network=mainnet",
          //"https://cdnjs.cloudflare.com/ajax/libs/antd/4.15.1/antd.min.css",
        ],
      },
    ],
  },
];


module.exports = {
  resourceGroups: resourceGroups,
}