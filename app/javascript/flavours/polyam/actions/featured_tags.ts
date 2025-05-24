import { apiGetFeaturedTags } from 'flavours/polyam/api/accounts';
import { createDataLoadingThunk } from 'flavours/polyam/store/typed_functions';

export const fetchFeaturedTags = createDataLoadingThunk(
  'accounts/featured_tags',
  ({ accountId }: { accountId: string }) => apiGetFeaturedTags(accountId),
);
