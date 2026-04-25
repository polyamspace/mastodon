import { useCallback, useMemo, useRef } from 'react';
import type { FC, ReactNode } from 'react';

import { Account } from '@/flavours/polyam/components/account';
import type { ColumnRef } from '@/flavours/polyam/components/column';
import { Column } from '@/flavours/polyam/components/column';
import { LoadingIndicator } from '@/flavours/polyam/components/loading_indicator';
import ScrollableList from '@/flavours/polyam/components/scrollable_list';
import BundleColumnError from '@/flavours/polyam/features/ui/components/bundle_column_error';
import { useAccount } from '@/flavours/polyam/hooks/useAccount';
import { useAccountVisibility } from '@/flavours/polyam/hooks/useAccountVisibility';
import { useLayout } from '@/flavours/polyam/hooks/useLayout';

import { ProfileColumnHeader } from '../../account/components/profile_column_header';
import { AccountHeader } from '../../account_timeline/components/account_header';

import { RemoteHint } from './remote';

export interface AccountList {
  hasMore: boolean;
  isLoading: boolean;
  items: string[];
}

interface AccountListProps {
  accountId?: string | null;
  append?: ReactNode;
  emptyMessage: ReactNode;
  footer?: ReactNode;
  list?: AccountList | null;
  loadMore: () => void;
  prependAccountId?: string | null;
  scrollKey: string;
}

export const AccountList: FC<AccountListProps> = ({
  accountId,
  append,
  emptyMessage,
  footer,
  list,
  loadMore,
  prependAccountId,
  scrollKey,
}) => {
  const account = useAccount(accountId);

  const { blockedBy, hidden, suspended } = useAccountVisibility(accountId);
  const forceEmptyState = blockedBy || hidden || suspended;

  const children = useMemo(() => {
    if (forceEmptyState) {
      return [];
    }
    const children =
      list?.items.map((followerId) => (
        <Account key={followerId} id={followerId} />
      )) ?? [];

    if (prependAccountId) {
      children.unshift(
        <Account key={prependAccountId} id={prependAccountId} minimal />,
      );
    }
    return children;
  }, [prependAccountId, list, forceEmptyState]);

  const columnRef = useRef<ColumnRef>(null);
  const handleHeaderClick = useCallback(() => {
    columnRef.current?.scrollTop();
  }, []);

  const { multiColumn } = useLayout();

  // Null means accountId does not exist (e.g. invalid acct). Undefined means loading.
  if (accountId === null) {
    return <BundleColumnError multiColumn={multiColumn} errorType='routing' />;
  }

  if (!accountId || !account) {
    return (
      <Column bindToDocument={!multiColumn}>
        <LoadingIndicator />
      </Column>
    );
  }

  const domain = account.acct.split('@')[1];

  return (
    <Column ref={columnRef}>
      <ProfileColumnHeader
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <ScrollableList
        scrollKey={scrollKey}
        hasMore={!forceEmptyState && list?.hasMore}
        isLoading={list?.isLoading ?? true}
        onLoadMore={loadMore}
        prepend={<AccountHeader accountId={accountId} hideTabs />}
        alwaysPrepend
        append={append ?? <RemoteHint domain={domain} url={account.url} />}
        emptyMessage={emptyMessage}
        bindToDocument={!multiColumn}
        footer={footer}
      >
        {children}
      </ScrollableList>
    </Column>
  );
};
