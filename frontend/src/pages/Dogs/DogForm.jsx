import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useDogsStore } from '@/store';
import { dogsAPI } from '@/services/api';
import { Card, Button, Input, Select } from '@/components/common';
import toast from 'react-hot-toast';
import './Dogs.css';

const DOG_BREEDS = [
  { value: '', label: 'Seleziona razza...' },
  { value: 'mixed', label: 'Razza mista' },
  { value: 'labrador', label: 'Labrador Retriever' },
  { value: 'golden', label: 'Golden Retriever' },
  { value: 'german_shepherd', label: 'Pastore Tedesco' },
  { value: 'bulldog', label: 'Bulldog' },
  { value: 'beagle', label: 'Beagle' },
  { value: 'poodle', label: 'Barboncino' },
  { value: 'rottweiler', label: 'Rottweiler' },
  { value: 'yorkshire', label: 'Yorkshire Terrier' },
  { value: 'boxer', label: 'Boxer' },
  { value: 'dachshund', label: 'Bassotto' },
  { value: 'shiba', label: 'Shiba Inu' },
  { value: 'husky', label: 'Siberian Husky' },
  { value: 'chihuahua', label: 'Chihuahua' },
  { value: 'border_collie', label: 'Border Collie' },
  { value: 'other', label: 'Altra razza' },
];

const DogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { addDog, updateDog, setLoading, isLoading } = useDogsStore();
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    customBreed: '',
    birthDate: '',
    gender: '',
    weight: '',
    microchipId: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  
  useEffect(() => {
    if (isEditing) {
      fetchDog();
    }
  }, [id]);
  
  const fetchDog = async () => {
    try {
      const response = await dogsAPI.getOne(id);
      const dog = response.data.dog || response.data;
      setFormData({
        name: dog.name || '',
        breed: dog.breed || '',
        customBreed: '',
        birthDate: dog.birthDate ? dog.birthDate.split('T')[0] : '',
        gender: dog.gender || '',
        weight: dog.weight || '',
        microchipId: dog.microchipId || '',
        notes: dog.notes || '',
      });
      if (dog.photoUrl) {
        setPhotoPreview(dog.photoUrl);
      }
    } catch (err) {
      toast.error('Errore nel caricamento');
      navigate('/app/dogs');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Nome richiesto';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const dogData = {
        ...formData,
        breed: formData.breed === 'other' ? formData.customBreed : formData.breed,
        weight: formData.weight ? parseFloat(formData.weight) : null,
      };
      delete dogData.customBreed;
      
      if (isEditing) {
        const response = await dogsAPI.update(id, dogData);
        updateDog(id, response.data.dog || response.data);
        toast.success('Cane aggiornato! 🐾');
      } else {
        const response = await dogsAPI.create(dogData);
        addDog(response.data.dog || response.data);
        toast.success('Cane aggiunto! 🐾');
      }
      navigate('/app/dogs');
    } catch (err) {
      const message = err.response?.data?.message || 'Errore durante il salvataggio';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="dog-form-page">
      <Link to="/app/dogs" className="back-link">
        <ArrowLeftIcon />
        <span>Torna ai miei cani</span>
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{isEditing ? 'Modifica Cane' : 'Aggiungi Nuovo Cane'} 🐕</h1>
        <p className="page-subtitle">
          {isEditing 
            ? 'Aggiorna le informazioni del tuo amico a 4 zampe'
            : 'Inserisci le informazioni del tuo nuovo amico'
          }
        </p>
      </motion.div>
      
      <Card className="form-card" padding="lg">
        <form onSubmit={handleSubmit} className="dog-form">
          {/* Photo Upload */}
          <div className="photo-upload-section">
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />
            <label htmlFor="photo" className="photo-label">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              ) : (
                <>
                  <PhotoIcon />
                  <span>Carica foto</span>
                </>
              )}
            </label>
          </div>
          
          {/* Basic Info */}
          <div className="form-section">
            <h3>Informazioni Base</h3>
            <div className="form-grid">
              <Input
                name="name"
                label="Nome del cane"
                placeholder="Es: Ugo"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
              
              <Select
                name="breed"
                label="Razza"
                options={DOG_BREEDS}
                value={formData.breed}
                onChange={handleChange}
              />
              
              {formData.breed === 'other' && (
                <Input
                  name="customBreed"
                  label="Specifica la razza"
                  placeholder="Es: Bracco Italiano"
                  value={formData.customBreed}
                  onChange={handleChange}
                />
              )}
              
              <Input
                name="birthDate"
                type="date"
                label="Data di nascita"
                value={formData.birthDate}
                onChange={handleChange}
              />
              
              <Select
                name="gender"
                label="Sesso"
                options={[
                  { value: '', label: 'Seleziona...' },
                  { value: 'male', label: 'Maschio' },
                  { value: 'female', label: 'Femmina' },
                ]}
                value={formData.gender}
                onChange={handleChange}
              />
              
              <Input
                name="weight"
                type="number"
                label="Peso (kg)"
                placeholder="Es: 12.5"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="form-section">
            <h3>Informazioni Aggiuntive</h3>
            <div className="form-grid">
              <Input
                name="microchipId"
                label="Numero Microchip"
                placeholder="Es: 380123456789012"
                value={formData.microchipId}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-full">
              <label className="input-label">Note</label>
              <textarea
                name="notes"
                placeholder="Aggiungi note sul tuo cane (allergie, carattere, etc.)"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="input-field textarea"
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/app/dogs')}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              {isEditing ? 'Salva modifiche' : 'Aggiungi cane'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DogForm;
