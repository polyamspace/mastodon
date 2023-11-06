import { openModal } from './modal';
import { changeSetting, saveSettings } from './settings';

export const INTRODUCTION_VERSION = 20181216044202;

export const closeOnboarding = () => dispatch => {
  dispatch(changeSetting(['introductionVersion'], INTRODUCTION_VERSION));
  dispatch(saveSettings());
};

export function showOnboardingOnce() {
  return (dispatch, getState) => {
    const alreadySeen = getState().getIn(['settings', 'onboarded']);

    if (!alreadySeen) {
      dispatch(openModal({
        modalType: 'ONBOARDING',
      }));
      dispatch(changeSetting(['onboarded'], true));
      dispatch(saveSettings());
    }
  };
}
