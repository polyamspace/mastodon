import PropTypes from 'prop-types';
import { PureComponent } from 'react';

import { injectIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { Button } from 'flavours/polyam/components/button';
import Column from 'flavours/polyam/components/column';
import { GIF } from 'flavours/polyam/components/gif';

class CopyButton extends PureComponent {

  static propTypes = {
    children: PropTypes.node.isRequired,
    value: PropTypes.string.isRequired,
  };

  state = {
    copied: false,
  };

  handleClick = () => {
    const { value } = this.props;
    navigator.clipboard.writeText(value);
    this.setState({ copied: true });
    this.timeout = setTimeout(() => this.setState({ copied: false }), 700);
  };

  componentWillUnmount () {
    if (this.timeout) clearTimeout(this.timeout);
  }

  render () {
    const { children } = this.props;
    const { copied } = this.state;

    return (
      <Button onClick={this.handleClick} className={copied ? 'copied' : 'copyable'}>{copied ? <FormattedMessage id='copypaste.copied' defaultMessage='Copied' /> : children}</Button>
    );
  }

}

class BundleColumnError extends PureComponent {

  static propTypes = {
    errorType: PropTypes.oneOf(['routing', 'network', 'error']),
    onRetry: PropTypes.func,
    intl: PropTypes.object.isRequired,
    multiColumn: PropTypes.bool,
    stacktrace: PropTypes.string,
  };

  static defaultProps = {
    errorType: 'routing',
  };

  handleRetry = () => {
    const { onRetry } = this.props;

    if (onRetry) {
      onRetry();
    }
  };

  render () {
    const { errorType, multiColumn, stacktrace } = this.props;

    let title, body;

    switch(errorType) {
    case 'routing':
      title = <FormattedMessage id='bundle_column_error.routing.title' defaultMessage='404' />;
      body = <FormattedMessage id='bundle_column_error.routing.body' defaultMessage='The requested page could not be found. Are you sure the URL in the address bar is correct?' />;
      break;
    case 'network':
      title = <FormattedMessage id='bundle_column_error.network.title' defaultMessage='Network error' />;
      body = <FormattedMessage id='bundle_column_error.network.body' defaultMessage='There was an error when trying to load this page. This could be due to a temporary problem with your internet connection or this server.' />;
      break;
    case 'error':
      title = <FormattedMessage id='bundle_column_error.error.title' defaultMessage='Oh, no!' />;
      body = <FormattedMessage id='bundle_column_error.error.body' defaultMessage='The requested page could not be rendered. It could be due to a bug in our code, or a browser compatibility issue.' />;
      break;
    }

    return (
      <Column bindToDocument={!multiColumn}>
        <div className='error-column'>
          <GIF src='/oops.gif' staticSrc='/oops.png' className='error-column__image' />

          <div className='error-column__message'>
            <h1>{title}</h1>
            <p>{body}</p>

            <div className='error-column__message__actions'>
              {errorType === 'network' && <Button onClick={this.handleRetry}><FormattedMessage id='bundle_column_error.retry' defaultMessage='Try again' /></Button>}
              {errorType === 'error' && <CopyButton value={stacktrace}><FormattedMessage id='bundle_column_error.copy_stacktrace' defaultMessage='Copy error report' /></CopyButton>}
              <Link to='/' className={classNames('button', { 'button-tertiary': errorType !== 'routing' })}><FormattedMessage id='bundle_column_error.return' defaultMessage='Go back home' /></Link>
            </div>
          </div>
        </div>

        <Helmet>
          <meta name='robots' content='noindex' />
        </Helmet>
      </Column>
    );
  }

}

export default injectIntl(BundleColumnError);
