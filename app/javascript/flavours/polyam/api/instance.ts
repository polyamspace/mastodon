import { apiRequestGet } from 'flavours/polyam/api';
import type {
  ApiTermsOfServiceJSON,
  ApiPrivacyPolicyJSON,
} from 'flavours/polyam/api_types/instance';

export const apiGetTermsOfService = (version?: string) =>
  apiRequestGet<ApiTermsOfServiceJSON>(
    version
      ? `v1/instance/terms_of_service/${version}`
      : 'v1/instance/terms_of_service',
  );

export const apiGetPrivacyPolicy = () =>
  apiRequestGet<ApiPrivacyPolicyJSON>('v1/instance/privacy_policy');
