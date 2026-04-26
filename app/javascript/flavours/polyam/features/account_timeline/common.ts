import type { AccountFieldShape } from '@/flavours/polyam/models/account';
import { isServerFeatureEnabled } from '@/flavours/polyam/utils/environment';

export function isRedesignEnabled() {
  return isServerFeatureEnabled('profile_redesign');
}

export interface AccountField extends AccountFieldShape {
  nameHasEmojis: boolean;
  value_plain: string;
  valueHasEmojis: boolean;
}
