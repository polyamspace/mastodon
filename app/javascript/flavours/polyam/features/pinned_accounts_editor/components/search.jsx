import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import { connect } from 'react-redux';

import CircleCloseIcon from '@/awesome-icons/solid/circle-xmark.svg?react';
import SearchIcon from '@/awesome-icons/solid/magnifying-glass.svg?react';
import { Icon }  from 'flavours/polyam/components/icon';

import { fetchPinnedAccountsSuggestions, clearPinnedAccountsSuggestions, changePinnedAccountsSuggestions } from '../../../actions/accounts';

const messages = defineMessages({
  search: { id: 'lists.search_placeholder', defaultMessage: 'Search people you follow' },
});

const mapStateToProps = state => ({
  value: state.getIn(['pinnedAccountsEditor', 'suggestions', 'value']),
});

const mapDispatchToProps = dispatch => ({
  onSubmit: value => dispatch(fetchPinnedAccountsSuggestions(value)),
  onClear: () => dispatch(clearPinnedAccountsSuggestions()),
  onChange: value => dispatch(changePinnedAccountsSuggestions(value)),
});

class Search extends PureComponent {

  static propTypes = {
    intl: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
  };

  handleChange = e => {
    this.props.onChange(e.target.value);
  };

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      this.props.onSubmit(this.props.value);
    }
  };

  handleClear = () => {
    this.props.onClear();
  };

  render () {
    const { value, intl } = this.props;
    const hasValue = value.length > 0;

    return (
      <div className='list-editor__search search'>
        <label>
          <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

          <input
            className='search__input'
            type='text'
            value={value}
            onChange={this.handleChange}
            onKeyUp={this.handleKeyUp}
            placeholder={intl.formatMessage(messages.search)}
          />
        </label>

        <div role='button' tabIndex={0} className='search__icon' onClick={this.handleClear}>
          <Icon id='search' icon={SearchIcon} className={classNames({ active: !hasValue })} />
          <Icon id='times-circle' icon={CircleCloseIcon} aria-label={intl.formatMessage(messages.search)} className={classNames({ active: hasValue })} />
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Search));
