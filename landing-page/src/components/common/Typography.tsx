import React, { ReactNode, CSSProperties } from 'react';

interface TypographyProps {
  children: ReactNode;
  variant?: 'displayLarge' | 'displayMedium' | 'bodyText' | 'navText';
  className?: string;
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
}

// Typography components to enforce consistent styling
export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'bodyText',
  className = '',
  align = 'left',
  style,
  ...props
}) => {
  const textAlign = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const variants = {
    displayLarge: {
      element: 'h1',
      className: 'font-sans text-display-large leading-normal tracking-[-0.019em] font-bold',
    },
    displayMedium: {
      element: 'h2',
      className: 'font-sans text-display-medium leading-normal tracking-[-0.019em] font-semibold',
    },
    bodyText: {
      element: 'p',
      className: 'font-serif text-body leading-normal tracking-[-0.019em] font-normal',
    },
    navText: {
      element: 'span',
      className: 'font-sans text-nav leading-normal tracking-[-0.019em] font-bold',
    },
  };

  const { element, className: variantClass } = variants[variant];
  
  const combinedClassName = `${variantClass} ${textAlign[align]} ${className}`;
  
  // Use a switch statement to render the correct element
  switch (element) {
    case 'h1':
      return <h1 className={combinedClassName} style={style} {...props}>{children}</h1>;
    case 'h2':
      return <h2 className={combinedClassName} style={style} {...props}>{children}</h2>;
    case 'p':
      return <p className={combinedClassName} style={style} {...props}>{children}</p>;
    case 'span':
      return <span className={combinedClassName} style={style} {...props}>{children}</span>;
    default:
      return <div className={combinedClassName} style={style} {...props}>{children}</div>;
  }
};

// Convenience components
export const DisplayLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="displayLarge" {...props} />
);

export const DisplayMedium: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="displayMedium" align="center" {...props} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="bodyText" align="center" {...props} />
);

export const NavText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="navText" {...props} />
);

export default Typography; 