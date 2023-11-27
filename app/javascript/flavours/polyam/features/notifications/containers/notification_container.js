import { connect } from 'react-redux';

import { mentionCompose } from 'flavours/polyam/actions/compose';
import { makeGetNotification } from 'flavours/polyam/selectors';

import Notification from '../components/notification';

const makeMapStateToProps = () => {
  const getNotification = makeGetNotification();

  const mapStateToProps = (state, props) => ({
    notification: getNotification(state, props.notification, props.accountId),
    notifCleaning: state.getIn(['notifications', 'cleaningMode']),
  });

  return mapStateToProps;
};

const mapDispatchToProps = dispatch => ({
  onMention: (account, history) => {
    dispatch(mentionCompose(account, history));
  },
});

export default connect(makeMapStateToProps, mapDispatchToProps)(Notification);
