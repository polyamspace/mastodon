import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { injectIntl, defineMessages } from 'react-intl';

import classNames from 'classnames';

import { supportsPassiveEvents } from 'detect-passive-events';
import fuzzysort from 'fuzzysort';
import Overlay from 'react-overlays/Overlay';

import CircleCloseIcon from '@/awesome-icons/solid/circle-xmark.svg?react';
import LanguageIcon from '@/awesome-icons/solid/language.svg?react';
import SearchIcon from '@/awesome-icons/solid/magnifying-glass.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { languages as preloadedLanguages } from 'flavours/polyam/initial_state';

const messages = defineMessages({
  changeLanguage: { id: 'compose.language.change', defaultMessage: 'Change language' },
  search: { id: 'compose.language.search', defaultMessage: 'Search languages...' },
  clear: { id: 'emoji_button.clear', defaultMessage: 'Clear' },
});

const listenerOptions = supportsPassiveEvents ? { passive: true, capture: true } : true;

class LanguageDropdownMenu extends PureComponent {

  static propTypes = {
    value: PropTypes.string.isRequired,
    guess: PropTypes.string,
    frequentlyUsedLanguages: PropTypes.arrayOf(PropTypes.string).isRequired,
    onClose: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    languages: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    intl: PropTypes.object,
  };

  static defaultProps = {
    languages: preloadedLanguages,
  };

  state = {
    searchValue: '',
  };

  handleDocumentClick = e => {
    if (this.node && !this.node.contains(e.target)) {
      this.props.onClose();
      e.stopPropagation();
    }
  };

  componentDidMount () {
    document.addEventListener('click', this.handleDocumentClick, { capture: true });
    document.addEventListener('touchend', this.handleDocumentClick, listenerOptions);

    // Because of https://github.com/react-bootstrap/react-bootstrap/issues/2614 we need
    // to wait for a frame before focusing
    requestAnimationFrame(() => {
      if (this.node) {
        const element = this.node.querySelector('input[type="search"]');
        if (element) element.focus();
      }
    });
  }

  componentWillUnmount () {
    document.removeEventListener('click', this.handleDocumentClick, { capture: true });
    document.removeEventListener('touchend', this.handleDocumentClick, listenerOptions);
  }

  setRef = c => {
    this.node = c;
  };

  setListRef = c => {
    this.listNode = c;
  };

  handleSearchChange = ({ target }) => {
    this.setState({ searchValue: target.value });
  };

  search () {
    const { languages, value, frequentlyUsedLanguages, guess } = this.props;
    const { searchValue } = this.state;

    if (searchValue === '') {
      return [...languages].sort((a, b) => {

        if (guess && a[0] === guess) { // Push guessed language higher than current selection
          return -1;
        } else if (guess && b[0] === guess) {
          return 1;
        } else if (a[0] === value) { // Push current selection to the top of the list
          return -1;
        } else if (b[0] === value) {
          return 1;
        } else {
          // Sort according to frequently used languages

          const indexOfA = frequentlyUsedLanguages.indexOf(a[0]);
          const indexOfB = frequentlyUsedLanguages.indexOf(b[0]);

          return ((indexOfA > -1 ? indexOfA : Infinity) - (indexOfB > -1 ? indexOfB : Infinity));
        }
      });
    }

    return fuzzysort.go(searchValue, languages, {
      keys: ['0', '1', '2'],
      limit: 5,
      threshold: -10000,
    }).map(result => result.obj);
  }

  handleClick = e => {
    const value = e.currentTarget.getAttribute('data-index');

    e.preventDefault();

    this.props.onClose();
    this.props.onChange(value);
  };

