import { apiCreate, apiUpdate } from 'flavours/polyam/api/lists';
import type { List } from 'flavours/polyam/models/list';
import { createDataLoadingThunk } from 'flavours/polyam/store/typed_functions';

export const createList = createDataLoadingThunk(
  'list/create',
  (list: Partial<List>) => apiCreate(list),
);

export const updateList = createDataLoadingThunk(
  'list/update',
  (list: Partial<List>) => apiUpdate(list),
);
