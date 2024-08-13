// @ts-check

import { getLocale } from '../locales';
import { connectStream } from '../stream';

import {
  fetchAnnouncements,
  updateAnnouncements,
  updateReaction as updateAnnouncementsReaction,
  deleteAnnouncement,
} from './announcements';
import { updateConversations } from './conversations';
import { processNewNotificationForGroups } from './notification_groups';
import { updateNotifications, expandNotifications } from './notifications';
import { updateStatus } from './statuses';
import {
  updateTimeline,
  deleteFromTimelines,
  expandHomeTimeline,
  connectTimeline,
  disconnectTimeline,
  fillHomeTimelineGaps,
  fillPublicTimelineGaps,
  fillCommunityTimelineGaps,
  fillListTimelineGaps,
} from './timelines';

/**
 * @param {number} max
 * @returns {number}
 */
const randomUpTo = max =>
  Math.floor(Math.random() * Math.floor(max));

/**
 * @param {string} timelineId
 * @param {string} channelName
 * @param {Object.<string, string>} params
 * @param {Object} options
 * @param {function(Function, Function): void} [options.fallback]
 * @param {function(): void} [options.fillGaps]
 * @param {function(object): boolean} [options.accept]
 * @returns {function(): void}
 */
export const connectTimelineStream = (timelineId, channelName, params = {}, options = {}) => {
  const { messages } = getLocale();

  return connectStream(channelName, params, (dispatch, getState) => {
    const locale = getState().getIn(['meta', 'locale']);

    // @ts-expect-error
    let pollingId;

    /**
     * @param {function(Function, Function): void} fallback
     */

    const useFallback = fallback => {
      fallback(dispatch, () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- this is not a react hook
        pollingId = setTimeout(() => useFallback(fallback), 20000 + randomUpTo(20000));
      });
    };

    return {
      onConnect() {
        dispatch(connectTimeline(timelineId));

        // @ts-expect-error
        if (pollingId) {
          // @ts-ignore
          clearTimeout(pollingId); pollingId = null;
        }

        if (options.fillGaps) {
          dispatch(options.fillGaps());
        }
      },

      onDisconnect() {
        dispatch(disconnectTimeline({ timeline: timelineId }));

        if (options.fallback) {
          // @ts-expect-error
          pollingId = setTimeout(() => useFallback(options.fallback), randomUpTo(40000));
        }
      },

      onReceive(data) {
        switch (data.event) {
        case 'update':
          // @ts-expect-error
          dispatch(updateTimeline(timelineId, JSON.parse(data.payload), options.accept));
          break;
        case 'status.update':
          // @ts-expect-error
          dispatch(updateStatus(JSON.parse(data.payload)));
          break;
        case 'delete':
          dispatch(deleteFromTimelines(data.payload));
          break;
        case 'notification': {
          // @ts-expect-error
          const notificationJSON = JSON.parse(data.payload);
          dispatch(updateNotifications(notificationJSON, messages, locale));
          // TODO: remove this once the groups feature replaces the previous one
          if(getState().settings.getIn(['notifications', 'groupingBeta'], false)) {
            dispatch(processNewNotificationForGroups(notificationJSON));
          }
          break;
        }
        case 'conversation':
          // @ts-expect-error
          dispatch(updateConversations(JSON.parse(data.payload)));
          break;
        case 'announcement':
          // @ts-expect-error
          dispatch(updateAnnouncements(JSON.parse(data.payload)));
          break;
        case 'announcement.reaction':
          // @ts-expect-error
          dispatch(updateAnnouncementsReaction(JSON.parse(data.payload)));
          break;
        case 'announcement.delete':
          dispatch(deleteAnnouncement(data.payload));
          break;
        }
      },
    };
  });
};

/**
 * @param {Function} dispatch
 * @param {function(): void} done
 */
const refreshHomeTimelineAndNotification = (dispatch, done) => {
  // @ts-expect-error
  dispatch(expandHomeTimeline({}, () =>
    // @ts-expect-error
    dispatch(expandNotifications({}, () =>
      dispatch(fetchAnnouncements(done))))));
};

/**
 * @returns {function(): void}
 */
export const connectUserStream = () =>
  // @ts-expect-error
  connectTimelineStream('home', 'user', {}, { fallback: refreshHomeTimelineAndNotification, fillGaps: fillHomeTimelineGaps });

/**
 * @param {Object} options
 * @param {boolean} [options.onlyMedia]
 * @param {boolean} [options.withReblogs]
 * @param {boolean} [options.withReplies]
 * @returns {function(): void}
 */
export const connectCommunityStream = ({ onlyMedia, withReblogs, withReplies } = {}) =>
  connectTimelineStream(`community${onlyMedia ? ':media' : ''}`, `public:local${onlyMedia ? ':media' : ''}`, {}, { fillGaps: () => (fillCommunityTimelineGaps({ onlyMedia, withReblogs, withReplies })) });

/**
 * @param {Object} options
 * @param {boolean} [options.onlyMedia]
 * @param {boolean} [options.onlyRemote]
 * @param {boolean} [options.allowLocalOnly]
 * @param {boolean} [options.withReblogs]
 * @param {boolean} [options.withReplies]
 * @returns {function(): void}
 */
export const connectPublicStream = ({ onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies } = {}) =>
  connectTimelineStream(`public${onlyRemote ? ':remote' : (allowLocalOnly ? ':allow_local_only' : '')}${onlyMedia ? ':media' : ''}`, `public${onlyRemote ? ':remote' : (allowLocalOnly ? ':allow_local_only' : '')}${onlyMedia ? ':media' : ''}`, {}, { fillGaps: () => fillPublicTimelineGaps({ onlyMedia, onlyRemote, allowLocalOnly, withReblogs, withReplies }) });

/**
 * @param {string} columnId
 * @param {string} tagName
 * @param {boolean} onlyLocal
 * @param {function(object): boolean} accept
 * @returns {function(): void}
 */
export const connectHashtagStream = (columnId, tagName, onlyLocal, accept) =>
  connectTimelineStream(`hashtag:${columnId}${onlyLocal ? ':local' : ''}`, `hashtag${onlyLocal ? ':local' : ''}`, { tag: tagName }, { accept });

/**
 * @returns {function(): void}
 */
export const connectDirectStream = () =>
  connectTimelineStream('direct', 'direct');

/**
 * @param {string} listId
 * @returns {function(): void}
 */
export const connectListStream = listId =>
  connectTimelineStream(`list:${listId}`, 'list', { list: listId }, { fillGaps: () => fillListTimelineGaps(listId) });
