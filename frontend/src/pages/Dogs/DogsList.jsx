import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusIcon, HeartIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { useDogsStore } from '@/store';
import { dogsAPI } from '@/services/api';
import { Card, Button, Avatar } from '@/components/common';
import toast from 'react-hot-toast';
import './Dogs.css';

const DogsList = () => {
  const { dogs, setDogs, setLoading, isLoading } = useDogsStore();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchDogs();
  }, []);
  
  const fetchDogs = async () => {
    setLoading(true);
    try {
      const response = await dogsAPI.getAll();
      setDogs(response.data.dogs || response.data);
    } catch (err) {
      setError('Impossibile caricare i tuoi cani');
      toast.error('Errore nel caricamento dei cani');
    } finally {
      setLoading(false);
    }
  };
  
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return years;
  };
  
  if (isLoading) {
    return (
      <div className="dogs-page">
        <div className="page-header">
          <h1>I Miei Cani</h1>
        </div>
        <div className="dogs-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dog-card-skeleton">
              <div className="skeleton skeleton-avatar" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text short" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="dogs-page">
      <div className="page-header">
        <div>
          <h1>I Miei Cani 🐕</h1>
          <p className="page-subtitle">Gestisci i profili dei tuoi amici a 4 zampe</p>
        </div>
        <Button 
          as={Link} 
          to="/app/dogs/new"
          icon={<PlusIcon />}
        >
          Aggiungi Cane
        </Button>
      </div>
      
      {dogs.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="empty-card" padding="lg">
            <span className="empty-icon">🐕</span>
            <h2>Nessun cane ancora</h2>
            <p>Aggiungi il profilo del tuo primo amico a 4 zampe!</p>
            <Button 
              as={Link} 
              to="/app/dogs/new"
              icon={<PlusIcon />}
              size="lg"
            >
              Aggiungi il tuo primo cane
            </Button>
          </Card>
        </motion.div>
      ) : (
        <div className="dogs-grid">
          {dogs.map((dog, index) => (
            <motion.div
              key={dog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/app/dogs/${dog.id}`} className="dog-card-link">
                <Card className="dog-card" hover>
                  <div className="dog-card-header">
                    <Avatar 
                      src={dog.photoUrl}
                      name={dog.name}
                      size="xl"
                    />
                    <button 
                      className="dog-menu"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Show menu
                      }}
                    >
                      <EllipsisVerticalIcon />
                    </button>
                  </div>
                  
                  <div className="dog-card-body">
                    <h3 className="dog-name">{dog.name}</h3>
                    <p className="dog-breed">{dog.breed || 'Razza mista'}</p>
                    
                    {dog.birthDate && (
                      <span className="dog-age">
                        {calculateAge(dog.birthDate)} anni
                      </span>
                    )}
                  </div>
                  
                  <div className="dog-card-footer">
                    <div className="dog-stats">
                      <div className="stat">
                        <HeartIcon />
                        <span>Salute OK</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
          
          {/* Add New Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dogs.length * 0.1 }}
          >
            <Link to="/app/dogs/new" className="add-dog-card">
              <PlusIcon />
              <span>Aggiungi cane</span>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DogsList;
