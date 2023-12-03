//  Package imports.
import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { faArrowCircleDown, faCloudUpload, faCode, faEllipsisH, faFileText, faPaintBrush, faPaperclip, faTasksAlt } from '@fortawesome/free-solid-svg-icons';
import Toggle from 'react-toggle';


//  Components.
import { IconButton } from 'flavours/polyam/components/icon_button';
import { pollLimits } from 'flavours/polyam/initial_state';

import DropdownContainer from '../containers/dropdown_container';
import LanguageDropdown from '../containers/language_dropdown_container';
import PrivacyDropdownContainer from '../containers/privacy_dropdown_container';

import TextIconButton from './text_icon_button';



//  Utils.

//  Messages.
const messages = defineMessages({
  advanced_options_icon_title: {
    defaultMessage: 'Advanced options',
    id: 'advanced_options.icon_title',
  },
  attach: {
    defaultMessage: 'Attach...',
    id: 'compose.attach',
  },
  content_type: {
    defaultMessage: 'Content type',
    id: 'content-type.change',
  },
  doodle: {
    defaultMessage: 'Draw something',
    id: 'compose.attach.doodle',
  },
  html: {
    defaultMessage: 'HTML',
    id: 'compose.content-type.html',
  },
  local_only_long: {
    defaultMessage: 'Do not post to other instances',
    id: 'advanced_options.local-only.long',
  },
  local_only_short: {
    defaultMessage: 'Local-only',
    id: 'advanced_options.local-only.short',
  },
  markdown: {
    defaultMessage: 'Markdown',
    id: 'compose.content-type.markdown',
  },
  plain: {
    defaultMessage: 'Plain text',
    id: 'compose.content-type.plain',
  },
  spoiler: {
    defaultMessage: 'Hide text behind warning',
    id: 'compose_form.spoiler',
  },
  threaded_mode_long: {
    defaultMessage: 'Automatically opens a reply on posting',
    id: 'advanced_options.threaded_mode.long',
  },
  threaded_mode_short: {
    defaultMessage: 'Threaded mode',
    id: 'advanced_options.threaded_mode.short',
  },
  upload: {
    defaultMessage: 'Upload a file',
    id: 'compose.attach.upload',
  },
  add_poll: {
    defaultMessage: 'Add a poll',
    id: 'poll_button.add_poll',
  },
  remove_poll: {
    defaultMessage: 'Remove poll',
    id: 'poll_button.remove_poll',
  },
});

const mapStateToProps = (state, { name }) => ({
  checked: state.getIn(['compose', 'advanced_options', name]),
});

class ToggleOptionImpl extends ImmutablePureComponent {

  static propTypes = {
    name: PropTypes.string.isRequired,
    checked: PropTypes.bool,
    onChangeAdvancedOption: PropTypes.func.isRequired,
  };

  handleChange = () => {
    this.props.onChangeAdvancedOption(this.props.name);
  };

  render() {
    const { meta, text, checked } = this.props;

    return (
      <>
        <Toggle checked={checked} onChange={this.handleChange} />

        <div className='privacy-dropdown__option__content'>
          <strong>{text}</strong>
          {meta}
        </div>
      </>
    );
  }

}

const ToggleOption = connect(mapStateToProps)(ToggleOptionImpl);

class ComposerOptions extends ImmutablePureComponent {

  static propTypes = {
    acceptContentTypes: PropTypes.string,
    advancedOptions: ImmutablePropTypes.map,
    disabled: PropTypes.bool,
    allowMedia: PropTypes.bool,
    allowPoll: PropTypes.bool,
    hasPoll: PropTypes.bool,
    intl: PropTypes.object.isRequired,
    onChangeAdvancedOption: PropTypes.func,
    onChangeContentType: PropTypes.func,
    onTogglePoll: PropTypes.func,
    onDoodleOpen: PropTypes.func,
    onToggleSpoiler: PropTypes.func,
    onUpload: PropTypes.func,
    contentType: PropTypes.string,
    resetFileKey: PropTypes.number,
    spoiler: PropTypes.bool,
    showContentTypeChoice: PropTypes.bool,
    isEditing: PropTypes.bool,
  };

  //  Handles file selection.
  handleChangeFiles = ({ target: { files } }) => {
    const { onUpload } = this.props;
    if (files.length && onUpload) {
      onUpload(files);
    }
  };

