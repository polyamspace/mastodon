import { loadLocale } from 'flavours/glitch/locales';
import main from 'flavours/glitch/main';
import { loadPolyfills } from 'flavours/glitch/polyfills';

loadPolyfills()
  .then(loadLocale)
  .then(main)
  .catch((e: unknown) => {
    console.error(e);
  });
