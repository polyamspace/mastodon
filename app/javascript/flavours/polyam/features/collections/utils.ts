import {
  isClientFeatureEnabled,
  isServerFeatureEnabled,
} from '@/flavours/polyam/utils/environment';

export function areCollectionsEnabled() {
  return (
    isClientFeatureEnabled('collections') &&
    isServerFeatureEnabled('collections')
  );
}
