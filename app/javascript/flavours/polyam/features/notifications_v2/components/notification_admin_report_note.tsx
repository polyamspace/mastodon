import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import FlagIcon from '@/awesome-icons/solid/flag.svg?react';
import { Icon } from 'flavours/polyam/components/icon';
import { RelativeTimestamp } from 'flavours/polyam/components/relative_timestamp';
import type { NotificationGroupAdminReportNote } from 'flavours/polyam/models/notification_group';
import { useAppSelector } from 'flavours/polyam/store';

export const NotificationAdminReportNote: React.FC<{
  notification: NotificationGroupAdminReportNote;
  unread?: boolean;
}> = ({ notification, notification: { reportNote }, unread }) => {
  const account = useAppSelector((state) =>
    state.accounts.get(notification.sampleAccountIds[0] ?? '0'),
  );

  if (!account) return null;

  return (
    <a
      href={`/admin/reports/${reportNote.report.id}`}
      target='_blank'
      rel='noopener noreferrer'
      className={classNames(
        'notification-group notification-group--link notification-group--admin-report-note focusable',
        { 'notification-group--unread': unread },
      )}
    >
      <div className='notification-group__icon'>
        <Icon id='flag' icon={FlagIcon} />
      </div>

      <div className='notification-group__main'>
        <div className='notification-group__main__header'>
          <div className='notification-group__main__header__label'>
            <FormattedMessage
              id='notification.admin.report_note'
              defaultMessage='{name} added a report note'
              values={{
                name: (
                  <bdi
                    dangerouslySetInnerHTML={{
                      __html: account.get('display_name_html'),
                    }}
                  />
                ),
              }}
            />
            <RelativeTimestamp timestamp={reportNote.created_at} />
          </div>
        </div>

        {reportNote.content.length > 0 && (
          <div className='notification-group__embedded-status__content'>
            “{reportNote.content}”
          </div>
        )}
      </div>
    </a>
  );
};
