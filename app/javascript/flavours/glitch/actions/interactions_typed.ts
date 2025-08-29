import {
  apiReblog,
  apiUnreblog,
  apiRevokeQuote,
} from 'flavours/glitch/api/interactions';
import type { StatusVisibility } from 'flavours/glitch/models/status';
import { createDataLoadingThunk } from 'flavours/glitch/store/typed_functions';

import { importFetchedStatus } from './importer';

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
