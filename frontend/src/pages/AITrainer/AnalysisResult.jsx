import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  SparklesIcon,
  LightBulbIcon,
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { videoAPI } from '@/services/api';
import { useVideoStore } from '@/store';
import { Button, Card } from '@/components/common';
import toast from 'react-hot-toast';
import './AITrainer.css';

const AnalysisResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedAnalysis, selectAnalysis, isLoading } = useVideoStore();
  
  const fetchAnalysis = useCallback(async () => {
    try {
      const response = await videoAPI.getAnalysis(id);
      selectAnalysis(response.data);
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
      toast.error('Analisi non trovata');
      navigate('/app/ai');
    }
  }, [id, selectAnalysis, navigate]);
  
  useEffect(() => {
    fetchAnalysis();
    
    // Poll for updates if still processing
    let interval;
    if (selectedAnalysis?.status === 'PROCESSING' || selectedAnalysis?.status === 'PENDING') {
      interval = setInterval(fetchAnalysis, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchAnalysis, selectedAnalysis?.status]);
  
  if (isLoading || !selectedAnalysis) {
    return (
      <div className="analysis-result-page">
        <div className="skeleton" style={{ height: 60, marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }} />
        <div className="result-grid">
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }
  
  const analysis = selectedAnalysis;
  const results = analysis.results || {};
  const recommendations = analysis.recommendations || [];
  
  return (
    <div className="analysis-result-page">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <ArrowLeftIcon style={{ width: 20, height: 20, marginRight: 8 }} />
        Torna alla dashboard
      </Button>
      
      <motion.div 
        className="result-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Video Player */}
        <div>
          <div className="video-player">
            <video 
              controls
              poster={analysis.thumbnailUrl}
              style={{ width: '100%' }}
            >
              <source src={analysis.videoUrl} type="video/mp4" />
              Il tuo browser non supporta i video.
            </video>
          </div>
          
          {/* Detected Behaviors */}
          {results.behaviors && results.behaviors.length > 0 && (
            <Card className="result-card" style={{ marginTop: 'var(--space-6)' }}>
              <h3>
                <SparklesIcon />
                Comportamenti Rilevati
              </h3>
              <div className="behavior-tags">
                {results.behaviors.map((behavior, i) => (
                  <span 
                    key={i}
                    className={`behavior-tag ${behavior.type || ''}`}
                  >
                    {behavior.label || behavior}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="result-sidebar">
          {/* Status Card */}
          <Card className="result-card">
            <h3>
              <ChartBarIcon />
              Risultati Analisi
            </h3>
            
            {analysis.status === 'PROCESSING' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div className="animate-pulse" style={{ fontSize: '3rem' }}>🔄</div>
                <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-4)' }}>
                  Analisi in corso...
                </p>
              </div>
            )}
            
            {analysis.status === 'PENDING' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: '3rem' }}>⏳</div>
                <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-4)' }}>
                  In attesa di elaborazione
                </p>
              </div>
            )}
            
            {analysis.status === 'COMPLETED' && (
              <>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--gray-500)' }}>Confidenza</span>
                    <span style={{ fontWeight: 600 }}>
                      {Math.round((analysis.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div className="confidence-bar" style={{ height: 8 }}>
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${(analysis.confidence || 0) * 100}%` }}
                    />
                  </div>
                </div>
                
                {results.poses && (
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                      Pose rilevate:
                    </span>
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>
                      {results.poses.length}
                    </span>
                  </div>
                )}
                
                {results.duration && (
                  <div>
                    <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                      Durata analizzata:
                    </span>
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>
                      {Math.floor(results.duration / 60)}:{(results.duration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </>
            )}
            
            {analysis.status === 'FAILED' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: '3rem' }}>❌</div>
                <p style={{ color: 'var(--error)', marginTop: 'var(--space-4)' }}>
                  Analisi fallita
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchAnalysis}
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  Riprova
                </Button>
              </div>
            )}
          </Card>
          
          {/* Recommendations */}
          {analysis.status === 'COMPLETED' && recommendations.length > 0 && (
            <Card className="result-card">
              <h3>
                <LightBulbIcon />
                Consigli AI
              </h3>
              <div className="recommendation-list">
                {recommendations.map((rec, i) => (
                  <div key={i} className="recommendation-item">
                    <div className="icon">
                      <span>{rec.icon || '💡'}</span>
                    </div>
                    <p>{rec.text || rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Tutorial Link (Premium) */}
          {analysis.tutorialUrl && (
            <Card className="result-card" style={{ background: 'var(--gradient-warm)', color: 'white' }}>
              <h3 style={{ color: 'white' }}>
                <PlayIcon />
                Tutorial Personalizzato
              </h3>
              <p style={{ marginBottom: 'var(--space-4)', opacity: 0.9 }}>
                Abbiamo creato un video tutorial basato sull'analisi!
              </p>
              <Button 
                variant="outline"
                as="a"
                href={analysis.tutorialUrl}
                target="_blank"
                style={{ 
                  background: 'white', 
                  color: 'var(--primary)',
                  border: 'none'
                }}
              >
                Guarda Tutorial
              </Button>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalysisResult;
