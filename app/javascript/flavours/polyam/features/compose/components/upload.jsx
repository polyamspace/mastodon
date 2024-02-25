import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { faPencil, faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import spring from 'react-motion/lib/spring';

import { Blurhash } from 'flavours/polyam/components/blurhash';
import { Icon }  from 'flavours/polyam/components/icon';

import Motion from '../../ui/util/optional_motion';

export default class Upload extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.map.isRequired,
    sensitive: PropTypes.bool,
    onUndo: PropTypes.func.isRequired,
    onOpenFocalPoint: PropTypes.func.isRequired,
  };

  handleUndoClick = e => {
    e.stopPropagation();
    this.props.onUndo(this.props.media.get('id'));
  };

  handleFocalPointClick = e => {
    e.stopPropagation();
    this.props.onOpenFocalPoint(this.props.media.get('id'));
  };

  render () {
    const { media, sensitive } = this.props;

    if (!media) {
      return null;
    }

    const focusX = media.getIn(['meta', 'focus', 'x']);
    const focusY = media.getIn(['meta', 'focus', 'y']);
    const x = ((focusX /  2) + .5) * 100;
    const y = ((focusY / -2) + .5) * 100;
    const missingDescription = (media.get('description') || '').length === 0;

    return (
      <div className='compose-form__upload'>
        <Motion defaultStyle={{ scale: 0.8 }} style={{ scale: spring(1, { stiffness: 180, damping: 12 }) }}>
          {({ scale }) => (
            <div className='compose-form__upload__thumbnail' style={{ transform: `scale(${scale})`, backgroundImage: !sensitive ? `url(${media.get('preview_url')})` : null, backgroundPosition: `${x}% ${y}%` }}>
              {sensitive && <Blurhash
                hash={media.get('blurhash')}
                className='compose-form__upload__preview'
              />}
              <div className='compose-form__upload__actions'>
                <button type='button' className='icon-button compose-form__upload__delete' onClick={this.handleUndoClick}><Icon icon={faTimes} /></button>
                <button type='button' className='icon-button' onClick={this.handleFocalPointClick}><Icon icon={faPencil} /> <FormattedMessage id='upload_form.edit' defaultMessage='Edit' /></button>
              </div>

              <div className='compose-form__upload__warning'>
                <button type='button' className={classNames('icon-button', { active: missingDescription })} onClick={this.handleFocalPointClick}>{missingDescription && <Icon icon={faExclamationTriangle} />} ALT</button>
              </div>
            </div>
          )}
        </Motion>
      </div>
    );
  }

}
