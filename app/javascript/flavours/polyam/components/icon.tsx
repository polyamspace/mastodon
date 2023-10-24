import classNames from 'classnames';

import { isProduction } from '../utils/environment';

// TODO: Replace with FontAwesome types
interface SVGPropsWithTitle extends React.SVGProps<SVGSVGElement> {
  title?: string;
}

export type IconProp = React.FC<SVGPropsWithTitle>;

// Kept fixedWidth prop for now. TODO: Check if that's necessary
interface Props extends React.SVGProps<SVGSVGElement> {
  children?: never;
  id: string;
  icon?: IconProp;
  title?: string;
  fixedWidth?: boolean;
}

export const Icon: React.FC<Props> = ({
  id,
  icon: IconComponent,
  className,
  fixedWidth,
  title: titleProp,
  ...other
}) => {
  if (!IconComponent) {
    // Disable throwing errors as IconComponent will always be undefined currently
    if (!isProduction()) {
      //throw new Error(`<Icon id="${id}" className="${className}"> is missing an "icon" prop.`);
    }

    // Return old icons for now as Material icons won't be implemented
    return (
      // @ts-expect-error Types are not compatible, but still renders correctly
      <i
        className={classNames('fa', `fa-${id}`, className, {
          'fa-fw': fixedWidth,
        })}
        {...other}
      />
    );
  }

  const ariaHidden = titleProp ? undefined : true;
  const role = !ariaHidden ? 'img' : undefined;

  // Set the title to an empty string to remove the built-in SVG one if any
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const title = titleProp || '';

  return (
    <IconComponent
      className={classNames('icon', `icon-${id}`, className)}
      title={title}
      aria-hidden={ariaHidden}
      role={role}
      {...other}
    />
  );
};
