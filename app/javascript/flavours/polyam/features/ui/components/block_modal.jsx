import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import { useDispatch } from 'react-redux';

import VisibilityOffIcon from '@/awesome-icons/regular/eye-slash.svg?react';
import AtIcon from '@/awesome-icons/solid/at.svg?react';
import BanIcon from '@/awesome-icons/solid/ban.svg?react';
import AnnouncementIcon from '@/awesome-icons/solid/bullhorn.svg?react';
import ReplyIcon from '@/awesome-icons/solid/reply.svg?react';
import { blockAccount } from 'flavours/polyam/actions/accounts';
import { closeModal } from 'flavours/polyam/actions/modal';
import { Button } from 'flavours/polyam/components/button';
import { Icon } from 'flavours/polyam/components/icon';

export const BlockModal = ({ accountId, acct }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);

  const domain = acct.split('@')[1];

  const handleClick = useCallback(() => {
    dispatch(closeModal({ modalType: undefined, ignoreFocus: false }));
    dispatch(blockAccount(accountId));
  }, [dispatch, accountId]);

  const handleCancel = useCallback(() => {
    dispatch(closeModal({ modalType: undefined, ignoreFocus: false }));
  }, [dispatch]);

  const handleToggleLearnMore = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  return (
    <div className='modal-root__modal safety-action-modal'>
      <div className='safety-action-modal__top'>
        <div className='safety-action-modal__header'>
          <div className='safety-action-modal__header__icon'>
            <Icon icon={BanIcon} />
          </div>

          <div>
            <h1><FormattedMessage id='block_modal.title' defaultMessage='Block user?' /></h1>
            <div>@{acct}</div>
          </div>
        </div>

        <div className='safety-action-modal__bullet-points'>
          <div>
            <div className='safety-action-modal__bullet-points__icon'><Icon icon={AnnouncementIcon} /></div>
            <div><FormattedMessage id='block_modal.they_will_know' defaultMessage="They can see that they're blocked." /></div>
          </div>

          <div>
            <div className='safety-action-modal__bullet-points__icon'><Icon icon={VisibilityOffIcon} /></div>
            <div><FormattedMessage id='block_modal.they_cant_see_posts' defaultMessage="They can't see your posts and you won't see theirs." /></div>
          </div>

          <div>
            <div className='safety-action-modal__bullet-points__icon'><Icon icon={AtIcon} /></div>
            <div><FormattedMessage id='block_modal.you_wont_see_mentions' defaultMessage="You won't see posts that mentions them." /></div>
          </div>

          <div>
            <div className='safety-action-modal__bullet-points__icon'><Icon icon={ReplyIcon} /></div>
            <div><FormattedMessage id='block_modal.they_cant_mention' defaultMessage="They can't mention or follow you." /></div>
          </div>
        </div>
      </div>

      <div className={classNames('safety-action-modal__bottom', { active: expanded })}>
        {domain && (
          <div className='safety-action-modal__bottom__collapsible'>
            <div className='safety-action-modal__caveats'>
              <FormattedMessage
                id='block_modal.remote_users_caveat'
                defaultMessage='We will ask the server {domain} to respect your decision. However, compliance is not guaranteed since some servers may handle blocks differently. Public posts may still be visible to non-logged-in users.'
                values={{ domain: <strong>{domain}</strong> }}
              />
            </div>
          </div>
        )}

        <div className='safety-action-modal__actions'>
          {domain && (
            <button onClick={handleToggleLearnMore} className='link-button'>
              {expanded ? <FormattedMessage id='block_modal.show_less' defaultMessage='Show less' /> : <FormattedMessage id='block_modal.show_more' defaultMessage='Show more' />}
            </button>
          )}

          <div className='spacer' />

          <button onClick={handleCancel} className='link-button'>
            <FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />
          </button>

          <Button onClick={handleClick} autoFocus>
            <FormattedMessage id='confirmations.block.confirm' defaultMessage='Block' />
          </Button>
        </div>
      </div>
    </div>
  );
};

BlockModal.propTypes = {
  accountId: PropTypes.string.isRequired,
  acct: PropTypes.string.isRequired,
};

export default BlockModal;
