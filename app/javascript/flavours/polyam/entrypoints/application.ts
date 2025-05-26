import { loadLocale } from 'flavours/polyam/locales';
import main from 'flavours/polyam/main';
import { loadPolyfills } from 'flavours/polyam/polyfills';

loadPolyfills()
  .then(loadLocale)
  .then(main)
  .catch((e: unknown) => {
    console.error(e);
  });
