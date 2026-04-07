import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PhotoIcon, 
  XMarkIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import { marketplaceAPI } from '@/services/api';
import { useMarketplaceStore } from '@/store';
import { Button, Input } from '@/components/common';
import toast from 'react-hot-toast';
import './Marketplace.css';

const CATEGORIES = [
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

const CONDITIONS = [
  { value: 'NEW', label: 'Nuovo' },
  { value: 'LIKE_NEW', label: 'Come nuovo' },
  { value: 'GOOD', label: 'Buono' },
  { value: 'USED', label: 'Usato' },
  { value: 'FOR_PARTS', label: 'Per ricambi' },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'ACCESSORIES',
    condition: 'GOOD',
    location: '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleImageUpload = useCallback((files) => {
    const newImages = Array.from(files).slice(0, 5 - images.length);
    
    newImages.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Solo immagini sono permesse');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, { file, preview: e.target.result }]);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  }, [handleImageUpload]);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price) {
      toast.error('Compila almeno titolo e prezzo');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      
      images.forEach((img, index) => {
        data.append('images', img.file);
      });
      
      await marketplaceAPI.createListing(data);
      toast.success('Annuncio pubblicato con successo!');
      navigate('/app/marketplace');
    } catch (err) {
      console.error('Failed to create listing:', err);
      toast.error('Errore nella pubblicazione. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="create-listing-page">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <ArrowLeftIcon style={{ width: 20, height: 20, marginRight: 8 }} />
        Torna al marketplace
      </Button>
      
      <h1>📦 Pubblica un annuncio</h1>
      
      <motion.form 
        className="listing-form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Images Section */}
        <div className="form-section">
          <h3>Immagini</h3>
          <div 
            className={`image-upload-zone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('image-input').click()}
          >
            <PhotoIcon />
            <p>Trascina le immagini qui o clicca per caricarle</p>
            <span>Max 5 immagini (JPG, PNG)</span>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </div>
          
          {images.length > 0 && (
            <div className="image-previews">
              {images.map((img, index) => (
                <div key={index} className="image-preview">
                  <img src={img.preview} alt={`Preview ${index + 1}`} />
                  <button 
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                  >
                    <XMarkIcon style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Details Section */}
        <div className="form-section">
          <h3>Dettagli</h3>
          
          <div className="form-group">
            <label htmlFor="title">Titolo *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Es: Cuccia in legno per cane taglia media"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrizione</label>
            <textarea
              id="description"
              name="description"
              placeholder="Descrivi il prodotto, le sue condizioni, dimensioni..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Categoria</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="condition">Condizione</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Prezzo (€) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Località</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="Es: Roma, Lazio"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Pubblicazione...' : 'Pubblica annuncio'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default CreateListing;
