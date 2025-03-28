import { useState, useEffect, useRef, useCallback } from 'react';

import { FormattedMessage, useIntl, defineMessages } from 'react-intl';

import { Helmet } from 'react-helmet';

import UserSecretIcon from '@/awesome-icons/solid/user-secret.svg?react';
import { apiGetPrivacyPolicy } from 'flavours/polyam/api/instance';
import type { ApiPrivacyPolicyJSON } from 'flavours/polyam/api_types/instance';
import { Column } from 'flavours/polyam/components/column';
import type { ColumnRef } from 'flavours/polyam/components/column';
import { ColumnHeader } from 'flavours/polyam/components/column_header';
import { FormattedDateWrapper } from 'flavours/polyam/components/formatted_date';
import { Skeleton } from 'flavours/polyam/components/skeleton';

const messages = defineMessages({
  title: { id: 'privacy_policy.title', defaultMessage: 'Privacy Policy' },
});

const PrivacyPolicy: React.FC<{
  multiColumn: boolean;
}> = ({ multiColumn }) => {
  const intl = useIntl();
  const [response, setResponse] = useState<ApiPrivacyPolicyJSON>();
  const [loading, setLoading] = useState(true);

  const column = useRef<ColumnRef>(null);

  useEffect(() => {
    apiGetPrivacyPolicy()
      .then((data) => {
        setResponse(data);
        setLoading(false);
        return '';
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleHeaderClick = useCallback(() => {
    column.current?.scrollTop();
  }, []);

  return (
    <Column
      ref={column}
      bindToDocument={!multiColumn}
      label={intl.formatMessage(messages.title)}
    >
      <ColumnHeader
        icon='user-secret'
        iconComponent={UserSecretIcon}
        title={intl.formatMessage(messages.title)}
        onClick={handleHeaderClick}
        multiColumn={multiColumn}
      />

      <div className='scrollable privacy-policy'>
        <div className='column-title'>
          <h3>
            <FormattedMessage
              id='privacy_policy.title'
              defaultMessage='Privacy Policy'
            />
          </h3>
          <p>
            <FormattedMessage
              id='privacy_policy.last_updated'
              defaultMessage='Last updated {date}'
              values={{
                date: loading ? (
                  <Skeleton width='10ch' />
                ) : (
                  <FormattedDateWrapper
                    value={response?.updated_at}
                    year='numeric'
                    month='short'
                    day='2-digit'
                  />
                ),
              }}
            />
          </p>
        </div>

        {response && (
          <div
            className='privacy-policy__body prose'
            dangerouslySetInnerHTML={{ __html: response.content }}
          />
        )}
      </div>

      <Helmet>
        <title>{intl.formatMessage(messages.title)}</title>
        <meta name='robots' content='all' />
      </Helmet>
    </Column>
  );
};

// eslint-disable-next-line import/no-default-export
export default PrivacyPolicy;
