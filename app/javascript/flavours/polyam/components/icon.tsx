import classNames from 'classnames';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { config } from '@fortawesome/fontawesome-svg-core';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { isProduction } from '../utils/environment';

export type IconProp = IconDefinition;

interface Props extends FontAwesomeIconProps {
  children?: never;
  id: string;
  className?: string;
  icon: IconProp;
  title?: string;
}

export const Icon: React.FC<Props> = ({
  id,
  icon: IconComponent,
  className,
  fixedWidth,
  title: titleProp,
  ...other
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!IconComponent) {
    if (!isProduction()) {
      throw new Error(
        `<Icon id="${id}" className="${className}"> is missing an "icon" prop.`,
      );
    }

    IconComponent = faSquare;
  }

  const ariaHidden = titleProp ? undefined : true;
  const role = !ariaHidden ? 'img' : undefined;

  // Set the title to an empty string to remove the built-in SVG one if any
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const title = titleProp || '';

  // prevent FA from trying to insert CSS into page, which causes a CSP violation
  if (config.autoAddCss) {
    config.autoAddCss = false;
  }

  return (
    <FontAwesomeIcon
      className={classNames('icon', `icon-${id}`, className)}
      title={title}
      aria-hidden={ariaHidden}
      role={role}
      icon={IconComponent}
      {...other}
    />
  );
};
