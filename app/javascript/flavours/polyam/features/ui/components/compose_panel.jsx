import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { connect } from 'react-redux';

import { mountCompose, unmountCompose } from 'flavours/polyam/actions/compose';
import ServerBanner from 'flavours/polyam/components/server_banner';
import ComposeFormContainer from 'flavours/polyam/features/compose/containers/compose_form_container';
import SearchContainer from 'flavours/polyam/features/compose/containers/search_container';
import { LinkFooter } from 'flavours/polyam/features/ui/components/link_footer';
import { identityContextPropShape, withIdentity } from 'flavours/polyam/identity_context';

class ComposePanel extends PureComponent {

  static propTypes = {
    identity: identityContextPropShape,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(mountCompose());
  }

  componentWillUnmount () {
    const { dispatch } = this.props;
    dispatch(unmountCompose());
  }

  render() {
    const { signedIn } = this.props.identity;

    return (
      <div className='compose-panel'>
        <SearchContainer openInRoute />

        {!signedIn && (
          <>
            <ServerBanner />
            <div className='flex-spacer' />
          </>
        )}

        {signedIn && (
          <ComposeFormContainer singleColumn />
        )}

        <LinkFooter />
      </div>
    );
  }

}

export default connect()(withIdentity(ComposePanel));
