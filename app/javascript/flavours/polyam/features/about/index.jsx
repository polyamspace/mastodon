import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';

import { List as ImmutableList } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ChevronDownIcon from '@/awesome-icons/solid/chevron-down.svg?react';
import ChevronRightIcon from '@/awesome-icons/solid/chevron-right.svg?react';
import CircleInfo from '@/awesome-icons/solid/circle-info.svg?react';
import { fetchServer, fetchExtendedDescription, fetchDomainBlocks } from 'flavours/polyam/actions/server';
import { Account } from 'flavours/polyam/components/account';
import Column from 'flavours/polyam/components/column';
import ColumnHeader from 'flavours/polyam/components/column_header';
import { Icon } from 'flavours/polyam/components/icon';
import { ServerHeroImage } from 'flavours/polyam/components/server_hero_image';
import { Skeleton } from 'flavours/polyam/components/skeleton';
import { LinkFooter } from 'flavours/polyam/features/ui/components/link_footer';

import { ServerLimits } from './components/server_limits';

const messages = defineMessages({
  title: { id: 'column.about', defaultMessage: 'About' },
  rules: { id: 'about.rules', defaultMessage: 'Server rules' },
  blocks: { id: 'about.blocks', defaultMessage: 'Moderated servers' },
  silenced: { id: 'about.domain_blocks.silenced.title', defaultMessage: 'Limited' },
  silencedExplanation: { id: 'about.domain_blocks.silenced.explanation', defaultMessage: 'You will generally not see profiles and content from this server, unless you explicitly look it up or opt into it by following.' },
  suspended: { id: 'about.domain_blocks.suspended.title', defaultMessage: 'Suspended' },
  suspendedExplanation: { id: 'about.domain_blocks.suspended.explanation', defaultMessage: 'No data from this server will be processed, stored or exchanged, making any interaction or communication with users from this server impossible.' },
  limits: { id: 'about.limits', defaultMessage: 'Server limits' },
});

const severityMessages = {
  silence: {
    title: messages.silenced,
    explanation: messages.silencedExplanation,
  },

  suspend: {
    title: messages.suspended,
    explanation: messages.suspendedExplanation,
  },
};

const mapStateToProps = state => ({
  server: state.getIn(['server', 'server']),
  locale: state.getIn(['meta', 'locale']),
  extendedDescription: state.getIn(['server', 'extendedDescription']),
  domainBlocks: state.getIn(['server', 'domainBlocks']),
});

class Section extends PureComponent {

  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node,
    open: PropTypes.bool,
    onOpen: PropTypes.func,
  };

  state = {
    collapsed: !this.props.open,
  };

  handleClick = () => {
    const { onOpen } = this.props;
    const { collapsed } = this.state;

    this.setState({ collapsed: !collapsed }, () => onOpen && onOpen());
  };

  render () {
    const { title, children } = this.props;
    const { collapsed } = this.state;

    return (
      <div className={classNames('about__section', { active: !collapsed })}>
        <div className='about__section__title' role='button' tabIndex={0} onClick={this.handleClick}>
          <Icon id={collapsed ? 'chevron-right' : 'chevron-down'} icon={collapsed ? ChevronRightIcon : ChevronDownIcon} /> {title}
        </div>

        {!collapsed && (
          <div className='about__section__body'>{children}</div>
        )}
      </div>
    );
  }

}

class About extends PureComponent {

  static propTypes = {
    server: ImmutablePropTypes.map,
    locale: ImmutablePropTypes.string,
    extendedDescription: ImmutablePropTypes.map,
    domainBlocks: ImmutablePropTypes.contains({
      isLoading: PropTypes.bool,
      isAvailable: PropTypes.bool,
      items: ImmutablePropTypes.list,
    }),
    dispatch: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
  };

  componentDidMount () {
    const { dispatch } = this.props;
    dispatch(fetchServer());
    dispatch(fetchExtendedDescription());
  }

  handleDomainBlocksOpen = () => {
    const { dispatch } = this.props;
    dispatch(fetchDomainBlocks());
  };

  handleHeaderClick = () => {
    this.column.scrollTop();
  };

  setRef = c => {
    this.column = c;
  };

