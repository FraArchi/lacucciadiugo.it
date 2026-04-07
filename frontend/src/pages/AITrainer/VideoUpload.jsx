import { useState, useCallback } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useVideoStore } from '@/store';
import { videoAPI } from '@/services/api';
import { Button } from '@/components/common';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

const VideoUpload = ({ dogId, analysisType, onUploadComplete }) => {
  const { setUploadProgress, setUploading, uploadProgress, isUploading } = useVideoStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const validateFile = (file) => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      toast.error('Formato non supportato. Usa MP4, WebM, MOV o AVI');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File troppo grande. Max 100MB');
      return false;
    }
    
    return true;
  };
  
  const handleFileSelect = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    
    if (!validateFile(file)) return;
    
    setSelectedFile(file);
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !dogId) return;
    
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('dogId', dogId);
    formData.append('analysisType', analysisType);
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for demo (actual would use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await videoAPI.upload(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setSelectedFile(null);
        onUploadComplete?.(response.data);
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Caricamento fallito. Riprova.');
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div>
      <div
        className={`video-upload-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('video-input').click()}
      >
        <div className="upload-icon">
          <CloudArrowUpIcon />
        </div>
        
        {selectedFile ? (
          <>
            <h3>📹 {selectedFile.name}</h3>
            <p>{formatFileSize(selectedFile.size)}</p>
          </>
        ) : (
          <>
            <h3>Trascina il video qui</h3>
            <p>oppure clicca per selezionare un file</p>
          </>
        )}
        
        <div className="upload-formats">
          <span className="format-badge">MP4</span>
          <span className="format-badge">WebM</span>
          <span className="format-badge">MOV</span>
          <span className="format-badge">AVI</span>
        </div>
        
        <input
          id="video-input"
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="progress-text">
            <span>Caricamento in corso...</span>
            <span>{uploadProgress}%</span>
          </div>
        </div>
      )}
      
      {/* Upload Button */}
      {selectedFile && !isUploading && (
        <Button 
          fullWidth 
          onClick={handleUpload}
          style={{ marginTop: 'var(--space-4)' }}
        >
          🚀 Avvia Analisi AI
        </Button>
      )}
    </div>
  );
};

export default VideoUpload;
