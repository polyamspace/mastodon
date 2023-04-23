import PropTypes from 'prop-types';
import React from 'react';

import { Icon } from 'flavours/glitch/components/icon';

// Currently unused in glitch-soc
class VerifiedBadge extends React.PureComponent {

  static propTypes = {
    link: PropTypes.string.isRequired,
    verifiedAt: PropTypes.string.isRequired,
  };

  render () {
    const { link } = this.props;

    return (
      <span className='verified-badge'>
        <Icon id='check' className='verified-badge__mark' />
        <span dangerouslySetInnerHTML={{ __html: link }} />
      </span>
    );
  }

}

export default VerifiedBadge;
