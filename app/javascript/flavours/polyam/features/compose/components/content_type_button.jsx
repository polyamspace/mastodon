import { useCallback } from 'react';

import { useIntl, defineMessages } from 'react-intl';

import MarkdownIcon from '@/awesome-icons/brands/markdown.svg?react';
import CodeIcon from '@/awesome-icons/solid/code.svg?react';
import TextFileIcon from '@/awesome-icons/solid/file-lines.svg?react';
import { changeComposeContentType } from 'flavours/polyam/actions/compose';
import { useAppSelector, useAppDispatch } from 'flavours/polyam/store';

import { DropdownIconButton } from './dropdown_icon_button';

const messages = defineMessages({
  change_content_type: { id: 'compose.content-type.change', defaultMessage: 'Change advanced formatting options' },
  plain_text_label: { id: 'compose.content-type.plain', defaultMessage: 'Plain text' },
  plain_text_meta: { id: 'compose.content-type.plain_meta', defaultMessage: 'Write with no advanced formatting' },
  markdown_label: { id: 'compose.content-type.markdown', defaultMessage: 'Markdown' },
  markdown_meta: { id: 'compose.content-type.markdown_meta', defaultMessage: 'Format your posts using Markdown' },
  html_label: { id: 'compose.content-type.html', defaultMessage: 'HTML' },
  html_meta: { id: 'compose.content-type.html_meta', defaultMessage: 'Format your posts using HTML' },
});

export const ContentTypeButton = () => {
  const intl = useIntl();

  const showButton = useAppSelector((state) => state.getIn(['local_settings', 'show_content_type_choice']));
  const contentType = useAppSelector((state) => state.getIn(['compose', 'content_type']));
  const dispatch = useAppDispatch();

  const handleChange = useCallback((value) => {
    dispatch(changeComposeContentType(value));
  }, [dispatch]);

  if (!showButton) {
    return null;
  }

  const options = [
    { icon: 'file-text', iconComponent: TextFileIcon, value: 'text/plain', text: intl.formatMessage(messages.plain_text_label), meta: intl.formatMessage(messages.plain_text_meta) },
    { icon: 'arrow-circle-down', iconComponent: MarkdownIcon, value: 'text/markdown', text: intl.formatMessage(messages.markdown_label), meta: intl.formatMessage(messages.markdown_meta) },
    { icon: 'code', iconComponent: CodeIcon,  value: 'text/html', text: intl.formatMessage(messages.html_label), meta: intl.formatMessage(messages.html_meta) },
  ];

  const icon = {
    'text/plain': 'file-text',
    'text/markdown': 'arrow-circle-down',
    'text/html': 'code',
  }[contentType];

  const iconComponent = {
    'text/plain': TextFileIcon,
    'text/markdown': MarkdownIcon,
    'text/html': CodeIcon,
  }[contentType];

  return (
    <DropdownIconButton
      icon={icon}
      iconComponent={iconComponent}
      onChange={handleChange}
      options={options}
      title={intl.formatMessage(messages.change_content_type)}
      value={contentType}
    />
  );
};
