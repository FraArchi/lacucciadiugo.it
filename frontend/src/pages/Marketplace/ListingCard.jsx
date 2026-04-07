import { Link } from 'react-router-dom';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const CONDITION_LABELS = {
  NEW: 'Nuovo',
  LIKE_NEW: 'Come nuovo',
  GOOD: 'Buono',
  USED: 'Usato',
  FOR_PARTS: 'Per ricambi',
};

const ListingCard = ({ listing, getCategoryLabel }) => {
  const {
    id,
    title,
    price,
    currency = 'EUR',
    category,
    condition,
    images = [],
    location,
    createdAt,
  } = listing;
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Oggi';
    if (diffDays === 1) return 'Ieri';
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };
  
  const mainImage = images[0] || '/placeholder-product.jpg';
  const conditionLabel = CONDITION_LABELS[condition] || condition;
  
  return (
    <Link to={`/app/marketplace/${id}`} style={{ textDecoration: 'none' }}>
      <motion.div 
        className="listing-card"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="listing-image">
          <img 
            src={mainImage} 
            alt={title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/280x200?text=🐕';
            }}
          />
          {condition === 'NEW' && (
            <span className="listing-badge nuovo">Nuovo</span>
          )}
          {conditionLabel && condition !== 'NEW' && (
            <span className="listing-condition">{conditionLabel}</span>
          )}
        </div>
        
        <div className="listing-content">
          <span className="listing-category">
            {getCategoryLabel ? getCategoryLabel(category) : category}
          </span>
          <h3 className="listing-title">{title}</h3>
          <div className="listing-price">{formatPrice(price)}</div>
          
          <div className="listing-meta">
            {location && (
              <span className="listing-location">
                <MapPinIcon />
                {location}
              </span>
            )}
            <span className="listing-date">{formatDate(createdAt)}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ListingCard;
