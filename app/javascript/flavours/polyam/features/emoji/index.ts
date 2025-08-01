import initialState from '@/flavours/polyam/initial_state';
import { loadWorker } from '@/flavours/polyam/utils/workers';

import { toSupportedLocale } from './locale';

const userLocale = toSupportedLocale(initialState?.meta.locale ?? 'en');

let worker: Worker | null = null;

export async function initializeEmoji() {
  if (!worker && 'Worker' in window) {
    try {
      worker = loadWorker(new URL('./worker', import.meta.url), {
        type: 'module',
      });
    } catch (err) {
      console.warn('Error creating web worker:', err);
    }
  }

  if (worker) {
    // Assign worker to const to make TS happy inside the event listener.
    const thisWorker = worker;
    thisWorker.addEventListener('message', (event: MessageEvent<string>) => {
      const { data: message } = event;
      if (message === 'ready') {
        thisWorker.postMessage('custom');
        void loadEmojiLocale(userLocale);
        // Load English locale as well, because people are still used to
        // using it from before we supported other locales.
        if (userLocale !== 'en') {
          void loadEmojiLocale('en');
        }
      }
    });
  } else {
    const { importCustomEmojiData } = await import('./loader');
    await importCustomEmojiData();
    await loadEmojiLocale(userLocale);
    if (userLocale !== 'en') {
      await loadEmojiLocale('en');
    }
  }
}

export async function loadEmojiLocale(localeString: string) {
  const locale = toSupportedLocale(localeString);

  if (worker) {
    worker.postMessage(locale);
  } else {
    const { importEmojiData } = await import('./loader');
    await importEmojiData(locale);
  }
}
