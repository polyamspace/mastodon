import { createRoot } from 'react-dom/client';

import { Globals } from '@react-spring/web';

import { setupBrowserNotifications } from 'flavours/polyam/actions/notifications';
import Mastodon from 'flavours/polyam/containers/mastodon';
import { me, reduceMotion } from 'flavours/polyam/initial_state';
import * as perf from 'flavours/polyam/performance';
import ready from 'flavours/polyam/ready';
import { store } from 'flavours/polyam/store';

import {
  isProduction,
  isDevelopment,
  isModernEmojiEnabled,
} from './utils/environment';

function main() {
  perf.start('main()');

  return ready(async () => {
    const mountNode = document.getElementById('mastodon');
    if (!mountNode) {
      throw new Error('Mount node not found');
    }
    const props = JSON.parse(
      mountNode.getAttribute('data-props') ?? '{}',
    ) as Record<string, unknown>;

    if (reduceMotion) {
      Globals.assign({
        skipAnimation: true,
      });
    }

    if (isModernEmojiEnabled()) {
      const { initializeEmoji } = await import(
        '@/flavours/polyam/features/emoji'
      );
      await initializeEmoji();
    }

    const root = createRoot(mountNode);
    root.render(<Mastodon {...props} />);
    store.dispatch(setupBrowserNotifications());

    if (isProduction() && me && 'serviceWorker' in navigator) {
      const { Workbox } = await import('workbox-window');
      const wb = new Workbox(
        isDevelopment() ? '/packs-dev/dev-sw.js?dev-sw' : '/sw.js',
        { type: 'module', scope: '/' },
      );
      let registration;

      try {
        registration = await wb.register();
      } catch (err) {
        console.error(err);
      }

      if (
        registration &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const registerPushNotifications = await import(
          'flavours/polyam/actions/push_notifications'
        );

        store.dispatch(registerPushNotifications.register());
      }
    }

    perf.stop('main()');
  });
}

// eslint-disable-next-line import/no-default-export
export default main;
