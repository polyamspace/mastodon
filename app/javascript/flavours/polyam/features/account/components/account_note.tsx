import type { ChangeEventHandler, KeyboardEventHandler } from 'react';
import { useCallback, useEffect } from 'react';

import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { faTimes, faCheck, faPencil } from '@fortawesome/free-solid-svg-icons';
import Textarea from 'react-textarea-autosize';

import {
  initEditAccountNote,
  submitAccountNote,
  cancelAccountNote,
  changeAccountNoteComment,
} from 'flavours/polyam/actions/account_notes';
import { IconButton } from 'flavours/polyam/components/icon_button';
import type { Account } from 'flavours/polyam/models/account';
import { useAppDispatch, useAppSelector } from 'flavours/polyam/store';

const messages = defineMessages({
  placeholder: {
    id: 'account_note.glitch_placeholder',
    defaultMessage: 'No comment provided',
  },
  cancel: {
    id: 'account_note.cancel',
    defaultMessage: 'Cancel',
  },
  edit: {
    id: 'account_note.edit',
    defaultMessage: 'Edit',
  },
  save: {
    id: 'account_note.save',
    defaultMessage: 'Save',
  },
});

export const AccountNote: React.FC<{ account: Account }> = ({ account }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const isEditing: boolean = useAppSelector(
    (state) =>
      state.account_notes.getIn(['edit', 'account_id']) === account.get('id'),
  );
  const isSubmitting: boolean = useAppSelector(
    (state) => state.account_notes.getIn(['edit', 'isSubmitting']) as boolean,
  );
  const accountNote = useAppSelector((state) =>
    isEditing
      ? (state.account_notes.getIn(['edit', 'comment']) as string)
      : (account.getIn(['relationship', 'note']) as string),
  );

  const handleChangeAccountNote: ChangeEventHandler<HTMLTextAreaElement> =
    useCallback(
      (e) => {
        dispatch(changeAccountNoteComment({ comment: e.target.value }));
      },
      [dispatch],
    );

  const handleInitEdit = useCallback(() => {
    dispatch(initEditAccountNote(account));
  }, [dispatch, account]);

  const handleSave = useCallback(() => {
    void dispatch(submitAccountNote());
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    dispatch(cancelAccountNote());
  }, [dispatch]);

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  useEffect(() => {
    return () => {
      if (isEditing) handleCancel();
    };
  }, [handleCancel, isEditing]);

  if (!accountNote && !isEditing) {
    return null;
  }

  let action_buttons = null;
  if (isEditing) {
    action_buttons = (
      <div className='account__header__account-note__buttons'>
        <IconButton
          icon='times'
          iconComponent={faTimes}
          size={15}
          title=''
          label={intl.formatMessage(messages.cancel)}
          onClick={handleCancel}
          disabled={isSubmitting}
        />
        <div className='flex-spacer' />
        <IconButton
          icon='check'
          iconComponent={faCheck}
          size={15}
          title=''
          label={intl.formatMessage(messages.save)}
          onClick={handleSave}
          disabled={isSubmitting}
        />
      </div>
    );
  } else {
    action_buttons = (
      <div className='account__header__account-note__buttons'>
        <IconButton
          icon='pencil'
          iconComponent={faPencil}
          size={15}
          title=''
          label={intl.formatMessage(messages.edit)}
          onClick={handleInitEdit}
          disabled={isSubmitting}
        />
      </div>
    );
  }

  let note_container = null;
  if (isEditing) {
    note_container = (
      <Textarea
        className='account__header__account-note__content'
        disabled={isSubmitting}
        placeholder={intl.formatMessage(messages.placeholder)}
        value={accountNote}
        onChange={handleChangeAccountNote}
        onKeyDown={handleKeyDown}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- This rule is disabled for js/jsx files
        autoFocus
      />
    );
  } else {
    note_container = (
      <div className='account__header__account-note__content'>
        {accountNote}
      </div>
    );
  }

  return (
    <div className='account__header__account-note'>
      <div className='account__header__account-note__header'>
        <strong>
          <FormattedMessage
            id='account.account_note_header'
            defaultMessage='Note'
          />
        </strong>
        {action_buttons}
      </div>
      {note_container}
    </div>
  );
};
