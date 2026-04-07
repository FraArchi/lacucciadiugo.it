import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  MapPinIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const GroupCard = ({ group, onJoin, isMember = false }) => {
  const {
    slug,
    name,
    description,
    coverImage,
    location,
    region,
    memberCount = 0,
    isVerified = false,
    isPrivate = false,
    members = [], // Preview of members
  } = group;
  
  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMember) {
      onJoin?.();
    }
  };
  
  return (
    <Link to={`/app/community/${slug}`} style={{ textDecoration: 'none' }}>
      <motion.div 
        className="group-card"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="group-cover">
          <img 
            src={coverImage || 'https://via.placeholder.com/400x140?text=🐕+Community'}
            alt={name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x140?text=🐕';
            }}
          />
          <div className="group-badge">
            {isVerified && (
              <span className="badge verified">
                <CheckBadgeIcon style={{ width: 14, height: 14 }} />
                Verificato
              </span>
            )}
            {isPrivate && (
              <span className="badge private">
                <LockClosedIcon style={{ width: 14, height: 14 }} />
                Privato
              </span>
            )}
            {(location || region) && (
              <span className="badge location">
                <MapPinIcon style={{ width: 14, height: 14 }} />
                {location || region}
              </span>
            )}
          </div>
        </div>
        
        <div className="group-content">
          <h3 className="group-name">
            {name}
            {isVerified && (
              <CheckBadgeIcon style={{ color: 'var(--secondary)' }} />
            )}
          </h3>
          
          {description && (
            <p className="group-description">{description}</p>
          )}
          
          <div className="group-stats">
            <div className="member-count">
              <div className="member-avatars">
                {members.slice(0, 3).map((member, i) => (
                  <img 
                    key={member.id || i}
                    className="avatar"
                    src={member.avatar || `https://via.placeholder.com/28?text=${i + 1}`}
                    alt="Member"
                  />
                ))}
                {memberCount > 3 && (
                  <span className="avatar-more">+{memberCount - 3}</span>
                )}
              </div>
              <span>
                <UserGroupIcon style={{ width: 16, height: 16, marginRight: 4, display: 'inline' }} />
                {memberCount} {memberCount === 1 ? 'membro' : 'membri'}
              </span>
            </div>
            
            <button 
              className={`join-btn ${isMember ? 'joined' : ''}`}
              onClick={handleJoinClick}
            >
              {isMember ? 'Iscritto' : 'Unisciti'}
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default GroupCard;
