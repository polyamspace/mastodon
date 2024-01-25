import 'packs/public-path';
import { createRoot } from 'react-dom/client';

import ComposeContainer from 'flavours/polyam/containers/compose_container';
import { loadPolyfills } from 'flavours/polyam/polyfills';
import ready from 'flavours/polyam/ready';

function loaded() {
  const mountNode = document.getElementById('mastodon-compose');

  if (mountNode) {
    const attr = mountNode.getAttribute('data-props');

    if(!attr) return;

    const props = JSON.parse(attr);
    const root = createRoot(mountNode);

    root.render(<ComposeContainer {...props} />);
  }
}

function main() {
  ready(loaded);
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
