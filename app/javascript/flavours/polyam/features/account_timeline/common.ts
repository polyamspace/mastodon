import { isClientFeatureEnabled } from '@/flavours/polyam/utils/environment';

export function isRedesignEnabled() {
  return isClientFeatureEnabled('profile_redesign');
}
