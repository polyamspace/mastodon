import { createSelector } from '@reduxjs/toolkit';
import type { Map as ImmutableMap } from 'immutable';

import type { List } from 'flavours/polyam/models/list';
import type { RootState } from 'flavours/polyam/store';

export const getOrderedLists = createSelector(
  [(state: RootState) => state.lists],
  (lists: ImmutableMap<string, List | null>) =>
    lists
      .toList()
      .filter((item: List | null) => !!item)
      .sort((a: List, b: List) => a.title.localeCompare(b.title))
      .toArray(),
);
