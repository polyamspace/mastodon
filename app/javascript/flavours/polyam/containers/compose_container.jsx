import { Provider } from 'react-redux';

import { fetchCustomEmojis } from 'flavours/polyam/actions/custom_emojis';
import { fetchServer } from 'flavours/polyam/actions/server';
import { hydrateStore } from 'flavours/polyam/actions/store';
import { Router } from 'flavours/polyam/components/router';
import Compose from 'flavours/polyam/features/standalone/compose';
import initialState from 'flavours/polyam/initial_state';
import { IntlProvider } from 'flavours/polyam/locales';
import { store } from 'flavours/polyam/store';

if (initialState) {
  store.dispatch(hydrateStore(initialState));
}

store.dispatch(fetchCustomEmojis());
store.dispatch(fetchServer());

const ComposeContainer = () => (
  <IntlProvider>
    <Provider store={store}>
      <Router>
        <Compose />
      </Router>
    </Provider>
  </IntlProvider>
);

export default ComposeContainer;
