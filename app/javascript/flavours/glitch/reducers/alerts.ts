import { createReducer } from '@reduxjs/toolkit';

import {
  showAlert,
  dismissAlert,
  clearAlerts,
} from 'flavours/glitch/actions/alerts';
import type { Alert } from 'flavours/glitch/models/alert';

const initialState: Alert[] = [];

let id = 0;

export const alertsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(showAlert, (state, { payload }) => {
      state.push({
        key: id++,
        ...payload,
      });
    })
    .addCase(dismissAlert, (state, { payload: { key } }) => {
      return state.filter((item) => item.key !== key);
    })
    .addCase(clearAlerts, () => {
      return [];
    });
});
