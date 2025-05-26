import { createRoot } from 'react-dom/client';

import ComposeContainer from 'flavours/glitch/containers/compose_container';
import { loadPolyfills } from 'flavours/glitch/polyfills';
import ready from 'flavours/glitch/ready';

function loaded() {
  const mountNode = document.getElementById('mastodon-compose');

  if (mountNode) {
    const attr = mountNode.getAttribute('data-props');

    if (!attr) return;

    const props = JSON.parse(attr) as object;
    const root = createRoot(mountNode);

    root.render(<ComposeContainer {...props} />);
  }
}

function main() {
  ready(loaded).catch((error: unknown) => {
    console.error(error);
  });
}

loadPolyfills()
  .then(main)
  .catch((error: unknown) => {
    console.error(error);
  });
