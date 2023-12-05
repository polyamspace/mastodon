import PropTypes from 'prop-types';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { faCheck, faPencil, faTimes } from '@fortawesome/free-solid-svg-icons';
import Textarea from 'react-textarea-autosize';

import { IconButton } from 'flavours/polyam/components/icon_button';

const messages = defineMessages({
  placeholder: { id: 'account_note.glitch_placeholder', defaultMessage: 'No comment provided' },
});

class Header extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.record.isRequired,
    isEditing: PropTypes.bool,
    isSubmitting: PropTypes.bool,
    accountNote: PropTypes.string,
    onEditAccountNote: PropTypes.func.isRequired,
    onCancelAccountNote: PropTypes.func.isRequired,
    onSaveAccountNote: PropTypes.func.isRequired,
    onChangeAccountNote: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleChangeAccountNote = (e) => {
    this.props.onChangeAccountNote(e.target.value);
  };

  componentWillUnmount () {
    if (this.props.isEditing) {
      this.props.onCancelAccountNote();
    }
  }

  handleKeyDown = e => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.props.onSaveAccountNote();
    } else if (e.keyCode === 27) {
      this.props.onCancelAccountNote();
    }
  };

  render () {
    const { account, accountNote, isEditing, isSubmitting, intl } = this.props;

    if (!account || (!accountNote && !isEditing)) {
      return null;
    }

    let action_buttons = null;
    if (isEditing) {
      action_buttons = (
        <div className='account__header__account-note__buttons'>
          <IconButton icon='times' iconComponent={faTimes} size={15} label={<FormattedMessage id='account_note.cancel' defaultMessage='Cancel' />} onClick={this.props.onCancelAccountNote} disabled={isSubmitting} />
          <div className='flex-spacer' />
          <IconButton icon='check' iconComponent={faCheck} size={15} label={<FormattedMessage id='account_note.save' defaultMessage='Save' />} onClick={this.props.onSaveAccountNote} disabled={isSubmitting} />
        </div>
      );
    } else {
      action_buttons = (
        <div className='account__header__account-note__buttons'>
          <IconButton icon='pencil' iconComponent={faPencil} size={15} label={<FormattedMessage id='account_note.edit' defaultMessage='Edit' />} onClick={this.props.onEditAccountNote} disabled={isSubmitting} />
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
          onChange={this.handleChangeAccountNote}
          onKeyDown={this.handleKeyDown}
          autoFocus
        />
      );
    } else {
      note_container = (<div className='account__header__account-note__content'>{accountNote}</div>);
    }

    return (
      <div className='account__header__account-note'>
        <div className='account__header__account-note__header'>
          <strong><FormattedMessage id='account.account_note_header' defaultMessage='Note' /></strong>
          {action_buttons}
        </div>
        {note_container}
      </div>
    );
  }

}

export default injectIntl(Header);