  //  Handles attachment clicks.
  handleClickAttach = (name) => {
    const { fileElement } = this;
    const { onDoodleOpen } = this.props;

    //  We switch over the name of the option.
    switch (name) {
    case 'upload':
      if (fileElement) {
        fileElement.click();
      }
      return;
    case 'doodle':
      if (onDoodleOpen) {
        onDoodleOpen();
      }
      return;
    }
  };

  //  Handles a ref to the file input.
  handleRefFileElement = (fileElement) => {
    this.fileElement = fileElement;
  };

  renderToggleItemContents = (item) => {
    const { onChangeAdvancedOption } = this.props;
    const { name, meta, text } = item;

    return <ToggleOption name={name} text={text} meta={meta} onChangeAdvancedOption={onChangeAdvancedOption} />;
  };

  //  Rendering.
  render () {
    const {
      acceptContentTypes,
      advancedOptions,
      contentType,
      disabled,
      allowMedia,
      allowPoll,
      hasPoll,
      onChangeAdvancedOption,
      onChangeContentType,
      onTogglePoll,
      onToggleSpoiler,
      resetFileKey,
      spoiler,
      showContentTypeChoice,
      isEditing,
      intl: { formatMessage },
    } = this.props;

    const contentTypeItems = {
      plain: {
        icon: 'file-text',
        iconComponent: faFileText,
        name: 'text/plain',
        text: formatMessage(messages.plain),
      },
      html: {
        icon: 'code',
        iconComponent: faCode,
        name: 'text/html',
        text: formatMessage(messages.html),
      },
      markdown: {
        icon: 'arrow-circle-down',
        iconComponent: faArrowCircleDown,
        name: 'text/markdown',
        text: formatMessage(messages.markdown),
      },
    };

    //  The result.
    return (
      <div className='compose-form__buttons'>
        <input
          accept={acceptContentTypes}
          disabled={disabled || !allowMedia}
          key={resetFileKey}
          onChange={this.handleChangeFiles}
          ref={this.handleRefFileElement}
          type='file'
          multiple
          style={{ display: 'none' }}
        />
        <DropdownContainer
          disabled={disabled || !allowMedia}
          icon='paperclip'
          iconComponent={faPaperclip}
          items={[
            {
              icon: 'cloud-upload',
              iconComponent: faCloudUpload,
              name: 'upload',
              text: formatMessage(messages.upload),
            },
            {
              icon: 'paint-brush',
              iconComponent: faPaintBrush,
              name: 'doodle',
              text: formatMessage(messages.doodle),
            },
          ]}
          onChange={this.handleClickAttach}
          title={formatMessage(messages.attach)}
        />
        {!!pollLimits && (
          <IconButton
            active={hasPoll}
            disabled={disabled || !allowPoll}
            icon='tasks'
            iconComponent={faTasksAlt}
            inverted
            onClick={onTogglePoll}
            size={18}
            style={{
              height: null,
              lineHeight: null,
            }}
            title={formatMessage(hasPoll ? messages.remove_poll : messages.add_poll)}
          />
        )}
        <hr />
        <PrivacyDropdownContainer disabled={disabled || isEditing} />
        {showContentTypeChoice && (
          <DropdownContainer
            disabled={disabled}
            icon={(contentTypeItems[contentType.split('/')[1]] || {}).icon}
            iconComponent={(contentTypeItems[contentType.split('/')[1]] || {}).iconComponent}
            items={[
              contentTypeItems.plain,
              contentTypeItems.html,
              contentTypeItems.markdown,
            ]}
            onChange={onChangeContentType}
            title={formatMessage(messages.content_type)}
            value={contentType}
          />
        )}
        {onToggleSpoiler && (
          <TextIconButton
            active={spoiler}
            ariaControls='glitch.composer.spoiler.input'
            label='CW'
            onClick={onToggleSpoiler}
            title={formatMessage(messages.spoiler)}
          />
        )}
        <LanguageDropdown />
        <DropdownContainer
          disabled={disabled || isEditing}
          icon='ellipsis-h'
          iconComponent={faEllipsisH}
          items={advancedOptions ? [
            {
              meta: formatMessage(messages.local_only_long),
              name: 'do_not_federate',
              text: formatMessage(messages.local_only_short),
            },
            {
              meta: formatMessage(messages.threaded_mode_long),
              name: 'threaded_mode',
              text: formatMessage(messages.threaded_mode_short),
            },
          ] : null}
          onChange={onChangeAdvancedOption}
          renderItemContents={this.renderToggleItemContents}
          title={formatMessage(messages.advanced_options_icon_title)}
          closeOnChange={false}
        />
      </div>
    );
  }

}

export default injectIntl(ComposerOptions);