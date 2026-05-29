import type { ApiAccountJSON } from '@/flavours/polyam/api_types/accounts';
import type { Account } from '@/flavours/polyam/models/account';
import { isServerFeatureEnabled } from '@/flavours/polyam/utils/environment';

export function areCollectionsEnabled() {
  return isServerFeatureEnabled('collections');
}

export const getCollectionPath = (id: string) => `/collections/${id}`;

export const canAccountBeAdded = (account: ApiAccountJSON | Account) =>
  ['automatic', 'manual'].includes(account.feature_approval.current_user);

export const canAccountBeAddedByFollowers = (
  account: ApiAccountJSON | Account,
) =>
  account.feature_approval.automatic.includes('followers') ||
  account.feature_approval.manual.includes('followers');
