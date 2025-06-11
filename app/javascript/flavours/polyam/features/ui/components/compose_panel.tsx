import { useCallback, useEffect } from 'react';

import { useLayout } from '@/flavours/polyam/hooks/useLayout';
import { useAppDispatch, useAppSelector } from '@/flavours/polyam/store';
import {
  mountCompose,
  unmountCompose,
} from 'flavours/polyam/actions/compose';
import ServerBanner from 'flavours/polyam/components/server_banner';
import { Search } from 'flavours/polyam/features/compose/components/search';
import ComposeFormContainer from 'flavours/polyam/features/compose/containers/compose_form_container';
import { LinkFooter } from 'flavours/polyam/features/ui/components/link_footer';
import { useIdentity } from 'flavours/polyam/identity_context';

export const ComposePanel: React.FC = () => {
  const dispatch = useAppDispatch();
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
    <div className='compose-panel'>
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