  handleKeyDown = e => {
    const { onClose } = this.props;
    const index = Array.from(this.listNode.childNodes).findIndex(node => node === e.currentTarget);

    let element = null;

    switch(e.key) {
    case 'Escape':
      onClose();
      break;
    case ' ':
    case 'Enter':
      this.handleClick(e);
      break;
    case 'ArrowDown':
      element = this.listNode.childNodes[index + 1] || this.listNode.firstChild;
      break;
    case 'ArrowUp':
      element = this.listNode.childNodes[index - 1] || this.listNode.lastChild;
      break;
    case 'Tab':
      if (e.shiftKey) {
        element = this.listNode.childNodes[index - 1] || this.listNode.lastChild;
      } else {
        element = this.listNode.childNodes[index + 1] || this.listNode.firstChild;
      }
      break;
    case 'Home':
      element = this.listNode.firstChild;
      break;
    case 'End':
      element = this.listNode.lastChild;
      break;
    }

    if (element) {
      element.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  };

  handleSearchKeyDown = e => {
    const { onChange, onClose } = this.props;
    const { searchValue } = this.state;

    let element = null;

    switch(e.key) {
    case 'Tab':
    case 'ArrowDown':
      element = this.listNode.firstChild;

      if (element) {
        element.focus();
        e.preventDefault();
        e.stopPropagation();
      }

      break;
    case 'Enter':
      element = this.listNode.firstChild;

      if (element) {
        onChange(element.getAttribute('data-index'));
        onClose();
      }
      break;
    case 'Escape':
      if (searchValue !== '') {
        e.preventDefault();
        this.handleClear();
      }

      break;
    }
  };

  handleClear = () => {
    this.setState({ searchValue: '' });
  };

  renderItem = lang => {
    const { value } = this.props;

    return (
      <div key={lang[0]} role='option' tabIndex={0} data-index={lang[0]} className={classNames('language-dropdown__dropdown__results__item', { active: lang[0] === value })} aria-selected={lang[0] === value} onClick={this.handleClick} onKeyDown={this.handleKeyDown}>
        <span className='language-dropdown__dropdown__results__item__native-name' lang={lang[0]}>{lang[2]}</span> <span className='language-dropdown__dropdown__results__item__common-name'>({lang[1]})</span>
      </div>
    );
  };

  render () {
    const { intl } = this.props;
    const { searchValue } = this.state;
    const isSearching = searchValue !== '';
    const results = this.search();

    return (
      <div ref={this.setRef}>
        <div className='emoji-mart-search'>
          <input type='search' value={searchValue} onChange={this.handleSearchChange} onKeyDown={this.handleSearchKeyDown} placeholder={intl.formatMessage(messages.search)} />
          <button type='button' className='emoji-mart-search-icon' disabled={!isSearching} aria-label={intl.formatMessage(messages.clear)} onClick={this.handleClear}><Icon icon={!isSearching ? SearchIcon : CircleCloseIcon} /></button>
        </div>

        <div className='language-dropdown__dropdown__results emoji-mart-scroll' role='listbox' ref={this.setListRef}>
          {results.map(this.renderItem)}
        </div>
      </div>
    );
  }

}

class LanguageDropdown extends PureComponent {

  static propTypes = {
    value: PropTypes.string,
    frequentlyUsedLanguages: PropTypes.arrayOf(PropTypes.string),
    guess: PropTypes.string,
    intl: PropTypes.object.isRequired,
    onChange: PropTypes.func,
  };

  state = {
    open: false,
    placement: 'bottom',
  };

  handleToggle = () => {
    if (this.state.open && this.activeElement) {
      this.activeElement.focus({ preventScroll: true });
    }

    this.setState({ open: !this.state.open });
  };

  handleClose = () => {
    if (this.state.open && this.activeElement) {
      this.activeElement.focus({ preventScroll: true });
    }

    this.setState({ open: false });
  };

  handleChange = value => {
    const { onChange } = this.props;
    onChange(value);
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

  render () {
    const { value, guess, intl, frequentlyUsedLanguages } = this.props;
    const { open, placement } = this.state;
    const current = preloadedLanguages.find(lang => lang[0] === value) ?? [];

    return (
      <div ref={this.setTargetRef} onKeyDown={this.handleKeyDown}>
        <button
          type='button'
          title={intl.formatMessage(messages.changeLanguage)}
          aria-expanded={open}
          onClick={this.handleToggle}
          onMouseDown={this.handleMouseDown}
          onKeyDown={this.handleButtonKeyDown}
          className={classNames('dropdown-button', { active: open, warning: guess !== '' && guess !== value })}
        >
          <Icon icon={LanguageIcon} />
          <span className='dropdown-button__label'>{current[2] ?? value}</span>
        </button>

        <Overlay show={open} offset={[5, 5]} placement={placement} flip target={this.findTarget} popperConfig={{ strategy: 'fixed', onFirstUpdate: this.handleOverlayEnter }}>
          {({ props, placement }) => (
            <div {...props}>
              <div className={`dropdown-animation language-dropdown__dropdown ${placement}`} >
                <LanguageDropdownMenu
                  value={value}
                  guess={guess}
                  frequentlyUsedLanguages={frequentlyUsedLanguages}
                  onClose={this.handleClose}
                  onChange={this.handleChange}
                  intl={intl}
                />
              </div>
            </div>
          )}
        </Overlay>
      </div>
    );
  }

}

export default injectIntl(LanguageDropdown);
