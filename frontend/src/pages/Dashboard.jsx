import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  VideoCameraIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useDogsStore } from '@/store';
import { Card, Button } from '@/components/common';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { dogs } = useDogsStore();
  
  const quickActions = [
    { 
      title: 'I Miei Cani', 
      description: 'Gestisci i profili dei tuoi cani',
      icon: HeartIcon, 
      path: '/app/dogs',
      color: '#FF6B6B',
      count: dogs.length || 0
    },
    { 
      title: 'Marketplace', 
      description: 'Compra e vendi prodotti',
      icon: ShoppingBagIcon, 
      path: '/app/marketplace',
      color: '#4ECDC4',
      count: null
    },
    { 
      title: 'Community', 
      description: 'Gruppi locali e discussioni',
      icon: UserGroupIcon, 
      path: '/app/community',
      color: '#667eea',
      count: null
    },
    { 
      title: 'AI Trainer', 
      description: 'Analizza video del tuo cane',
      icon: VideoCameraIcon, 
      path: '/app/ai',
      color: '#f093fb',
      count: null
    },
  ];
  
  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <section className="welcome-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="welcome-title">
            Bentornato, {user?.firstName || user?.username || 'Amico'}! 🐾
          </h1>
          <p className="welcome-subtitle">
            Ecco cosa puoi fare oggi per i tuoi amici a 4 zampe
          </p>
        </motion.div>
      </section>
      
      {/* Quick Actions Grid */}
      <section className="quick-actions">
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={action.path} className="action-card">
                <div 
                  className="action-icon"
                  style={{ background: `${action.color}15`, color: action.color }}
                >
                  <action.icon />
                  {action.count !== null && (
                    <span className="action-badge">{action.count}</span>
                  )}
                </div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <ArrowRightIcon className="action-arrow" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* My Dogs Preview */}
      <section className="dogs-preview">
        <div className="section-header">
          <h2>I Miei Cani</h2>
          <Link to="/app/dogs" className="see-all">
            Vedi tutti <ArrowRightIcon />
          </Link>
        </div>
        
        {dogs.length > 0 ? (
          <div className="dogs-grid">
            {dogs.slice(0, 3).map((dog) => (
              <Card key={dog.id} className="dog-card">
                <div className="dog-image">
                  {dog.photoUrl ? (
                    <img src={dog.photoUrl} alt={dog.name} />
                  ) : (
                    <div className="dog-placeholder">🐕</div>
                  )}
                </div>
                <div className="dog-info">
                  <h4>{dog.name}</h4>
                  <p>{dog.breed || 'Razza mista'}</p>
                </div>
              </Card>
            ))}
            <Link to="/app/dogs/new" className="add-dog-card">
              <PlusIcon />
              <span>Aggiungi cane</span>
            </Link>
          </div>
        ) : (
          <Card className="empty-dogs">
            <div className="empty-content">
              <span className="empty-icon">🐕</span>
              <h3>Nessun cane ancora</h3>
              <p>Aggiungi il profilo del tuo primo cane per iniziare!</p>
              <Button 
                as={Link} 
                to="/app/dogs/new"
                icon={<PlusIcon />}
              >
                Aggiungi il tuo cane
              </Button>
            </div>
          </Card>
        )}
      </section>
      
      {/* Tips Section */}
      <section className="tips-section">
        <Card variant="glass" className="tip-card">
          <div className="tip-content">
            <span className="tip-emoji">💡</span>
            <div>
              <h3>Consiglio del giorno</h3>
              <p>
                Ricorda di portare il tuo cane a fare una passeggiata ogni giorno. 
                20-30 minuti sono sufficienti per mantenerlo felice e in salute!
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
