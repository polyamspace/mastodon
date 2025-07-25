import PropTypes from 'prop-types';

import { defineMessages, injectIntl } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import ReactSwipeableViews from 'react-swipeable-views';

import ChevronLeftIcon from '@/awesome-icons/solid/chevron-left.svg?react';
import ChevronRightIcon from '@/awesome-icons/solid/chevron-right.svg?react';
import FitScreenIcon from '@/awesome-icons/solid/down-left-and-up-right-to-center.svg?react';
import ActualSizeIcon from '@/awesome-icons/solid/up-right-and-down-left-from-center.svg?react';
import CloseIcon from '@/awesome-icons/solid/xmark.svg?react';
import { getAverageFromBlurhash } from 'flavours/polyam/blurhash';
import { GIFV } from 'flavours/polyam/components/gifv';
import { Icon }  from 'flavours/polyam/components/icon';
import { IconButton } from 'flavours/polyam/components/icon_button';
import { Footer } from 'flavours/polyam/features/picture_in_picture/components/footer';
import { Video } from 'flavours/polyam/features/video';
import { disableSwiping } from 'flavours/polyam/initial_state';

import { ZoomableImage } from './zoomable_image';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
  previous: { id: 'lightbox.previous', defaultMessage: 'Previous' },
  next: { id: 'lightbox.next', defaultMessage: 'Next' },
  zoomIn: { id: 'lightbox.zoom_in', defaultMessage: 'Zoom to actual size' },
  zoomOut: { id: 'lightbox.zoom_out', defaultMessage: 'Zoom to fit' },
});

