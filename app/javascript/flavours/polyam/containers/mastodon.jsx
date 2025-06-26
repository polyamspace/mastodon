import { PureComponent } from 'react';

import { Helmet } from 'react-helmet';
import { Route } from 'react-router-dom';

import { Provider as ReduxProvider } from 'react-redux';

import { ScrollContext } from 'react-router-scroll-4';

import { fetchCustomEmojis } from 'flavours/polyam/actions/custom_emojis';
import { checkDeprecatedLocalSettings } from 'flavours/polyam/actions/local_settings';
import { hydrateStore } from 'flavours/polyam/actions/store';
import { connectUserStream } from 'flavours/polyam/actions/streaming';
import ErrorBoundary from 'flavours/polyam/components/error_boundary';
import { Router } from 'flavours/polyam/components/router';
import UI from 'flavours/polyam/features/ui';
import { IdentityContext, createIdentityContext} from 'flavours/polyam/identity_context';
import initialState, { title as siteTitle } from 'flavours/polyam/initial_state';
import { IntlProvider } from 'flavours/polyam/locales';
import { store } from 'flavours/polyam/store';
import { isProduction } from 'flavours/polyam/utils/environment';
import { BodyScrollLock } from 'flavours/polyam/features/ui/components/body_scroll_lock';

const title = isProduction() ? siteTitle : `${siteTitle} (Dev)`;

const hydrateAction = hydrateStore(initialState);

store.dispatch(hydrateAction);

// check for deprecated local settings
store.dispatch(checkDeprecatedLocalSettings());

if (initialState.meta.me) {
  store.dispatch(fetchCustomEmojis());
}

export default class Mastodon extends PureComponent {
  identity = createIdentityContext(initialState);

  componentDidMount() {
    if (this.identity.signedIn) {
      this.disconnect = store.dispatch(connectUserStream());
    }
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  shouldUpdateScroll (prevRouterProps, { location }) {
    return !(location.state?.mastodonModalKey && location.state?.mastodonModalKey !== prevRouterProps?.location?.state?.mastodonModalKey);
  }

  render () {
    return (
      <IdentityContext.Provider value={this.identity}>
        <IntlProvider>
          <ReduxProvider store={store}>
            <ErrorBoundary>
              <Router>
                <ScrollContext shouldUpdateScroll={this.shouldUpdateScroll}>
                  <Route path='/' component={UI} />
                </ScrollContext>
                <BodyScrollLock />
              </Router>

              <Helmet defaultTitle={title} titleTemplate={`%s - ${title}`} />
            </ErrorBoundary>
          </ReduxProvider>
        </IntlProvider>
      </IdentityContext.Provider>
    );
  }

}
