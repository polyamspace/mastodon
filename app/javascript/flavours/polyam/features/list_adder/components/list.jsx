import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import { faListUl, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

import { Icon }  from 'flavours/polyam/components/icon';

import { removeFromListAdder, addToListAdder } from '../../../actions/lists';
import { IconButton }  from '../../../components/icon_button';

const messages = defineMessages({
  remove: { id: 'lists.account.remove', defaultMessage: 'Remove from list' },
  add: { id: 'lists.account.add', defaultMessage: 'Add to list' },
});

const mapStateToProps = (state, { listId, added }) => ({
  list: state.get('lists').get(listId),
  added: typeof added === 'undefined' ? state.getIn(['listAdder', 'lists', 'items']).includes(listId) : added,
});

const mapDispatchToProps = (dispatch, { listId }) => ({
  onRemove: () => dispatch(removeFromListAdder(listId)),
  onAdd: () => dispatch(addToListAdder(listId)),
});

class List extends ImmutablePureComponent {

  static propTypes = {
    list: ImmutablePropTypes.map.isRequired,
    intl: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    added: PropTypes.bool,
  };

  static defaultProps = {
    added: false,
  };

  render () {
    const { list, intl, onRemove, onAdd, added } = this.props;

    let button;

    if (added) {
      button = <IconButton icon='times' iconComponent={faTimes} title={intl.formatMessage(messages.remove)} onClick={onRemove} />;
    } else {
      button = <IconButton icon='plus' iconComponent={faPlus} title={intl.formatMessage(messages.add)} onClick={onAdd} />;
    }

    return (
      <div className='list'>
        <div className='list__wrapper'>
          <div className='list__display-name'>
            <Icon id='list-ul' icon={faListUl} className='column-link__icon' fixedWidth />
            {list.get('title')}
          </div>

          <div className='account__relationship'>
            {button}
          </div>
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(List));
