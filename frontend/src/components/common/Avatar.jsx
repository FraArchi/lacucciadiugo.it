import './Avatar.css';

const Avatar = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  ...props
}) => {
  const sizes = {
    xs: 'avatar-xs',
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };
  
  const shapes = {
    circle: 'avatar-circle',
    rounded: 'avatar-rounded',
  };
  
  const avatarClasses = [
    'avatar',
    sizes[size],
    shapes[shape],
    className,
  ].filter(Boolean).join(' ');
  
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Generate background color from name
  const getColor = (name) => {
    if (!name) return 'var(--primary)';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#667eea',
      '#f093fb', '#00d2ff', '#a8edea', '#fed6e3',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  return (
    <div className={avatarClasses} {...props}>
      {src ? (
        <img src={src} alt={alt} className="avatar-image" />
      ) : (
        <div 
          className="avatar-fallback"
          style={{ background: getColor(name) }}
        >
          {getInitials(name)}
        </div>
      )}
      {status && <span className={`avatar-status status-${status}`} />}
    </div>
  );
};

// Avatar Group for stacked avatars
Avatar.Group = ({ children, max = 5, size = 'md', className = '' }) => {
  const avatars = Array.isArray(children) ? children : [children];
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;
  
  return (
    <div className={`avatar-group ${className}`}>
      {visible}
      {remaining > 0 && (
        <div className={`avatar avatar-${size} avatar-circle avatar-more`}>
          <span>+{remaining}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar;
