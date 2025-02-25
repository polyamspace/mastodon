import { createSelector } from '@reduxjs/toolkit';
import { Record as ImmutableRecord } from 'immutable';

import { me } from 'flavours/polyam/initial_state';
import { accountDefaultValues } from 'flavours/polyam/models/account';
import type { Account, AccountShape } from 'flavours/polyam/models/account';
import type { Relationship } from 'flavours/polyam/models/relationship';
import type { RootState } from 'flavours/polyam/store';

const getAccountBase = (state: RootState, id: string) =>
  state.accounts.get(id, null);

const getAccountRelationship = (state: RootState, id: string) =>
  state.relationships.get(id, null);

const getAccountMoved = (state: RootState, id: string) => {
  const movedToId = state.accounts.get(id)?.moved;

  if (!movedToId) return undefined;

  return state.accounts.get(movedToId);
};

interface FullAccountShape extends Omit<AccountShape, 'moved'> {
  relationship: Relationship | null;
  moved: Account | null;
}

const FullAccountFactory = ImmutableRecord<FullAccountShape>({
  ...accountDefaultValues,
  moved: null,
  relationship: null,
});

export function makeGetAccount() {
  return createSelector(
    [getAccountBase, getAccountRelationship, getAccountMoved],
    (base, relationship, moved) => {
      if (base === null) {
        return null;
      }

      return FullAccountFactory(base)
        .set('relationship', relationship)
        .set('moved', moved ?? null);
    },
  );
}

export const getAccountHidden = createSelector(
  [
    (state: RootState, id: string) => state.accounts.get(id)?.hidden,
    (state: RootState, id: string) =>
      state.relationships.get(id)?.following ||
      state.relationships.get(id)?.requested,
    (state: RootState, id: string) => id === me,
  ],
  (hidden, followingOrRequested, isSelf) => {
    return hidden && !(isSelf || followingOrRequested);
  },
);
