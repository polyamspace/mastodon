import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { FormattedMessage, injectIntl } from 'react-intl';

import classnames from 'classnames';
import { withRouter } from 'react-router-dom';

import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ChevronRightIcon from '@/material-icons/400-24px/chevron_right.svg?react';
import { Icon } from 'flavours/glitch/components/icon';
import { Poll } from 'flavours/glitch/components/poll';
import { identityContextPropShape, withIdentity } from 'flavours/glitch/identity_context';
import { autoPlayGif, languages as preloadedLanguages } from 'flavours/glitch/initial_state';
import { highlightCode } from 'flavours/glitch/utils/html';
import { decode as decodeIDNA } from 'flavours/glitch/utils/idna';

const MAX_HEIGHT = 706; // 22px * 32 (+ 2px padding at the top)

const textMatchesTarget = (text, origin, host) => {
  return (text === origin || text === host
          || text.startsWith(origin + '/') || text.startsWith(host + '/')
          || 'www.' + text === host || ('www.' + text).startsWith(host + '/'));
};

const isLinkMisleading = (link) => {
  let linkTextParts = [];

  // Reconstruct visible text, as we do not have much control over how links
  // from remote software look, and we can't rely on `innerText` because the
  // `invisible` class does not set `display` to `none`.

  const walk = (node) => {
    switch (node.nodeType) {
    case Node.TEXT_NODE:
      linkTextParts.push(node.textContent);
      break;
    case Node.ELEMENT_NODE: {
      if (node.classList.contains('invisible')) return;
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        walk(children[i]);
      }
      break;
    }
    }
  };

  walk(link);

  const linkText = linkTextParts.join('');
  const targetURL = new URL(link.href);

  if (targetURL.protocol === 'magnet:') {
    return !linkText.startsWith('magnet:');
  }

  if (targetURL.protocol === 'xmpp:') {
    return !(linkText === targetURL.href || 'xmpp:' + linkText === targetURL.href);
  }

  // The following may not work with international domain names
  if (textMatchesTarget(linkText, targetURL.origin, targetURL.host) || textMatchesTarget(linkText.toLowerCase(), targetURL.origin, targetURL.host)) {
    return false;
  }

  // The link hasn't been recognized, maybe it features an international domain name
  const hostname = decodeIDNA(targetURL.hostname).normalize('NFKC');
  const host = targetURL.host.replace(targetURL.hostname, hostname);
  const origin = targetURL.origin.replace(targetURL.host, host);
  const text = linkText.normalize('NFKC');
  return !(textMatchesTarget(text, origin, host) || textMatchesTarget(text.toLowerCase(), origin, host));
};

/**
 *
 * @param {any} status
 * @returns {string}
 */
export function getStatusContent(status) {
  return status.getIn(['translation', 'contentHtml']) || status.get('contentHtml');
}

class TranslateButton extends PureComponent {

  static propTypes = {
    translation: ImmutablePropTypes.map,
    onClick: PropTypes.func,
  };

  render () {
    const { translation, onClick } = this.props;

    if (translation) {
      const language     = preloadedLanguages.find(lang => lang[0] === translation.get('detected_source_language'));
      const languageName = language ? language[1] : translation.get('detected_source_language');
      const provider     = translation.get('provider');

      return (
        <div className='translate-button'>
          <div className='translate-button__meta'>
            <FormattedMessage id='status.translated_from_with' defaultMessage='Translated from {lang} using {provider}' values={{ lang: languageName, provider }} />
          </div>

          <button className='link-button' onClick={onClick}>
            <FormattedMessage id='status.show_original' defaultMessage='Show original' />
          </button>
        </div>
      );
    }

    return (
      <button className='status__content__translate-button' onClick={onClick}>
        <FormattedMessage id='status.translate' defaultMessage='Translate' />
      </button>
    );
  }

}

const mapStateToProps = state => ({
  languages: state.getIn(['server', 'translationLanguages', 'items']),
});

