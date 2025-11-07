import { connect } from 'react-redux';

import { changeComposeVisibility } from '@/flavours/polyam/actions/compose_typed';

import PrivacyDropdown from '../components/privacy_dropdown';

const mapStateToProps = state => ({
  value: state.getIn(['compose', 'privacy']),
});

const mapDispatchToProps = dispatch => ({

  onChange (value) {
    dispatch(changeComposeVisibility(value));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(PrivacyDropdown);
