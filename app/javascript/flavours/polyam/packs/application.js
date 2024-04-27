import 'packs/public-path';
import { loadLocale } from 'flavours/polyam/locales';
import main from "flavours/polyam/main";
import { loadPolyfills } from 'flavours/polyam/polyfills';

loadPolyfills()
  .then(loadLocale)
  .then(main)
  .catch(e => {
    console.error(e);
  });
