import type { Meta, StoryObj } from '@storybook/react-vite';

import VisibilityOffIcon from '@/awesome-icons/regular/eye-slash.svg?react';
import VisibilityIcon from '@/awesome-icons/regular/eye.svg?react';
import KeyboardArrowDownIcon from '@/awesome-icons/solid/chevron-down.svg?react';
import ChevronRightIcon from '@/awesome-icons/solid/chevron-right.svg?react';

import { AvatarById } from '../avatar';
import { Button } from '../button';
import { Icon } from '../icon';

import {
  ListItemWrapper,
  ListItemContent,
  ListItemButton,
  ListItemLink,
} from './index';

const meta = {
  title: 'Components/ListItem',
  component: ListItemWrapper,
  subcomponents: { ListItemContent, ListItemButton, ListItemLink },
} satisfies Meta<typeof ListItemWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NonInteractive: Story = {
  render: () => (
    <ListItemWrapper icon={<Icon icon={VisibilityIcon} id='visibility' />}>
      <ListItemContent>View more</ListItemContent>
    </ListItemWrapper>
  ),
};

export const WithButton: Story = {
  render: () => (
    <ListItemWrapper
      icon={<Icon icon={VisibilityOffIcon} id='visibility' />}
      sideContent={<Icon icon={KeyboardArrowDownIcon} id='down' />}
    >
      <ListItemButton subtitle='You’ve blocked or muted these users'>
        3 hidden accounts
      </ListItemButton>
    </ListItemWrapper>
  ),
};

export const WithLink: Story = {
  render: () => (
    <ListItemWrapper
      icon={<Icon icon={VisibilityIcon} id='visibility' />}
      sideContent={<Icon icon={ChevronRightIcon} id='right' />}
    >
      <ListItemLink to='/'>View more</ListItemLink>
    </ListItemWrapper>
  ),
};

export const WithInteractiveSideContent: Story = {
  render: () => (
    <ListItemWrapper
      icon={<AvatarById accountId='1' size={40} />}
      sideContent={<Button compact>Follow</Button>}
    >
      <ListItemLink to='/' subtitle='@test@example.com'>
        Test account
      </ListItemLink>
    </ListItemWrapper>
  ),
};
