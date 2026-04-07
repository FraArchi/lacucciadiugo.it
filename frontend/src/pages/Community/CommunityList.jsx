import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { useCommunityStore } from '@/store';
import { groupsAPI } from '@/services/api';
import { Button } from '@/components/common';
import GroupCard from './GroupCard';
import toast from 'react-hot-toast';
import './Community.css';

const REGIONS = [
  { value: '', label: 'Tutte' },
  { value: 'Lazio', label: '🏛️ Lazio' },
  { value: 'Roma', label: '🐺 Roma' },
  { value: 'Lombardia', label: '🏔️ Lombardia' },
  { value: 'Milano', label: '🌆 Milano' },
  { value: 'Campania', label: '🌋 Campania' },
  { value: 'Napoli', label: '🍕 Napoli' },
];

const CommunityList = () => {
  const { 
    groups, 
    setGroups, 
    myGroups,
    setMyGroups,
    isLoading, 
    setLoading 
  } = useCommunityStore();
  
  const [selectedRegion, setSelectedRegion] = useState('Lazio');
  const [featuredGroups, setFeaturedGroups] = useState([]);
  
  useEffect(() => {
    fetchGroups();
    fetchMyGroups();
  }, [selectedRegion]);
  
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await groupsAPI.getAll({ region: selectedRegion });
      setGroups(response.data.groups || response.data || []);
      
      // Get popular/featured groups
      const popularResponse = await groupsAPI.getPopular(selectedRegion);
      setFeaturedGroups(popularResponse.data.groups || popularResponse.data || []);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      // Set mock data for demo
      setGroups([]);
      setFeaturedGroups([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMyGroups = async () => {
    try {
      const response = await groupsAPI.getMyMemberships();
      setMyGroups(response.data.groups || response.data || []);
    } catch {
      setMyGroups([]);
    }
  };
  
  const handleJoinGroup = async (slug) => {
    try {
      await groupsAPI.join(slug);
      toast.success('Ti sei unito al gruppo!');
      fetchMyGroups();
    } catch (err) {
      console.error('Failed to join group:', err);
      toast.error('Errore nell\'iscrizione');
    }
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="community-page">
        <div className="community-header">
          <div>
            <h1>👥 Community</h1>
            <p className="community-subtitle">Gruppi locali per amanti dei cani</p>
          </div>
        </div>
        <div className="groups-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group-skeleton">
              <div className="skeleton skeleton-cover" />
              <div className="skeleton-content">
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="community-page">
      {/* Header */}
      <div className="community-header">
        <div>
          <h1>👥 Community</h1>
          <p className="community-subtitle">Gruppi locali per amanti dei cani in {selectedRegion || 'Italia'}</p>
        </div>
        <Button 
          as={Link} 
          to="/app/community/new"
          icon={<PlusIcon />}
        >
          Crea gruppo
        </Button>
      </div>
      
      {/* Region Filters */}
      <div className="community-filters">
        {REGIONS.map((region) => (
          <button
            key={region.value}
            className={`region-chip ${selectedRegion === region.value ? 'active' : ''}`}
            onClick={() => setSelectedRegion(region.value)}
          >
            {region.label}
          </button>
        ))}
      </div>
      
      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className="my-groups-section">
          <div className="section-header">
            <h2>I Miei Gruppi</h2>
          </div>
          <div className="my-groups-list">
            {myGroups.map((group) => (
              <Link 
                key={group.id} 
                to={`/app/community/${group.slug}`}
                className="my-group-chip"
              >
                <img 
                  className="avatar" 
                  src={group.coverImage || 'https://via.placeholder.com/36?text=🐕'}
                  alt={group.name}
                />
                <div className="info">
                  <span className="name">{group.name}</span>
                  {group.unreadCount > 0 && (
                    <span className="unread">{group.unreadCount} nuovi post</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Featured Groups */}
      {featuredGroups.length > 0 && (
        <div className="featured-section">
          <div className="section-header">
            <h2>⭐ Gruppi Popolari in {selectedRegion || 'Italia'}</h2>
            <Link to="/app/community?sort=popular">Vedi tutti</Link>
          </div>
          <div className="groups-grid">
            {featuredGroups.slice(0, 3).map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GroupCard 
                  group={group} 
                  onJoin={() => handleJoinGroup(group.slug)}
                  isMember={myGroups.some((g) => g.id === group.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* All Groups */}
      <div className="section-header">
        <h2>
          <UserGroupIcon style={{ width: 24, height: 24, marginRight: 8 }} />
          Tutti i Gruppi
        </h2>
      </div>
      
      {groups.length === 0 ? (
        <motion.div 
          className="community-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="empty-icon">🐕‍🦺</span>
          <h2>Nessun gruppo in questa zona</h2>
          <p>Sii il primo a creare una community per gli amanti dei cani!</p>
          <Button 
            as={Link} 
            to="/app/community/new"
            icon={<PlusIcon />}
            size="lg"
          >
            Crea il primo gruppo
          </Button>
        </motion.div>
      ) : (
        <div className="groups-grid">
          {groups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GroupCard 
                group={group}
                onJoin={() => handleJoinGroup(group.slug)}
                isMember={myGroups.some((g) => g.id === group.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityList;
