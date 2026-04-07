import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CloudArrowUpIcon,
  ClockIcon,
  ChartBarIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import { useVideoStore, useDogsStore } from '@/store';
import { videoAPI, dogsAPI } from '@/services/api';
import { Button } from '@/components/common';
import VideoUpload from './VideoUpload';
import AnalysisHistory from './AnalysisHistory';
import toast from 'react-hot-toast';
import './AITrainer.css';

const ANALYSIS_TYPES = [
  { value: 'BEHAVIOR', label: 'Comportamento', icon: '🧠' },
  { value: 'TRAINING', label: 'Addestramento', icon: '🎓' },
  { value: 'EXERCISE', label: 'Esercizio', icon: '🏃' },
  { value: 'HEALTH_CHECK', label: 'Check Salute', icon: '❤️' },
  { value: 'GENERAL', label: 'Generale', icon: '🔍' },
];

const AITrainerDashboard = () => {
  const { 
    analyses, 
    setAnalyses, 
    isLoading, 
    setLoading
  } = useVideoStore();
  
  const { dogs, setDogs } = useDogsStore();
  
  const [selectedDog, setSelectedDog] = useState(null);
  const [selectedType, setSelectedType] = useState('BEHAVIOR');
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    completedToday: 0,
    avgConfidence: 0
  });
  
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch dogs
      const dogsResponse = await dogsAPI.getAll();
      const dogsData = dogsResponse.data.dogs || dogsResponse.data || [];
      setDogs(dogsData);
      if (dogsData.length > 0) {
        setSelectedDog(dogsData[0]);
      }
      
      // Fetch analyses history
      const analysesResponse = await videoAPI.getAll({ limit: 10 });
      const analysesData = analysesResponse.data.analyses || analysesResponse.data || [];
      setAnalyses(analysesData);
      
      // Calculate stats
      const completed = analysesData.filter(a => a.status === 'COMPLETED');
      const today = completed.filter(a => {
        const date = new Date(a.createdAt);
        const now = new Date();
        return date.toDateString() === now.toDateString();
      });
      
      setStats({
        totalAnalyses: analysesData.length,
        completedToday: today.length,
        avgConfidence: completed.length > 0 
          ? Math.round(completed.reduce((sum, a) => sum + (a.confidence || 0) * 100, 0) / completed.length)
          : 0
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setDogs([]);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadComplete = (analysis) => {
    setAnalyses(prev => [analysis, ...prev]);
    toast.success('Video caricato! Analisi in corso...');
  };
  
  return (
    <div className="ai-trainer-page">
      {/* Header */}
      <div className="ai-header">
        <div>
          <h1>
            🎬 AI Video Trainer
            <span className="beta-badge">Beta</span>
          </h1>
          <p className="ai-subtitle">
            Analizza i video del tuo cane con l'intelligenza artificiale
          </p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="ai-stats">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-icon purple">
            <FilmIcon />
          </div>
          <div className="stat-content">
            <h3>{stats.totalAnalyses}</h3>
            <p>Analisi totali</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon teal">
            <ClockIcon />
          </div>
          <div className="stat-content">
            <h3>{stats.completedToday}</h3>
            <p>Completate oggi</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon orange">
            <ChartBarIcon />
          </div>
          <div className="stat-content">
            <h3>{stats.avgConfidence}%</h3>
            <p>Confidenza media</p>
          </div>
        </motion.div>
      </div>
      
      {/* Main Grid */}
      <div className="ai-main-grid">
        {/* Upload Section */}
        <motion.div 
          className="upload-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2>
            <CloudArrowUpIcon />
            Carica Video
          </h2>
          
          {/* Dog Selector */}
          {dogs.length > 0 && (
            <>
              <p style={{ marginBottom: 'var(--space-3)', color: 'var(--gray-600)' }}>
                Seleziona il cane da analizzare:
              </p>
              <div className="dog-selector">
                {dogs.map((dog) => (
                  <div
                    key={dog.id}
                    className={`dog-option ${selectedDog?.id === dog.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDog(dog)}
                  >
                    <img 
                      className="avatar"
                      src={dog.photoUrl || `https://via.placeholder.com/48?text=${dog.name[0]}`}
                      alt={dog.name}
                    />
                    <span className="name">{dog.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {dogs.length === 0 && !isLoading && (
            <div className="ai-empty" style={{ marginBottom: 'var(--space-6)' }}>
              <span className="empty-icon">🐕</span>
              <h3>Nessun cane registrato</h3>
              <p>Aggiungi prima un cane per iniziare l'analisi</p>
              <Button as={Link} to="/app/dogs/new" style={{ marginTop: 'var(--space-4)' }}>
                Aggiungi cane
              </Button>
            </div>
          )}
          
          {/* Video Upload */}
          {selectedDog && (
            <VideoUpload 
              dogId={selectedDog.id}
              analysisType={selectedType}
              onUploadComplete={handleUploadComplete}
            />
          )}
          
          {/* Analysis Type Selector */}
          {selectedDog && (
            <>
              <p style={{ margin: 'var(--space-6) 0 var(--space-3)', color: 'var(--gray-600)' }}>
                Tipo di analisi:
              </p>
              <div className="analysis-types">
                {ANALYSIS_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`analysis-type ${selectedType === type.value ? 'selected' : ''}`}
                    onClick={() => setSelectedType(type.value)}
                  >
                    <span className="icon">{type.icon}</span>
                    <span className="label">{type.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
        
        {/* History Section */}
        <motion.div 
          className="history-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>
            <ClockIcon />
            Analisi Recenti
          </h2>
          
          <AnalysisHistory analyses={analyses} isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  );
};

export default AITrainerDashboard;
