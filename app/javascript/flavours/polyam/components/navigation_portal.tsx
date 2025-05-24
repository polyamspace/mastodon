import Trends from 'flavours/polyam/features/getting_started/containers/trends_container';
import { showTrends } from 'flavours/polyam/initial_state';

export const NavigationPortal: React.FC = () => (
  <div className='navigation-panel__portal'>{showTrends && <Trends />}</div>
);
