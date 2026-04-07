import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  MapPinIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useMarketplaceStore } from '@/store';
import { marketplaceAPI } from '@/services/api';
import { Button } from '@/components/common';
import ListingCard from './ListingCard';
import toast from 'react-hot-toast';
import './Marketplace.css';

const CATEGORIES = [
  { value: '', label: 'Tutte le categorie' },
  { value: 'FOOD', label: '🍖 Cibo' },
  { value: 'ACCESSORIES', label: '🎀 Accessori' },
  { value: 'TOYS', label: '🎾 Giocattoli' },
  { value: 'CLOTHING', label: '👕 Abbigliamento' },
  { value: 'HEALTH', label: '💊 Salute' },
  { value: 'GROOMING', label: '🛁 Toelettatura' },
  { value: 'TRAINING', label: '🎓 Addestramento' },
  { value: 'SERVICES', label: '🔧 Servizi' },
  { value: 'OTHER', label: '📦 Altro' },
];

const LOCATIONS = [
  { value: '', label: 'Tutta Italia' },
  { value: 'Roma', label: 'Roma' },
  { value: 'Milano', label: 'Milano' },
  { value: 'Napoli', label: 'Napoli' },
  { value: 'Lazio', label: 'Lazio (regione)' },
  { value: 'Lombardia', label: 'Lombardia' },
];

const MarketplaceList = () => {
  const { 
    listings, 
    setListings, 
    filters, 
    setFilters, 
    isLoading, 
    setLoading 
  } = useMarketplaceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchListings();
  }, [filters.category, filters.location]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchTerm });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await marketplaceAPI.getListings({
        category: filters.category,
        location: filters.location,
        search: filters.search,
      });
      setListings(response.data.listings || response.data || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      // Show empty state on error (API not running)
      setListings([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter listings client-side for search
  const filteredListings = useMemo(() => {
    if (!filters.search) return listings;
    const term = filters.search.toLowerCase();
    return listings.filter(
      (l) => 
        l.title?.toLowerCase().includes(term) ||
        l.description?.toLowerCase().includes(term)
    );
  }, [listings, filters.search]);
  
  const getCategoryLabel = (value) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="marketplace-page">
        <div className="marketplace-header">
          <div>
            <h1>🛍️ Marketplace</h1>
            <p className="marketplace-subtitle">Trova tutto per il tuo amico a 4 zampe</p>
          </div>
        </div>
        <div className="listings-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="listing-skeleton">
              <div className="skeleton skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line price" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="marketplace-page">
      {/* Header */}
      <div className="marketplace-header">
        <div>
          <h1>🛍️ Marketplace</h1>
          <p className="marketplace-subtitle">Trova tutto per il tuo amico a 4 zampe</p>
        </div>
        <Button 
          as={Link} 
          to="/app/marketplace/new"
          icon={<PlusIcon />}
        >
          Vendi qualcosa
        </Button>
      </div>
      
      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <MagnifyingGlassIcon />
          <input
            type="text"
            placeholder="Cerca prodotti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select"
          value={filters.category || ''}
          onChange={(e) => setFilters({ category: e.target.value || null })}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        
        <select 
          className="filter-select"
          value={filters.location || ''}
          onChange={(e) => setFilters({ location: e.target.value || null })}
        >
          {LOCATIONS.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <motion.div 
          className="marketplace-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="empty-icon">🔍</span>
          <h2>Nessun annuncio trovato</h2>
          <p>Prova a modificare i filtri o crea il primo annuncio!</p>
          <Button 
            as={Link} 
            to="/app/marketplace/new"
            icon={<PlusIcon />}
            size="lg"
          >
            Pubblica il tuo primo annuncio
          </Button>
        </motion.div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ListingCard listing={listing} getCategoryLabel={getCategoryLabel} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceList;
