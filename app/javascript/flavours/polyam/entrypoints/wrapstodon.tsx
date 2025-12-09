import { createRoot } from 'react-dom/client';

import { Provider as ReduxProvider } from 'react-redux';

import { importFetchedStatuses } from '@/flavours/polyam/actions/importer';
import { hydrateStore } from '@/flavours/polyam/actions/store';
import type { ApiAnnualReportResponse } from '@/flavours/polyam/api/annual_report';
import { Router } from '@/flavours/polyam/components/router';
import { WrapstodonSharedPage } from '@/flavours/polyam/features/annual_report/shared_page';
import { IntlProvider, loadLocale } from '@/flavours/polyam/locales';
import { loadPolyfills } from '@/flavours/polyam/polyfills';
import ready from '@/flavours/polyam/ready';
import { setReport } from '@/flavours/polyam/reducers/slices/annual_report';
import { store } from '@/flavours/polyam/store';

function loaded() {
  const mountNode = document.getElementById('wrapstodon');
  if (!mountNode) {
    throw new Error('Mount node not found');
  }
  const propsNode = document.getElementById('wrapstodon-data');
  if (!propsNode) {
    throw new Error('Initial state prop not found');
  }

  const initialState = JSON.parse(
    propsNode.textContent,
  ) as ApiAnnualReportResponse;

  const report = initialState.annual_reports[0];
  if (!report) {
    throw new Error('Initial state report not found');
  }

  // Set up store
  store.dispatch(
    hydrateStore({
      meta: { locale: document.documentElement.lang },
      accounts: initialState.accounts,
    }),
  );
  store.dispatch(importFetchedStatuses(initialState.statuses));

  store.dispatch(setReport(report));

  const root = createRoot(mountNode);
  root.render(
    <IntlProvider>
      <ReduxProvider store={store}>
        <Router>
          <WrapstodonSharedPage />
        </Router>
      </ReduxProvider>
    </IntlProvider>,
  );
}

loadPolyfills()
  .then(loadLocale)
  .then(() => ready(loaded))
  .catch((err: unknown) => {
    console.error(err);
  });