class StatusContent extends PureComponent {
  static propTypes = {
    identity: identityContextPropShape,
    status: ImmutablePropTypes.map.isRequired,
    statusContent: PropTypes.string,
    onTranslate: PropTypes.func,
    onClick: PropTypes.func,
    collapsible: PropTypes.bool,
    onCollapsedToggle: PropTypes.func,
    tagLinks: PropTypes.bool,
    rewriteMentions: PropTypes.string,
    languages: ImmutablePropTypes.map,
    intl: PropTypes.object,
    // from react-router
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  static defaultProps = {
    tagLinks: true,
    rewriteMentions: 'no',
  };

  _updateStatusLinks () {
    const node = this.node;
    const { tagLinks, rewriteMentions } = this.props;

    if (!node) {
      return;
    }

    const { status, onCollapsedToggle } = this.props;
    const links = node.querySelectorAll('a');

    let link, mention;

    for (var i = 0; i < links.length; ++i) {
      link = links[i];

      if (link.classList.contains('status-link')) {
        continue;
      }

      link.classList.add('status-link');

      mention = this.props.status.get('mentions').find(item => link.href === item.get('url'));

      if (mention) {
        link.addEventListener('click', this.onMentionClick.bind(this, mention), false);
        link.setAttribute('title', `@${mention.get('acct')}`);
        link.setAttribute('data-hover-card-account', mention.get('id'));
        if (rewriteMentions !== 'no') {
          while (link.firstChild) link.removeChild(link.firstChild);
          link.appendChild(document.createTextNode('@'));
          const acctSpan = document.createElement('span');
          acctSpan.textContent = rewriteMentions === 'acct' ? mention.get('acct') : mention.get('username');
          link.appendChild(acctSpan);
        }
      } else if (link.textContent[0] === '#' || (link.previousSibling && link.previousSibling.textContent && link.previousSibling.textContent[link.previousSibling.textContent.length - 1] === '#')) {
        link.addEventListener('click', this.onHashtagClick.bind(this, link.text), false);
        link.setAttribute('data-menu-hashtag', this.props.status.getIn(['account', 'id']));
      } else {
        link.setAttribute('title', link.href);
        link.classList.add('unhandled-link');

        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener nofollow noreferrer');

        try {
          if (tagLinks && isLinkMisleading(link)) {
            // Add a tag besides the link to display its origin

            const url = new URL(link.href);
            const tag = document.createElement('span');
            tag.classList.add('link-origin-tag');
            switch (url.protocol) {
            case 'xmpp:':
              tag.textContent = `[${url.href}]`;
              break;
            case 'magnet:':
              tag.textContent = '(magnet)';
              break;
            default:
              tag.textContent = `[${url.host}]`;
            }
            link.insertAdjacentText('beforeend', ' ');
            link.insertAdjacentElement('beforeend', tag);
          }
        } catch (e) {
          // The URL is invalid, remove the href just to be safe
          if (tagLinks && e instanceof TypeError) link.removeAttribute('href');
        }
      }
    }

    if (status.get('collapsed', null) === null && onCollapsedToggle) {
      const { collapsible, onClick } = this.props;

      const collapsed =
          collapsible
          && onClick
          && node.clientHeight > MAX_HEIGHT
          && status.get('spoiler_text').length === 0;

      onCollapsedToggle(collapsed);
    }
  }

  handleMouseEnter = ({ currentTarget }) => {
    if (autoPlayGif) {
      return;
    }

    const emojis = currentTarget.querySelectorAll('.custom-emoji');

    for (var i = 0; i < emojis.length; i++) {
      let emoji = emojis[i];
      emoji.src = emoji.getAttribute('data-original');
    }
  };

  handleMouseLeave = ({ currentTarget }) => {
    if (autoPlayGif) {
      return;
    }

    const emojis = currentTarget.querySelectorAll('.custom-emoji');

    for (var i = 0; i < emojis.length; i++) {
      let emoji = emojis[i];
      emoji.src = emoji.getAttribute('data-static');
    }
  };

  componentDidMount () {
    this._updateStatusLinks();
  }

  componentDidUpdate () {
    this._updateStatusLinks();
  }

  onMentionClick = (mention, e) => {
    if (this.props.history && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.props.history.push(`/@${mention.get('acct')}`);
    }
  };

  onHashtagClick = (hashtag, e) => {
    hashtag = hashtag.replace(/^#/, '');

    if (this.props.history && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.props.history.push(`/tags/${hashtag}`);
    }
  };

  handleMouseDown = (e) => {
    this.startXY = [e.clientX, e.clientY];
  };

  handleMouseUp = (e) => {
    if (!this.startXY) {
      return;
    }

    const [ startX, startY ] = this.startXY;
    const [ deltaX, deltaY ] = [Math.abs(e.clientX - startX), Math.abs(e.clientY - startY)];

    let element = e.target;
    while (element !== e.currentTarget) {
      if (['button', 'video', 'a', 'label', 'canvas'].includes(element.localName) || element.getAttribute('role') === 'button') {
        return;
      }
      element = element.parentNode;
    }

    if (deltaX + deltaY < 5 && (e.button === 0 || e.button === 1) && e.detail >= 1 && this.props.onClick) {
      this.props.onClick(e);
    }

    this.startXY = null;
  };

  handleTranslate = () => {
    this.props.onTranslate();
  };

  setRef = (c) => {
    this.node = c;
  };

  render () {
    const { status, intl, statusContent } = this.props;

    const renderReadMore = this.props.onClick && status.get('collapsed');
    const contentLocale = intl.locale.replace(/[_-].*/, '');
    const targetLanguages = this.props.languages?.get(status.get('language') || 'und');
    const renderTranslate = this.props.onTranslate && this.props.identity.signedIn && ['public', 'unlisted'].includes(status.get('visibility')) && status.get('search_index').trim().length > 0 && targetLanguages?.includes(contentLocale);

    const content = { __html: highlightCode(statusContent ?? getStatusContent(status)) };
    const language = status.getIn(['translation', 'language']) || status.get('language');
    const classNames = classnames('status__content', {
      'status__content--with-action': this.props.onClick && this.props.history,
      'status__content--collapsed': renderReadMore,
    });

    const readMoreButton = renderReadMore && (
      <button className='status__content__read-more-button' onClick={this.props.onClick} key='read-more'>
        <FormattedMessage id='status.read_more' defaultMessage='Read more' /><Icon id='angle-right' icon={ChevronRightIcon} />
      </button>
    );

    const translateButton = renderTranslate && (
      <TranslateButton onClick={this.handleTranslate} translation={status.get('translation')} />
    );

    const poll = !!status.get('poll') && (
      <Poll pollId={status.get('poll')} status={status} lang={language} />
    );

    if (this.props.onClick) {
      return (
        <>
          <div className={classNames} ref={this.setRef} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} key='status-content' onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
            <div className='status__content__text status__content__text--visible translate' lang={language} dangerouslySetInnerHTML={content} />

            {poll}
            {translateButton}
          </div>

          {readMoreButton}
        </>
      );
    } else {
      return (
        <div className={classNames} ref={this.setRef} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
          <div className='status__content__text status__content__text--visible translate' lang={language} dangerouslySetInnerHTML={content} />

          {poll}
          {translateButton}
        </div>
      );
    }
  }

}

export default withRouter(withIdentity(connect(mapStateToProps)(injectIntl(StatusContent))));
