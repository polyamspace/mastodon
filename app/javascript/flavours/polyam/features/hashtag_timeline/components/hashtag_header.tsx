import { useCallback, useMemo, useState, useEffect } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import { isFulfilled } from '@reduxjs/toolkit';

import MoreHorizIcon from '@/awesome-icons/solid/ellipsis.svg?react';
import {
  fetchHashtag,
  followHashtag,
  unfollowHashtag,
  featureHashtag,
  unfeatureHashtag,
} from 'flavours/polyam/actions/tags_typed';
import type { ApiHashtagJSON } from 'flavours/polyam/api_types/tags';
import { Button } from 'flavours/polyam/components/button';
import { Dropdown } from 'flavours/polyam/components/dropdown_menu';
import { ShortNumber } from 'flavours/polyam/components/short_number';
import { useIdentity } from 'flavours/polyam/identity_context';
import { PERMISSION_MANAGE_TAXONOMIES } from 'flavours/polyam/permissions';
import { useAppDispatch } from 'flavours/polyam/store';

const messages = defineMessages({
  followHashtag: { id: 'hashtag.follow', defaultMessage: 'Follow hashtag' },
  unfollowHashtag: {
    id: 'hashtag.unfollow',
    defaultMessage: 'Unfollow hashtag',
  },
  adminModeration: {
    id: 'hashtag.admin_moderation',
    defaultMessage: 'Open moderation interface for #{name}',
  },
  feature: { id: 'hashtag.feature', defaultMessage: 'Feature on profile' },
  unfeature: {
    id: 'hashtag.unfeature',
    defaultMessage: "Don't feature on profile",
  },
});

const usesRenderer = (displayNumber: React.ReactNode, pluralReady: number) => (
  <FormattedMessage
    id='hashtag.counter_by_uses'
    defaultMessage='{count, plural, one {{counter} post} other {{counter} posts}}'
    values={{
      count: pluralReady,
      counter: <strong>{displayNumber}</strong>,
    }}
  />
);

const peopleRenderer = (
  displayNumber: React.ReactNode,
  pluralReady: number,
) => (
  <FormattedMessage
    id='hashtag.counter_by_accounts'
    defaultMessage='{count, plural, one {{counter} participant} other {{counter} participants}}'
    values={{
      count: pluralReady,
      counter: <strong>{displayNumber}</strong>,
    }}
  />
);

const usesTodayRenderer = (
  displayNumber: React.ReactNode,
  pluralReady: number,
) => (
  <FormattedMessage
    id='hashtag.counter_by_uses_today'
    defaultMessage='{count, plural, one {{counter} post} other {{counter} posts}} today'
    values={{
      count: pluralReady,
      counter: <strong>{displayNumber}</strong>,
    }}
  />
);

export const HashtagHeader: React.FC<{
  tagId: string;
}> = ({ tagId }) => {
  const intl = useIntl();
  const { signedIn, permissions } = useIdentity();
  const dispatch = useAppDispatch();
  const [tag, setTag] = useState<ApiHashtagJSON>();

  useEffect(() => {
    void dispatch(fetchHashtag({ tagId })).then((result) => {
      if (isFulfilled(result)) {
        setTag(result.payload);
      }

      return '';
    });
  }, [dispatch, tagId, setTag]);

  const menu = useMemo(() => {
    const arr = [];

    if (tag && signedIn) {
      const handleFeature = () => {
        if (tag.featuring) {
          void dispatch(unfeatureHashtag({ tagId })).then((result) => {
            if (isFulfilled(result)) {
              setTag(result.payload);
            }

            return '';
          });
        } else {
          void dispatch(featureHashtag({ tagId })).then((result) => {
            if (isFulfilled(result)) {
              setTag(result.payload);
            }

            return '';
          });
        }
      };

      arr.push({
        text: intl.formatMessage(
          tag.featuring ? messages.unfeature : messages.feature,
        ),
        action: handleFeature,
      });

      arr.push(null);

      if (
        (permissions & PERMISSION_MANAGE_TAXONOMIES) ===
        PERMISSION_MANAGE_TAXONOMIES
      ) {
        arr.push({
          text: intl.formatMessage(messages.adminModeration, { name: tagId }),
          href: `/admin/tags/${tag.id}`,
        });
      }
    }

    return arr;
  }, [setTag, dispatch, tagId, signedIn, permissions, intl, tag]);

  const handleFollow = useCallback(() => {
    if (!signedIn || !tag) {
      return;
    }

    if (tag.following) {
      setTag((hashtag) => hashtag && { ...hashtag, following: false });

      void dispatch(unfollowHashtag({ tagId })).then((result) => {
        if (isFulfilled(result)) {
          setTag(result.payload);
        }

        return '';
      });
    } else {
      setTag((hashtag) => hashtag && { ...hashtag, following: true });

      void dispatch(followHashtag({ tagId })).then((result) => {
        if (isFulfilled(result)) {
          setTag(result.payload);
        }

        return '';
      });
    }
  }, [dispatch, setTag, signedIn, tag, tagId]);

  if (!tag) {
    return null;
  }

  const [uses, people] = tag.history.reduce(
    (arr, day) => [
      arr[0] + parseInt(day.uses),
      arr[1] + parseInt(day.accounts),
    ],
    [0, 0],
  );
  const dividingCircle = <span aria-hidden>{' · '}</span>;

  return (
    <div className='hashtag-header'>
      <div className='hashtag-header__header'>
        <h1>#{tag.name}</h1>

        <div className='hashtag-header__header__buttons'>
          {menu.length > 0 && (
            <Dropdown
              disabled={menu.length === 0}
              items={menu}
              icon='ellipsis-v'
              iconComponent={MoreHorizIcon}
            />
          )}

          <Button
            onClick={handleFollow}
            text={intl.formatMessage(
              tag.following ? messages.unfollowHashtag : messages.followHashtag,
            )}
            disabled={!signedIn}
          />
        </div>
      </div>

      <div>
        <ShortNumber value={uses} renderer={usesRenderer} />
        {dividingCircle}
        <ShortNumber value={people} renderer={peopleRenderer} />
        {dividingCircle}
        <ShortNumber
          value={parseInt(tag.history[0].uses)}
          renderer={usesTodayRenderer}
        />
      </div>
    </div>
  );
};
