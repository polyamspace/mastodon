import { isServerFeatureEnabled } from '@/flavours/polyam/utils/environment';

export function isRedesignEnabled() {
  return isServerFeatureEnabled('profile_redesign');
}
