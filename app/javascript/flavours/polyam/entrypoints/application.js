import '@/entrypoints/public-path';

import { start } from 'flavours/polyam/common';
import { loadLocale } from 'flavours/polyam/locales';
import main from "flavours/polyam/main";
import { loadPolyfills } from 'flavours/polyam/polyfills';

start();

loadPolyfills()
  .then(loadLocale)
  .then(main)
  .catch(e => {
    console.error(e);
  });