  render () {
    const { multiColumn, intl, server, extendedDescription, domainBlocks, locale } = this.props;
    const isLoading = server.get('isLoading');

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='info-circle'
          iconComponent={CircleInfo}
          title={intl.formatMessage(messages.title)}
          onClick={this.handleHeaderClick}
          multiColumn={multiColumn}
        />

        <div className='scrollable about'>
          <div className='about__header'>
            <ServerHeroImage blurhash={server.getIn(['thumbnail', 'blurhash'])} src={server.getIn(['thumbnail', 'url'])} srcSet={server.getIn(['thumbnail', 'versions'])?.map((value, key) => `${value} ${key.replace('@', '')}`).join(', ')} className='about__header__hero' />
            <h1>{isLoading ? <Skeleton width='10ch' /> : server.get('domain')}</h1>
            <p>{server.get('description') ? server.get('description') : (<FormattedMessage id='about.powered_by' defaultMessage='Decentralized social media powered by {mastodon}' values={{ mastodon: <a href='https://joinmastodon.org' className='about__mail' target='_blank' rel='noopener'>Mastodon</a> }} />)}</p>
          </div>

          <div className='about__meta'>
            <div className='about__meta__column'>
              <h4><FormattedMessage id='server_banner.administered_by' defaultMessage='Administered by:' /></h4>

              <Account id={server.getIn(['contact', 'account', 'id'])} size={36} minimal />
            </div>

            <hr className='about__meta__divider' />

            <div className='about__meta__column'>
              <h4><FormattedMessage id='about.contact' defaultMessage='Contact:' /></h4>

              {isLoading ? <Skeleton width='10ch' /> : <a className='about__mail' href={`mailto:${server.getIn(['contact', 'email'])}`}>{server.getIn(['contact', 'email'])}</a>}
            </div>
          </div>

          <Section open title={intl.formatMessage(messages.title)}>
            {extendedDescription.get('isLoading') ? (
              <>
                <Skeleton width='100%' />
                <br />
                <Skeleton width='100%' />
                <br />
                <Skeleton width='100%' />
                <br />
                <Skeleton width='70%' />
              </>
            ) : (extendedDescription.get('content')?.length > 0 ? (
              <div
                className='prose'
                dangerouslySetInnerHTML={{ __html: extendedDescription.get('content') }}
              />
            ) : (
              <p><FormattedMessage id='about.not_available' defaultMessage='This information has not been made available on this server.' /></p>
            ))}
          </Section>

          <Section title={intl.formatMessage(messages.limits)}>
            <ServerLimits />
          </Section>

          <Section title={intl.formatMessage(messages.rules)}>
            {!isLoading && (server.get('rules', ImmutableList()).isEmpty() ? (
              <p><FormattedMessage id='about.not_available' defaultMessage='This information has not been made available on this server.' /></p>
            ) : (
              <ol className='rules-list'>
                {server.get('rules').map(rule => {
                  const text = rule.getIn(['translations', locale, 'text']) || rule.getIn(['translations', locale.split('-')[0], 'text']) || rule.get('text');
                  const hint = rule.getIn(['translations', locale, 'hint']) || rule.getIn(['translations', locale.split('-')[0], 'hint']) || rule.get('hint');
                  return (
                    <li key={rule.get('id')}>
                      <div className='rules-list__text'>{text}</div>
                      {hint.length > 0 && (<div className='rules-list__hint'>{hint}</div>)}
                    </li>
                  )})}
              </ol>
            ))}
          </Section>

          <Section title={intl.formatMessage(messages.blocks)} onOpen={this.handleDomainBlocksOpen}>
            {domainBlocks.get('isLoading') ? (
              <>
                <Skeleton width='100%' />
                <br />
                <Skeleton width='70%' />
              </>
            ) : (domainBlocks.get('isAvailable') ? (
              <>
                <p><FormattedMessage id='about.domain_blocks.preamble' defaultMessage='Mastodon generally allows you to view content from and interact with users from any other server in the fediverse. These are the exceptions that have been made on this particular server.' /></p>

                {domainBlocks.get('items').size > 0 && (
                  <div className='about__domain-blocks'>
                    {domainBlocks.get('items').map(block => (
                      <div className='about__domain-blocks__domain' key={block.get('domain')}>
                        <div className='about__domain-blocks__domain__header'>
                          <h6><span title={`SHA-256: ${block.get('digest')}`}>{block.get('domain')}</span></h6>
                          <span className='about__domain-blocks__domain__type' title={intl.formatMessage(severityMessages[block.get('severity')].explanation)}>{intl.formatMessage(severityMessages[block.get('severity')].title)}</span>
                        </div>

                        <p>{(block.get('comment') || '').length > 0 ? block.get('comment') : <FormattedMessage id='about.domain_blocks.no_reason_available' defaultMessage='Reason not available' />}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p><FormattedMessage id='about.not_available' defaultMessage='This information has not been made available on this server.' /></p>
            ))}
          </Section>

          <LinkFooter />

          <div className='about__footer'>
            <p><FormattedMessage id='about.fork_disclaimer' defaultMessage='Glitch-soc is free open source software forked from Mastodon.' /></p>
            <p><FormattedMessage id='about.disclaimer' defaultMessage='Mastodon is free, open-source software, and a trademark of Mastodon gGmbH.' /></p>
          </div>
        </div>

        <Helmet>
          <title>{intl.formatMessage(messages.title)}</title>
          <meta name='robots' content='all' />
        </Helmet>
      </Column>
    );
  }

}

export default connect(mapStateToProps)(injectIntl(About));