class MediaModal extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.list.isRequired,
    statusId: PropTypes.string,
    lang: PropTypes.string,
    index: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    onChangeBackgroundColor: PropTypes.func.isRequired,
    currentTime: PropTypes.number,
    autoPlay: PropTypes.bool,
    volume: PropTypes.number,
  };

  state = {
    index: null,
    navigationHidden: false,
    zoomedIn: false,
  };

  handleZoomClick = () => {
    this.setState(prevState => ({
      zoomedIn: !prevState.zoomedIn,
    }));
  };

  handleZoomChange = (zoomedIn) => {
    this.setState({
      zoomedIn,
    });
  };

  handleSwipe = (index) => {
    this.setState({
      index: index % this.props.media.size,
      zoomedIn: false,
    });
  };

  handleTransitionEnd = () => {
    this.setState({
      zoomedIn: false,
    });
  };

  handleNextClick = () => {
    this.setState({
      index: (this.getIndex() + 1) % this.props.media.size,
      zoomedIn: false,
    });
  };

  handlePrevClick = () => {
    this.setState({
      index: (this.props.media.size + this.getIndex() - 1) % this.props.media.size,
      zoomedIn: false,
    });
  };

  handleChangeIndex = (e) => {
    const index = Number(e.currentTarget.getAttribute('data-index'));

    this.setState({
      index: index % this.props.media.size,
      zoomedIn: false,
    });
  };

  handleKeyDown = (e) => {
    switch(e.key) {
    case 'ArrowLeft':
      this.handlePrevClick();
      e.preventDefault();
      e.stopPropagation();
      break;
    case 'ArrowRight':
      this.handleNextClick();
      e.preventDefault();
      e.stopPropagation();
      break;
    }
  };

  componentDidMount () {
    window.addEventListener('keydown', this.handleKeyDown, false);
    this._sendBackgroundColor();
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.index !== this.state.index) {
      this._sendBackgroundColor();
    }
  }

  _sendBackgroundColor () {
    const { media, onChangeBackgroundColor } = this.props;
    const index = this.getIndex();
    const blurhash = media.getIn([index, 'blurhash']);

    if (blurhash) {
      const backgroundColor = getAverageFromBlurhash(blurhash);
      onChangeBackgroundColor(backgroundColor);
    }
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.props.onChangeBackgroundColor(null);
  }

  getIndex () {
    return this.state.index !== null ? this.state.index : this.props.index;
  }

  handleToggleNavigation = () => {
    this.setState(prevState => ({
      navigationHidden: !prevState.navigationHidden,
    }));
  };

  setRef = c => {
    this.setState({
      viewportWidth: c?.clientWidth,
      viewportHeight: c?.clientHeight,
    });
  };

  render () {
    const { media, statusId, lang, intl, onClose } = this.props;
    const { navigationHidden, zoomedIn, viewportWidth, viewportHeight } = this.state;

    const index = this.getIndex();

    const leftNav  = media.size > 1 && <button tabIndex={0} className='media-modal__nav media-modal__nav--prev' onClick={this.handlePrevClick} aria-label={intl.formatMessage(messages.previous)}><Icon id='chevron-left' icon={ChevronLeftIcon} /></button>;
    const rightNav = media.size > 1 && <button tabIndex={0} className='media-modal__nav  media-modal__nav--next' onClick={this.handleNextClick} aria-label={intl.formatMessage(messages.next)}><Icon id='chevron-right' icon={ChevronRightIcon} /></button>;

    const content = media.map((image, idx) => {
      const width  = image.getIn(['meta', 'original', 'width']) || null;
      const height = image.getIn(['meta', 'original', 'height']) || null;
      const description = image.getIn(['translation', 'description']) || image.get('description');

      if (image.get('type') === 'image') {
        return (
          <ZoomableImage
            src={image.get('url')}
            blurhash={image.get('blurhash')}
            width={width}
            height={height}
            alt={description}
            lang={lang}
            key={image.get('url')}
            onClick={this.handleToggleNavigation}
            onDoubleClick={this.handleZoomClick}
            onClose={onClose}
            onZoomChange={this.handleZoomChange}
            zoomedIn={zoomedIn && idx === index}
          />
        );
      } else if (image.get('type') === 'video') {
        const { currentTime, autoPlay, volume } = this.props;

        return (
          <Video
            preview={image.get('preview_url')}
            blurhash={image.get('blurhash')}
            src={image.get('url')}
            width={image.get('width')}
            height={image.get('height')}
            frameRate={image.getIn(['meta', 'original', 'frame_rate'])}
            startTime={currentTime || 0}
            startPlaying={autoPlay || false}
            startVolume={volume || 1}
            onCloseVideo={onClose}
            detailed
            alt={description}
            lang={lang}
            key={image.get('url')}
          />
        );
      } else if (image.get('type') === 'gifv') {
        return (
          <GIFV
            src={image.get('url')}
            width={width}
            height={height}
            key={image.get('url')}
            alt={description}
            lang={lang}
            onClick={this.toggleNavigation}
          />
        );
      }

      return null;
    }).toArray();

    // you can't use 100vh, because the viewport height is taller
    // than the visible part of the document in some mobile
    // browsers when it's address bar is visible.
    // https://developers.google.com/web/updates/2016/12/url-bar-resizing
    const swipeableViewsStyle = {
      width: '100%',
      height: '100%',
    };

    const containerStyle = {
      alignItems: 'center', // center vertically
    };

    const navigationClassName = classNames('media-modal__navigation', {
      'media-modal__navigation--hidden': navigationHidden,
    });

    let pagination;

    if (media.size > 1) {
      pagination = media.map((item, i) => (
        <button key={i} className={classNames('media-modal__page-dot', { active: i === index })} data-index={i} onClick={this.handleChangeIndex}>
          {i + 1}
        </button>
      ));
    }

    const currentMedia = media.get(index);
    const zoomable = currentMedia.get('type') === 'image' && (currentMedia.getIn(['meta', 'original', 'width']) > viewportWidth || currentMedia.getIn(['meta', 'original', 'height']) > viewportHeight);

    return (
      <div className='modal-root__modal media-modal' ref={this.setRef}>
        <div className='media-modal__closer' role='presentation' onClick={onClose}>
          <ReactSwipeableViews
            style={swipeableViewsStyle}
            containerStyle={containerStyle}
            onChangeIndex={this.handleSwipe}
            onTransitionEnd={this.handleTransitionEnd}
            index={index}
            disabled={disableSwiping || zoomedIn}
          >
            {content}
          </ReactSwipeableViews>
        </div>

        <div className={navigationClassName}>
          <div className='media-modal__buttons'>
            {zoomable && <IconButton title={intl.formatMessage(zoomedIn ? messages.zoomOut : messages.zoomIn)} iconComponent={zoomedIn ? FitScreenIcon : ActualSizeIcon} onClick={this.handleZoomClick} />}
            <IconButton title={intl.formatMessage(messages.close)} icon='times' iconComponent={CloseIcon} onClick={onClose} />
          </div>

          {leftNav}
          {rightNav}

          <div className='media-modal__overlay'>
            {pagination && <ul className='media-modal__pagination'>{pagination}</ul>}
            {statusId && <Footer statusId={statusId} withOpenButton onClose={onClose} />}
          </div>
        </div>
      </div>
    );
  }

}

export default injectIntl(MediaModal);
