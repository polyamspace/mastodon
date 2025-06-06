import { createAction } from '@reduxjs/toolkit';

import { apiGetSearch } from 'flavours/polyam/api/search';
import type { ApiSearchType } from 'flavours/polyam/api_types/search';
import type {
  RecentSearch,
  SearchType as RecentSearchType,
} from 'flavours/polyam/models/search';
import { searchHistory } from 'flavours/polyam/settings';
import {
  createDataLoadingThunk,
  createAppAsyncThunk,
} from 'flavours/polyam/store/typed_functions';

import { fetchRelationships } from './accounts';
import { importFetchedAccounts, importFetchedStatuses } from './importer';

export const SEARCH_HISTORY_UPDATE = 'SEARCH_HISTORY_UPDATE';

export const submitSearch = createDataLoadingThunk(
  'search/submit',
  async ({ q, type }: { q: string; type?: ApiSearchType }, { getState }) => {
    const signedIn = !!getState().meta.get('me');

    return apiGetSearch({
      q,
      type,
      resolve: signedIn,
      limit: 11,
    });
  },
  (data, { dispatch }) => {
    if (data.accounts.length > 0) {
      dispatch(importFetchedAccounts(data.accounts));
      dispatch(fetchRelationships(data.accounts.map((account) => account.id)));
    }

    if (data.statuses.length > 0) {
      dispatch(importFetchedStatuses(data.statuses));
    }

    return data;
  },
  {
    useLoadingBar: false,
  },
);

export const expandSearch = createDataLoadingThunk(
  'search/expand',
  async ({ type }: { type: ApiSearchType }, { getState }) => {
    const q = getState().search.q;
    const results = getState().search.results;
    const offset = results?.[type].length;

    return apiGetSearch({
      q,
      type,
      limit: 10,
      offset,
    });
  },
  (data, { dispatch }) => {
    if (data.accounts.length > 0) {
      dispatch(importFetchedAccounts(data.accounts));
      dispatch(fetchRelationships(data.accounts.map((account) => account.id)));
    }

    if (data.statuses.length > 0) {
      dispatch(importFetchedStatuses(data.statuses));
    }

    return data;
  },
  {
    useLoadingBar: true,
  },
);

export const openURL = createDataLoadingThunk(
  'search/openURL',
  ({ url }: { url: string }, { getState }) => {
    const signedIn = !!getState().meta.get('me');

    return apiGetSearch({
      q: url,
      resolve: signedIn,
      limit: 1,
    });
  },
  (data, { dispatch }) => {
    if (data.accounts.length > 0) {
      dispatch(importFetchedAccounts(data.accounts));
    } else if (data.statuses.length > 0) {
      dispatch(importFetchedStatuses(data.statuses));
    }

    return data;
  },
  {
    useLoadingBar: true,
  },
);

export const clickSearchResult = createAppAsyncThunk(
  'search/clickResult',
  (
    { q, type }: { q: string; type?: RecentSearchType },
    { dispatch, getState },
  ) => {
    const previous = getState().search.recent;

    if (previous.some((x) => x.q === q && x.type === type)) {
      return;
    }

    const me = getState().meta.get('me') as string;
    const current = [{ type, q }, ...previous].slice(0, 4);

    searchHistory.set(me, current);
    dispatch(updateSearchHistory(current));
  },
);

export const forgetSearchResult = createAppAsyncThunk(
  'search/forgetResult',
  (
    { q, type }: { q: string; type?: RecentSearchType },
    { dispatch, getState },
  ) => {
    const previous = getState().search.recent;
    const me = getState().meta.get('me') as string;
    const current = previous.filter(
      (result) => result.q !== q || result.type !== type,
    );

    searchHistory.set(me, current);
    dispatch(updateSearchHistory(current));
  },
);

export const updateSearchHistory = createAction<RecentSearch[]>(
  'search/updateHistory',
);

export const hydrateSearch = createAppAsyncThunk(
  'search/hydrate',
  (_args, { dispatch, getState }) => {
    const me = getState().meta.get('me') as string;
    const history = searchHistory.get(me) as RecentSearch[] | null;

    if (history !== null) {
      dispatch(updateSearchHistory(history));
    }
  },
);
