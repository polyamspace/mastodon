import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import FileArrowUpIcon from '@/awesome-icons/solid/file-arrow-up.svg?react';
import PaintBrushIcon from '@/awesome-icons/solid/paintbrush.svg?react';
import PaperClipIcon from '@/awesome-icons/solid/paperclip.svg?react';

import { DropdownIconButton } from './dropdown_icon_button';

const messages = defineMessages({
  upload: { id: 'upload_button.label', defaultMessage: 'Add images, a video or an audio file' },
  doodle: { id: 'compose.attach.doodle', defaultMessage: 'Draw something' },
});

const makeMapStateToProps = () => {
  const mapStateToProps = state => ({
    acceptContentTypes: state.getIn(['media_attachments', 'accept_content_types']),
  });

  return mapStateToProps;
};

class UploadButton extends ImmutablePureComponent {

  static propTypes = {
    disabled: PropTypes.bool,
    onSelectFile: PropTypes.func.isRequired,
    onDoodleOpen: PropTypes.func.isRequired,
    style: PropTypes.object,
    resetFileKey: PropTypes.number,
    acceptContentTypes: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
    intl: PropTypes.object.isRequired,
  };

  handleChange = (e) => {
    if (e.target.files.length > 0) {
      this.props.onSelectFile(e.target.files);
    }
  };

  handleSelect = (value) => {
    if (value === 'upload') {
      this.fileElement.click();
    } else {
      this.props.onDoodleOpen();
    }
  };

  setRef = (c) => {
    this.fileElement = c;
  };

  render () {
    const { intl, resetFileKey, disabled, acceptContentTypes } = this.props;

    const message = intl.formatMessage(messages.upload);

    const options = [
      {
        icon: 'file-arrow-up',
        iconComponent: FileArrowUpIcon,
        value: 'upload',
        text: intl.formatMessage(messages.upload),
      },
      {
        icon: 'paint-brush',
        iconComponent: PaintBrushIcon,
        value: 'doodle',
        text: intl.formatMessage(messages.doodle),
      },
    ];

    return (
      <div className='compose-form__upload-button'>
        <DropdownIconButton
          icon='paperclip'
          iconComponent={PaperClipIcon}
          title={message}
          disabled={disabled}
          onChange={this.handleSelect}
          value='upload'
          options={options}
        />
        <label>
          <span style={{ display: 'none' }}>{message}</span>
          <input
            key={resetFileKey}
            ref={this.setRef}
            type='file'
            name='file-upload-input'
            multiple
            accept={acceptContentTypes.toArray().join(',')}
            onChange={this.handleChange}
            disabled={disabled}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    );
  }

}

export default connect(makeMapStateToProps)(injectIntl(UploadButton));
