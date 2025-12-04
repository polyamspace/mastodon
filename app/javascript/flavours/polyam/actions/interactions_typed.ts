import {
  apiReblog,
  apiUnreblog,
  apiRevokeQuote,
  apiGetQuotes,
  apiReact,
  apiUnreact,
  apiGetReactions,
} from 'flavours/polyam/api/interactions';
import type { StatusVisibility } from 'flavours/polyam/models/status';
import { createDataLoadingThunk } from 'flavours/polyam/store/typed_functions';

import { fetchRelationships } from './accounts';
import {
  importFetchedAccounts,
  importFetchedStatus,
  importFetchedStatuses,
} from './importer';

export const reblog = createDataLoadingThunk(
  'status/reblog',
  ({
    statusId,
    visibility,
  }: {
    statusId: string;
    visibility: StatusVisibility;
  }) => apiReblog(statusId, visibility),
  (data, { dispatch, discardLoadData }) => {
    // The reblog API method returns a new status wrapped around the original. In this case we are only
    // interested in how the original is modified, hence passing it skipping the wrapper
    dispatch(importFetchedStatus(data.reblog));

    // The payload is not used in any actions
    return discardLoadData;
  },
);

export const unreblog = createDataLoadingThunk(
  'status/unreblog',
  ({ statusId }: { statusId: string }) => apiUnreblog(statusId),
  (data, { dispatch, discardLoadData }) => {
    dispatch(importFetchedStatus(data));

    // The payload is not used in any actions
    return discardLoadData;
  },
);

export const revokeQuote = createDataLoadingThunk(
  'status/revoke_quote',
  ({
    statusId,
    quotedStatusId,
  }: {
    statusId: string;
    quotedStatusId: string;
  }) => apiRevokeQuote(quotedStatusId, statusId),
  (data, { dispatch, discardLoadData }) => {
    dispatch(importFetchedStatus(data));

    return discardLoadData;
  },
);

export const fetchQuotes = createDataLoadingThunk(
  'status/fetch_quotes',
  async ({ statusId, next }: { statusId: string; next?: string }) => {
    const { links, statuses } = await apiGetQuotes(statusId, next);

    return {
      links,
      statuses,
      replace: !next,
    };
  },
  (payload, { dispatch }) => {
    dispatch(importFetchedStatuses(payload.statuses));
  },
);

// Polyam: Reactions

export const react = createDataLoadingThunk(
  'status/react',
  ({ statusId, name, url }: { statusId: string; name: string; url?: string }) =>
    apiReact(statusId, name, url),
  (data, { dispatch, discardLoadData }) => {
    dispatch(importFetchedStatus(data));

    return discardLoadData;
  },
);

export const unreact = createDataLoadingThunk(
  'status/unreact',
  ({ statusId, name }: { statusId: string; name: string }) =>
    apiUnreact(statusId, name),
  (data, { dispatch, discardLoadData }) => {
    dispatch(importFetchedStatus(data));

    return discardLoadData;
  },
);

export const fetchReactions = createDataLoadingThunk(
  'status/fetch_reactions',
  async ({ statusId, next }: { statusId: string; next?: string }) => {
    const { links, accounts } = await apiGetReactions(statusId, next);

    return {
      links,
      accounts,
      replace: !next,
    };
  },
  (payload, { dispatch }) => {
    dispatch(importFetchedAccounts(payload.accounts));
    dispatch(fetchRelationships(payload.accounts.map((item) => item.id)));
  },
);
