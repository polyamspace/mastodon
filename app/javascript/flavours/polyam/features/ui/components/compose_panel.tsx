import { useCallback, useEffect, useLayoutEffect } from 'react';

import { useLayout } from '@/flavours/polyam/hooks/useLayout';
import { useAppDispatch, useAppSelector } from '@/flavours/polyam/store';
import {
  changeComposing,
  mountCompose,
  unmountCompose,
} from 'flavours/polyam/actions/compose';
import { useAppHistory } from 'flavours/polyam/components/router';
import ServerBanner from 'flavours/polyam/components/server_banner';
import { Search } from 'flavours/polyam/features/compose/components/search';
import ComposeFormContainer from 'flavours/polyam/features/compose/containers/compose_form_container';
import { LinkFooter } from 'flavours/polyam/features/ui/components/link_footer';
import { useIdentity } from 'flavours/polyam/identity_context';

export const ComposePanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const handleFocus = useCallback(() => {
    dispatch(changeComposing(true));
  }, [dispatch]);
  const { signedIn } = useIdentity();
  const hideComposer = useAppSelector((state) => {
    const mounted = state.compose.get('mounted');
    if (typeof mounted === 'number') {
      return mounted > 1;
    }
    return false;
  });

  useEffect(() => {
    dispatch(mountCompose());
    return () => {
      dispatch(unmountCompose());
    };
  }, [dispatch]);

  const { singleColumn } = useLayout();

  return (
    <div className='compose-panel' onFocus={handleFocus}>
      <Search singleColumn={singleColumn} />

      {!signedIn && (
        <>
          <ServerBanner />
          <div className='flex-spacer' />
        </>
      )}

      {signedIn && !hideComposer && <ComposeFormContainer singleColumn />}
      {signedIn && hideComposer && <div className='compose-form' />}

      <LinkFooter multiColumn={!singleColumn} />
    </div>
  );
};

/**
 * Redirect the user to the standalone compose page when the
 * sidebar composer is hidden due to a change in viewport size
 * while a post is being written.
 */

export const RedirectToMobileComposeIfNeeded: React.FC = () => {
  const history = useAppHistory();

  const shouldRedirect = useAppSelector((state) =>
    state.compose.get('should_redirect_to_compose_page'),
  );

  useLayoutEffect(() => {
    if (shouldRedirect) {
      history.push('/publish');
    }
  }, [history, shouldRedirect]);

  return null;
};
