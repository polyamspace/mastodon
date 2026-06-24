import { isServerFeatureEnabled } from '@/flavours/polyam/utils/environment';

export function areCollectionsEnabled() {
  return isServerFeatureEnabled('collections');
}
