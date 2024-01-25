import ComposeFormContainer from 'flavours/polyam/features/compose/containers/compose_form_container';
import LoadingBarContainer from 'flavours/polyam/features/ui/containers/loading_bar_container';
import ModalContainer from 'flavours/polyam/features/ui/containers/modal_container';
import NotificationsContainer from 'flavours/polyam/features/ui/containers/notifications_container';

const Compose = () => (
  <>
    <ComposeFormContainer autoFocus withoutNavigation />
    <NotificationsContainer />
    <ModalContainer />
    <LoadingBarContainer className='loading-bar' />
  </>
);

export default Compose;
