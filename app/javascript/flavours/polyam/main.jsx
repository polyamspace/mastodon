import { createRoot } from 'react-dom/client';

import { setupBrowserNotifications } from 'flavours/polyam/actions/notifications';
import Mastodon from 'flavours/polyam/containers/mastodon';
import { me } from 'flavours/polyam/initial_state';
import * as perf from 'flavours/polyam/performance';
import ready from 'flavours/polyam/ready';
import { store } from 'flavours/polyam/store';

import { isProduction } from './utils/environment';

/**
 * @returns {Promise<void>}
 */
function main() {
  perf.start('main()');

  return ready(async () => {
    const mountNode = document.getElementById('mastodon');
    const props = JSON.parse(mountNode.getAttribute('data-props'));

    const root = createRoot(mountNode);
    root.render(<Mastodon {...props} />);
    store.dispatch(setupBrowserNotifications());

    if (isProduction() && me && 'serviceWorker' in navigator) {
      const { Workbox } = await import('workbox-window');
      const wb = new Workbox('/sw.js');
      /** @type {ServiceWorkerRegistration} */
      let registration;

      try {
        registration = await wb.register();
      } catch (err) {
        console.error(err);
      }

      if (registration && 'Notification' in window && Notification.permission === 'granted') {
        const registerPushNotifications = await import('flavours/polyam/actions/push_notifications');

        store.dispatch(registerPushNotifications.register());
      }
    }

    perf.stop('main()');
  });
}

export default main;
