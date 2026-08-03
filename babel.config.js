module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": 3,
        "targets": "> 0.25%",
        "modules": "auto"
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
};
