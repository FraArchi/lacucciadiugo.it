import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
  children,
  variant = 'solid',
  padding = 'md',
  hover = true,
  onClick,
  className = '',
  ...props
}) => {
  const variants = {
    solid: 'card-solid',
    glass: 'card-glass',
    outline: 'card-outline',
  };
  
  const paddings = {
    none: '',
    sm: 'card-padding-sm',
    md: 'card-padding-md',
    lg: 'card-padding-lg',
  };
  
  const cardClasses = [
    'card',
    variants[variant],
    paddings[padding],
    hover && 'card-hover',
    onClick && 'card-clickable',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <motion.div
      className={cardClasses}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Sub-components
Card.Header = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

Card.Image = ({ src, alt, className = '' }) => (
  <div className={`card-image ${className}`}>
    <img src={src} alt={alt} />
  </div>
);

export default Card;
