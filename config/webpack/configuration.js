// Common configuration for webpacker loaded from config/webpacker.yml

const { lstatSync, readFileSync } = require('fs');
const { basename, dirname, extname, join, resolve } = require('path');
const { env } = require('process');

const glob = require('glob');
const { load } = require('js-yaml');

const configPath = resolve('config', 'webpacker.yml');
const settings = load(readFileSync(configPath), 'utf8')[env.RAILS_ENV || env.NODE_ENV];
const flavourFiles = glob.sync('app/javascript/flavours/*/theme.yml');
const skinFiles = glob.sync('app/javascript/skins/*/*');
const flavours = {};

const disabled_skins = (env.DISABLED_SKINS || '').split(/\s*,\s*/);

const core = function () {
  const coreFile = resolve('app', 'javascript', 'core', 'theme.yml');
  const data = load(readFileSync(coreFile), 'utf8');
  if (!data.pack_directory) {
    data.pack_directory = dirname(coreFile);
  }
  return data.pack ? data : {};
}();

flavourFiles.forEach((flavourFile) => {
  const data = load(readFileSync(flavourFile), 'utf8');
  data.name = basename(dirname(flavourFile));
  data.skin = {};
  // Skip vanilla flavour
  if (data.name === 'vanilla' && env.ENABLE_VANILLA !== 'true') return;
  if (!data.pack_directory) {
    data.pack_directory = dirname(flavourFile);
  }
  if (data.locales) {
    data.locales = join(dirname(flavourFile), data.locales);
  }
  if (data.pack && typeof data.pack === 'object') {
    flavours[data.name] = data;
  }
});

skinFiles.forEach((skinFile) => {
  let skin = basename(skinFile);
  const name = basename(dirname(skinFile));
  // Skip skin if disabled
  if (disabled_skins && skin !== 'default' && disabled_skins.includes(skin)) {
    return;
  }
  if (!flavours[name]) {
    return;
  }
  const data = flavours[name].skin;
  if (lstatSync(skinFile).isDirectory()) {
    data[skin] = {};
    const skinPacks = glob.sync(join(skinFile, '*.{css,scss}'));
    skinPacks.forEach((pack) => {
      data[skin][basename(pack, extname(pack))] = pack;
    });
  } else if ((skin = skin.match(/^(.*)\.s?css$/i))) {
    data[skin[1]] = { common: skinFile };
  }
});

const output = {
  path: resolve('public', settings.public_output_path),
  publicPath: `/${settings.public_output_path}/`,
};

module.exports = {
  settings,
  core,
  flavours,
  env: {
    NODE_ENV: env.NODE_ENV,
    PUBLIC_OUTPUT_PATH: settings.public_output_path,
  },
  output,
};
