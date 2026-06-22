import { apiRequestGet } from 'flavours/polyam/api';
import type {
  ApiSearchType,
  ApiSearchResultsJSON,
} from 'flavours/polyam/api_types/search';

export const apiGetSearch = (
  params: {
    q: string;
    resolve?: boolean;
    type?: ApiSearchType;
    limit?: number;
    offset?: number;
  },
  options: {
    signal?: AbortSignal;
  } = {},
) =>
  apiRequestGet<ApiSearchResultsJSON>(
    'v2/search',
    {
      ...params,
    },
    options,
  );
