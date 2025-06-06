import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';

import { supportsPassiveEvents } from 'detect-passive-events';
import Overlay from 'react-overlays/Overlay';

import ReactIcon from '@/awesome-icons/solid/face-grin-wide.svg?react';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { useSystemEmojiFont } from 'flavours/polyam/initial_state';

import { buildCustomEmojis, categoriesFromEmojis } from '../../emoji/emoji';
import { EmojiPicker as EmojiPickerAsync } from '../../ui/util/async-components';

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search...' },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
  search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
});

let EmojiPicker, Emoji; // load asynchronously

const listenerOptions = supportsPassiveEvents ? { passive: true, capture: true } : true;

const notFoundFn = () => (
  <div className='emoji-mart-no-results'>
    <Emoji
      emoji='sleuth_or_spy'
      size={32}
    />

    <div className='emoji-mart-no-results-label'>
      <FormattedMessage id='emoji_button.not_found' defaultMessage='No matching emojis found' />
    </div>
  </div>
);

class ModifierPickerMenu extends PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  handleClick = e => {
    this.props.onSelect(e.currentTarget.getAttribute('data-index') * 1);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      this.attachListeners();
    } else {
      this.removeListeners();
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
    }
  };

  attachListeners() {
    document.addEventListener('click', this.handleDocumentClick, { capture: true });
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  removeListeners() {
    document.removeEventListener('click', this.handleDocumentClick, { capture: true });
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  };

  render() {
    const { active } = this.props;

    return (
      <div className='emoji-picker-dropdown__modifiers__menu' style={{ display: active ? 'block' : 'none' }} ref={this.setRef}>
        <button type='button' onClick={this.handleClick} data-index={1}><Emoji emoji='fist' size={22} skin={1} native={useSystemEmojiFont} /></button>
        <button type='button' onClick={this.handleClick} data-index={2}><Emoji emoji='fist' size={22} skin={2} native={useSystemEmojiFont} /></button>
        <button type='button' onClick={this.handleClick} data-index={3}><Emoji emoji='fist' size={22} skin={3} native={useSystemEmojiFont} /></button>
        <button type='button' onClick={this.handleClick} data-index={4}><Emoji emoji='fist' size={22} skin={4} native={useSystemEmojiFont} /></button>
        <button type='button' onClick={this.handleClick} data-index={5}><Emoji emoji='fist' size={22} skin={5} native={useSystemEmojiFont} /></button>
        <button type='button' onClick={this.handleClick} data-index={6}><Emoji emoji='fist' size={22} skin={6} native={useSystemEmojiFont} /></button>
      </div>
    );
  }

}

class ModifierPicker extends PureComponent {

  static propTypes = {
    active: PropTypes.bool,
    modifier: PropTypes.number,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    onOpen: PropTypes.func,
  };

  handleClick = () => {
    if (this.props.active) {
      this.props.onClose();
    } else {
      this.props.onOpen();
    }
  };

  handleSelect = modifier => {
    this.props.onChange(modifier);
    this.props.onClose();
  };

  render () {
    const { active, modifier } = this.props;

    return (
      <div className='emoji-picker-dropdown__modifiers'>
        <Emoji emoji='fist'size={22} skin={modifier} onClick={this.handleClick} native={useSystemEmojiFont} />
        <ModifierPickerMenu active={active} onSelect={this.handleSelect} onClose={this.props.onClose} />
      </div>
    );
  }

}

class EmojiPickerMenuImpl extends PureComponent {

  static propTypes = {
    custom_emojis: ImmutablePropTypes.list,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
    loading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onPick: PropTypes.func.isRequired,
    style: PropTypes.object,
    intl: PropTypes.object.isRequired,
    skinTone: PropTypes.number.isRequired,
    onSkinTone: PropTypes.func.isRequired,
    pickerButtonRef: PropTypes.func.isRequired,
    emojiCategories: ImmutablePropTypes.map,
  };

  static defaultProps = {
    style: {},
    loading: true,
    frequentlyUsedEmojis: [],
  };

