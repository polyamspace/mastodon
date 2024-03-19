module.exports = {
  test: /\.svg$/,
  include: [/material-icons/, /svg-icons/, /awesome-icons/],
  issuer: /\.[jt]sx?$/,
  use: [
    {
      loader: '@svgr/webpack',
      options: {
        svgo: false,
        titleProp: true,
      },
    },
  ],
};
