import { useCallback } from 'react';
import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { resetCompose, focusCompose } from '@/flavours/polyam/actions/compose';
import { closeModal } from '@/flavours/polyam/actions/modal';
import { Button } from '@/flavours/polyam/components/button';
import type { AnnualReport as AnnualReportData } from '@/flavours/polyam/models/annual_report';
import { useAppDispatch } from '@/flavours/polyam/store';

import { archetypeNames } from './archetype';

const messages = defineMessages({
  share_message: {
    id: 'annual_report.summary.share_message',
    defaultMessage: 'I got the {archetype} archetype!',
  },
  share_on_mastodon: {
    id: 'annual_report.summary.share_on_mastodon',
    defaultMessage: 'Share on Mastodon',
  },
});

export const ShareButton: FC<{ report: AnnualReportData }> = ({ report }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const handleShareClick = useCallback(() => {
    // Generate the share message.
    const archetypeName = intl.formatMessage(
      archetypeNames[report.data.archetype],
    );
    const shareLines = [
      intl.formatMessage(messages.share_message, {
        archetype: archetypeName,
      }),
    ];
    // Share URL is only available for schema version 2.
    if (report.schema_version === 2 && report.share_url) {
      shareLines.push(report.share_url);
    }
    shareLines.push(`#Wrapstodon${report.year}`);

    // Reset the composer and focus it with the share message, then close the modal.
    dispatch(resetCompose());
    dispatch(focusCompose(shareLines.join('\n\n')));
    dispatch(closeModal({ modalType: 'ANNUAL_REPORT', ignoreFocus: false }));
  }, [report, intl, dispatch]);

  return (
    <Button
      text={intl.formatMessage(messages.share_on_mastodon)}
      onClick={handleShareClick}
    />
  );
};
