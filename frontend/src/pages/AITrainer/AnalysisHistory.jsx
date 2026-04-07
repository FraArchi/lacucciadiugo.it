import { Link } from 'react-router-dom';
import { PlayIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const STATUS_CONFIG = {
  PENDING: { label: 'In attesa', class: 'pending', icon: ClockIcon },
  PROCESSING: { label: 'In analisi', class: 'processing', icon: ClockIcon },
  COMPLETED: { label: 'Completata', class: 'completed', icon: CheckCircleIcon },
  FAILED: { label: 'Fallita', class: 'failed', icon: XCircleIcon },
};

const ANALYSIS_TYPE_LABELS = {
  BEHAVIOR: 'Comportamento',
  TRAINING: 'Addestramento',
  EXERCISE: 'Esercizio',
  HEALTH_CHECK: 'Salute',
  GENERAL: 'Generale',
};

const AnalysisHistory = ({ analyses = [], isLoading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / (1000 * 60));
    
    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <div className="history-list">
        {[1, 2, 3].map((i) => (
          <div key={i} className="analysis-card">
            <div className="skeleton" style={{ width: 120, height: 80, borderRadius: 8 }} />
            <div className="analysis-info">
              <div className="skeleton" style={{ width: '80%', height: 16, marginBottom: 8, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: '50%', height: 12, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (analyses.length === 0) {
    return (
      <div className="ai-empty">
        <span className="empty-icon">📹</span>
        <h3>Nessuna analisi</h3>
        <p>Carica il tuo primo video per iniziare!</p>
      </div>
    );
  }
  
  return (
    <div className="history-list">
      {analyses.map((analysis, index) => {
        const statusConfig = STATUS_CONFIG[analysis.status] || STATUS_CONFIG.PENDING;
        const StatusIcon = statusConfig.icon;
        
        return (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link 
              to={`/app/ai/${analysis.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="analysis-card">
                <div className="analysis-thumbnail">
                  <img 
                    src={analysis.thumbnailUrl || 'https://via.placeholder.com/120x80?text=📹'}
                    alt="Video thumbnail"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x80?text=📹';
                    }}
                  />
                  <div className="play-icon">
                    <PlayIcon />
                  </div>
                </div>
                
                <div className="analysis-info">
                  <h4>
                    {analysis.dog?.name || 'Video'} - {ANALYSIS_TYPE_LABELS[analysis.analysisType] || 'Analisi'}
                  </h4>
                  
                  <div className="analysis-meta">
                    <span>{formatDate(analysis.createdAt)}</span>
                    <span>{formatDuration(analysis.duration)}</span>
                  </div>
                  
                  <span className={`status-badge ${statusConfig.class}`}>
                    <StatusIcon style={{ width: 12, height: 12 }} />
                    {statusConfig.label}
                  </span>
                  
                  {analysis.status === 'COMPLETED' && analysis.confidence && (
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ width: `${analysis.confidence * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalysisHistory;
