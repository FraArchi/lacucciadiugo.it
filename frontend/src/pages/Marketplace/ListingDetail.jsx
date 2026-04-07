import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { marketplaceAPI } from '@/services/api';
import { useMarketplaceStore } from '@/store';
import { Button, Avatar, Card } from '@/components/common';
import toast from 'react-hot-toast';
import './Marketplace.css';

const CONDITION_LABELS = {
  NEW: 'Nuovo',
  LIKE_NEW: 'Come nuovo',
  GOOD: 'Buono',
  USED: 'Usato',
  FOR_PARTS: 'Per ricambi',
};

const CATEGORY_LABELS = {
  FOOD: '🍖 Cibo',
  ACCESSORIES: '🎀 Accessori',
  TOYS: '🎾 Giocattoli',
  CLOTHING: '👕 Abbigliamento',
  HEALTH: '💊 Salute',
  GROOMING: '🛁 Toelettatura',
  TRAINING: '🎓 Addestramento',
  SERVICES: '🔧 Servizi',
  OTHER: '📦 Altro',
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedListing, selectListing, setLoading, isLoading } = useMarketplaceStore();
  
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  useEffect(() => {
    fetchListing();
  }, [id]);
  
  const fetchListing = async () => {
    setLoading(true);
    try {
      const response = await marketplaceAPI.getListing(id);
      selectListing(response.data);
    } catch (err) {
      console.error('Failed to fetch listing:', err);
      toast.error('Annuncio non trovato');
      navigate('/app/marketplace');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim()) {
      toast.error('Scrivi un messaggio');
      return;
    }
    
    setIsSending(true);
    try {
      await marketplaceAPI.sendInquiry(id, { message: inquiryMessage });
      toast.success('Messaggio inviato al venditore!');
      setInquiryMessage('');
    } catch (err) {
      console.error('Failed to send inquiry:', err);
      toast.error('Errore nell\'invio. Riprova.');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedListing?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiato!');
    }
  };
  
  const formatPrice = (price, currency = 'EUR') => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency,
    }).format(price);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  if (isLoading || !selectedListing) {
    return (
      <div className="listing-detail-page">
        <div className="listing-detail-grid">
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: 500, borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }
  
  const listing = selectedListing;
  const images = listing.images?.length > 0 
    ? listing.images 
    : ['https://via.placeholder.com/600x400?text=🐕'];
  
  return (
    <div className="listing-detail-page">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <ArrowLeftIcon style={{ width: 20, height: 20, marginRight: 8 }} />
        Torna al marketplace
      </Button>
      
      <motion.div 
        className="listing-detail-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Gallery */}
        <div className="listing-gallery">
          <div className="gallery-main">
            <img 
              src={images[activeImage]} 
              alt={listing.title}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=🐕';
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className={`gallery-thumb ${index === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${listing.title} ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x60?text=🐕';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Description under gallery */}
          {listing.description && (
            <div style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ marginBottom: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
                Descrizione
              </h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.7 }}>
                {listing.description}
              </p>
            </div>
          )}
        </div>
        
        {/* Info Panel */}
        <div className="listing-info">
          <span className="category-badge">
            {CATEGORY_LABELS[listing.category] || listing.category}
          </span>
          
          <h1>{listing.title}</h1>
          
          <div className="price">{formatPrice(listing.price, listing.currency)}</div>
          
          {/* Details */}
          <div className="listing-details">
            <div className="detail-row">
              <span className="detail-label">Condizione</span>
              <span className="detail-value">
                {CONDITION_LABELS[listing.condition] || listing.condition}
              </span>
            </div>
            {listing.location && (
              <div className="detail-row">
                <span className="detail-label">Località</span>
                <span className="detail-value">
                  <MapPinIcon style={{ width: 16, height: 16, display: 'inline', marginRight: 4 }} />
                  {listing.location}
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Pubblicato</span>
              <span className="detail-value">{formatDate(listing.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Visualizzazioni</span>
              <span className="detail-value">{listing.views || 0}</span>
            </div>
          </div>
          
          {/* Seller Info */}
          <div className="seller-info">
            <Avatar 
              src={listing.seller?.avatar} 
              name={listing.seller?.firstName || 'Venditore'} 
              size="lg"
            />
            <div className="seller-details">
              <h4>
                {listing.seller?.firstName} {listing.seller?.lastName?.[0]}.
              </h4>
              <span>
                <MapPinIcon style={{ width: 14, height: 14, display: 'inline' }} /> 
                {listing.seller?.location || 'Italia'}
              </span>
            </div>
          </div>
          
          {/* Inquiry Form */}
          <div className="inquiry-form">
            <textarea
              placeholder="Scrivi un messaggio al venditore..."
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
            />
            <Button 
              fullWidth 
              onClick={handleSendInquiry}
              disabled={isSending}
              icon={<ChatBubbleLeftIcon />}
            >
              {isSending ? 'Invio...' : 'Contatta venditore'}
            </Button>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button 
              variant="outline" 
              onClick={() => setIsFavorite(!isFavorite)}
              style={{ flex: 1 }}
            >
              {isFavorite ? (
                <HeartSolidIcon style={{ width: 20, height: 20, color: 'var(--error)' }} />
              ) : (
                <HeartIcon style={{ width: 20, height: 20 }} />
              )}
            </Button>
            <Button variant="outline" onClick={handleShare} style={{ flex: 1 }}>
              <ShareIcon style={{ width: 20, height: 20 }} />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ListingDetail;
