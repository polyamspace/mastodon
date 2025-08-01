import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { createPortal } from 'react-dom';

import { fromJS } from 'immutable';

import { ImmutableHashtag as Hashtag } from 'flavours/polyam/components/hashtag';
import MediaGallery from 'flavours/polyam/components/media_gallery';
import ModalRoot from 'flavours/polyam/components/modal_root';
import { Poll } from 'flavours/polyam/components/poll';
import { Audio } from 'flavours/polyam/features/audio';
import Card from 'flavours/polyam/features/status/components/card';
import MediaModal from 'flavours/polyam/features/ui/components/media_modal';
import { Video } from 'flavours/polyam/features/video';
import { IntlProvider } from 'flavours/polyam/locales';
import { createPollFromServerJSON } from 'flavours/polyam/models/poll';

const MEDIA_COMPONENTS = { MediaGallery, Video, Card, Poll, Hashtag, Audio };

export default class MediaContainer extends PureComponent {

  static propTypes = {
    components: PropTypes.object.isRequired,
  };

  state = {
    media: null,
    index: null,
    lang: null,
    time: null,
    backgroundColor: null,
    options: null,
  };

  handleOpenMedia = (media, index, lang) => {
    this.setState({ media, index, lang });
  };

  handleOpenVideo = (lang, options) => {
    const { components } = this.props;
    const { media } = JSON.parse(components[options.componentIndex].getAttribute('data-props'));
    const mediaList = fromJS(media);

    this.setState({ media: mediaList, lang, options });
  };

  handleCloseMedia = () => {
    this.setState({
      media: null,
      index: null,
      time: null,
      backgroundColor: null,
      options: null,
    });
  };

  setBackgroundColor = color => {
    this.setState({ backgroundColor: color });
  };

  render () {
    const { components } = this.props;

    let handleOpenVideo;

    // Don't offer to expand the video in a lightbox if we're in a frame
    if (window.self === window.top) {
      handleOpenVideo = this.handleOpenVideo;
    }

    return (
      <IntlProvider>
        <>
          {Array.from(components).map((component, i) => {
            const componentName = component.getAttribute('data-component');
            const Component = MEDIA_COMPONENTS[componentName];
            const { media, card, poll, hashtag, ...props } = JSON.parse(component.getAttribute('data-props'));

            Object.assign(props, {
              ...(media   ? { media:   fromJS(media)   } : {}),
              ...(card    ? { card:    fromJS(card)    } : {}),
              ...(poll    ? { poll:    createPollFromServerJSON(poll)    } : {}),
              ...(hashtag ? { hashtag: fromJS(hashtag) } : {}),

              ...(componentName === 'Video' ? {
                componentIndex: i,
                onOpenVideo: handleOpenVideo,
              } : {
                onOpenMedia: this.handleOpenMedia,
              }),
            });

            return createPortal(
              <Component {...props} key={`media-${i}`} />,
              component,
            );
          })}

          <ModalRoot backgroundColor={this.state.backgroundColor} onClose={this.handleCloseMedia}>
            {this.state.media && (
              <MediaModal
                media={this.state.media}
                index={this.state.index || 0}
                lang={this.state.lang}
                currentTime={this.state.options?.startTime}
                autoPlay={this.state.options?.autoPlay}
                volume={this.state.options?.defaultVolume}
                onClose={this.handleCloseMedia}
                onChangeBackgroundColor={this.setBackgroundColor}
              />
            )}
          </ModalRoot>
        </>
      </IntlProvider>
    );
  }

}