  state = {
    modifierOpen: false,
    readyToFocus: false,
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target) && !this.props.pickerButtonRef.contains(e.target)) {
      this.props.onClose();
    }
  };

  componentDidMount() {
    document.addEventListener('click', this.handleDocumentClick, { capture: true });
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);

    // Because of https://github.com/react-bootstrap/react-bootstrap/issues/2614 we need
    // to wait for a frame before focusing
    requestAnimationFrame(() => {
      this.setState({ readyToFocus: true });
      if (this.node) {
        const element = this.node.querySelector('input[type="search"]');
        if (element) element.focus();
      }
    });
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDocumentClick, { capture: true });
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  };

  getI18n = () => {
    const { intl } = this.props;

    return {
      search: intl.formatMessage(messages.emoji_search),
      categories: {
        search: intl.formatMessage(messages.search_results),
        recent: intl.formatMessage(messages.recent),
        people: intl.formatMessage(messages.people),
        nature: intl.formatMessage(messages.nature),
        foods: intl.formatMessage(messages.food),
        activity: intl.formatMessage(messages.activity),
        places: intl.formatMessage(messages.travel),
        objects: intl.formatMessage(messages.objects),
        symbols: intl.formatMessage(messages.symbols),
        flags: intl.formatMessage(messages.flags),
        custom: intl.formatMessage(messages.custom),
      },
    };
  };

  handleClick = (emoji, event) => {
    if (!emoji.native) {
      emoji.native = emoji.colons;
    }
    if (!(event.ctrlKey || event.metaKey)) {
      this.props.onClose();
    }
    this.props.onPick(emoji);
  };

  handleModifierOpen = () => {
    this.setState({ modifierOpen: true });
  };

  handleModifierClose = () => {
    this.setState({ modifierOpen: false });
  };

  handleModifierChange = modifier => {
    this.props.onSkinTone(modifier);
  };

  render() {
    const { loading, style, intl, custom_emojis, skinTone, frequentlyUsedEmojis, emojiCategories } = this.props;

    if (loading) {
      return <div style={{ width: 299 }} />;
    }

    const title = intl.formatMessage(messages.emoji);

    const { modifierOpen } = this.state;

    const categoriesSort = [
      'recent',
    ];

    if (emojiCategories.get('people')) {
      categoriesSort.push('people');
    }

    if (emojiCategories.get('nature')) {
      categoriesSort.push('nature');
    }

    if (emojiCategories.get('foods')) {
      categoriesSort.push('foods');
    }

    if (emojiCategories.get('activity')) {
      categoriesSort.push('activity');
    }

    if (emojiCategories.get('places')) {
      categoriesSort.push('places');
    }

    if (emojiCategories.get('objects')) {
      categoriesSort.push('objects');
    }

    if (emojiCategories.get('symbols')) {
      categoriesSort.push('symbols');
    }

    if (emojiCategories.get('flags')) {
      categoriesSort.push('flags');
    }

    categoriesSort.splice(1, 0, ...Array.from(categoriesFromEmojis(custom_emojis)).sort());

    return (
      <div className={classNames('emoji-picker-dropdown__menu', { selecting: modifierOpen })} style={style} ref={this.setRef}>
        <EmojiPicker
          perLine={8}
          emojiSize={22}
          custom={buildCustomEmojis(custom_emojis)}
          color=''
          emoji=''
          title={title}
          i18n={this.getI18n()}
          onClick={this.handleClick}
          include={categoriesSort}
          recent={frequentlyUsedEmojis}
          skin={skinTone}
          showPreview={false}
          showSkinTones={false}
          notFound={notFoundFn}
          autoFocus={this.state.readyToFocus}
          emojiTooltip
          native={useSystemEmojiFont}
        />

        <ModifierPicker
          active={modifierOpen}
          modifier={skinTone}
          onOpen={this.handleModifierOpen}
          onClose={this.handleModifierClose}
          onChange={this.handleModifierChange}
        />
      </div>
    );
  }

}

const EmojiPickerMenu = injectIntl(EmojiPickerMenuImpl);

class EmojiPickerDropdown extends PureComponent {

  static propTypes = {
    custom_emojis: ImmutablePropTypes.list,
    frequentlyUsedEmojis: PropTypes.arrayOf(PropTypes.string),
    intl: PropTypes.object.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    onSkinTone: PropTypes.func.isRequired,
    skinTone: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    inverted: PropTypes.bool,
    emojiCategories: ImmutablePropTypes.map,
  };

  static defaultProps = {
    inverted: true,
  };

  state = {
    active: false,
    loading: false,
    placement: 'bottom',
  };

  setRef = (c) => {
    this.dropdown = c;
  };

  onShowDropdown = () => {
    this.setState({ active: true });

    if (!EmojiPicker) {
      this.setState({ loading: true });

      EmojiPickerAsync().then(EmojiMart => {
        EmojiPicker = EmojiMart.Picker;
        Emoji = EmojiMart.Emoji;

        this.setState({ loading: false });
      }).catch(() => {
        this.setState({ loading: false, active: false });
      });
    }
  };

  onHideDropdown = () => {
    this.setState({ active: false });
  };

  onToggle = (e) => {
    if (!this.state.disabled && !this.state.loading && (!e.key || e.key === 'Enter')) {
      if (this.state.active) {
        this.onHideDropdown();
      } else {
        this.onShowDropdown(e);
      }
    }
  };

  handleKeyDown = e => {
    if (e.key === 'Escape') {
      this.onHideDropdown();
    }
  };

  setTargetRef = c => {
    this.target = c;
  };

  findTarget = () => {
    return this.target;
  };

  handleOverlayEnter = (state) => {
    this.setState({ placement: state.placement });
  };

  render() {
    const { intl, onPickEmoji, onSkinTone, skinTone, frequentlyUsedEmojis, emojiCategories, disabled, inverted } = this.props;
    const title = intl.formatMessage(messages.emoji);
    const { active, loading, placement } = this.state;

    return (
      <div className='emoji-picker-dropdown' onKeyDown={this.handleKeyDown} ref={this.setTargetRef}>
        <IconButton
          title={title}
          aria-expanded={active}
          active={active}
          iconComponent={ReactIcon}
          onClick={this.onToggle}
          disabled={disabled}
          inverted={inverted}
        />

        <Overlay show={active} placement={placement} flip target={this.findTarget} popperConfig={{ strategy: 'fixed', onFirstUpdate: this.handleOverlayEnter }}>
          {({ props, placement }) => (
            <div {...props} style={{ ...props.style }}>
              <div className={`dropdown-animation ${placement}`}>
                <EmojiPickerMenu
                  custom_emojis={this.props.custom_emojis}
                  loading={loading}
                  onClose={this.onHideDropdown}
                  onPick={onPickEmoji}
                  onSkinTone={onSkinTone}
                  skinTone={skinTone}
                  frequentlyUsedEmojis={frequentlyUsedEmojis}
                  pickerButtonRef={this.target}
                  emojiCategories={emojiCategories}
                />
              </div>
            </div>
          )}
        </Overlay>
      </div>
    );
  }

}

export default injectIntl(EmojiPickerDropdown);
