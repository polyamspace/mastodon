import { apiSubmitAccountNote } from 'flavours/polyam/api/accounts';
import { createDataLoadingThunk } from 'flavours/polyam/store/typed_functions';

export const submitAccountNote = createDataLoadingThunk(
  'account_note/submit',
  ({ accountId, note }: { accountId: string; note: string }) =>
    apiSubmitAccountNote(accountId, note),
  (relationship) => ({ relationship }),
);
