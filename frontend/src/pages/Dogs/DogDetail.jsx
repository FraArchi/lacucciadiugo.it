import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  HeartIcon,
  CalendarIcon,
  IdentificationIcon,
  ArrowLeftIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useDogsStore } from '@/store';
import { dogsAPI } from '@/services/api';
import { Card, Button, Avatar, Modal } from '@/components/common';
import toast from 'react-hot-toast';
import './Dogs.css';

const DogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedDog, selectDog, removeDog, setLoading, isLoading } = useDogsStore();
  const [healthRecords, setHealthRecords] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  useEffect(() => {
    fetchDog();
    fetchHealthRecords();
  }, [id]);
  
  const fetchDog = async () => {
    setLoading(true);
    try {
      const response = await dogsAPI.getOne(id);
      selectDog(response.data.dog || response.data);
    } catch (err) {
      toast.error('Cane non trovato');
      navigate('/app/dogs');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHealthRecords = async () => {
    try {
      const response = await dogsAPI.getHealthRecords(id);
      setHealthRecords(response.data.records || response.data || []);
    } catch (err) {
      console.error('Error fetching health records:', err);
    }
  };
  
  const handleDelete = async () => {
    try {
      await dogsAPI.delete(id);
      removeDog(id);
      toast.success('Cane eliminato');
      navigate('/app/dogs');
    } catch (err) {
      toast.error('Errore durante l\'eliminazione');
    }
  };
  
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'Età sconosciuta';
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    if (years < 1) {
      const monthsAge = (today.getFullYear() - birth.getFullYear()) * 12 + months;
      return `${monthsAge} mesi`;
    }
    return `${years} ${years === 1 ? 'anno' : 'anni'}`;
  };
  
  if (isLoading || !selectedDog) {
    return (
      <div className="dog-detail-page">
        <div className="detail-skeleton">
          <div className="skeleton skeleton-header" />
          <div className="skeleton skeleton-body" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="dog-detail-page">
      {/* Back Button */}
      <Link to="/app/dogs" className="back-link">
        <ArrowLeftIcon />
        <span>Torna ai miei cani</span>
      </Link>
      
      {/* Header */}
      <motion.div
        className="detail-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-left">
          <Avatar
            src={selectedDog.photoUrl}
            name={selectedDog.name}
            size="xl"
            className="dog-avatar"
          />
          <div className="dog-info">
            <h1>{selectedDog.name}</h1>
            <p className="dog-breed">{selectedDog.breed || 'Razza mista'}</p>
            <div className="dog-meta">
              <span>
                <CalendarIcon />
                {calculateAge(selectedDog.birthDate)}
              </span>
              {selectedDog.microchipId && (
                <span>
                  <IdentificationIcon />
                  Chip: {selectedDog.microchipId}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <Button
            as={Link}
            to={`/app/dogs/${id}/edit`}
            variant="secondary"
            icon={<PencilIcon />}
          >
            Modifica
          </Button>
          <Button
            variant="danger"
            icon={<TrashIcon />}
            onClick={() => setDeleteModalOpen(true)}
          >
            Elimina
          </Button>
        </div>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <Card className="stat-card">
          <HeartIcon className="stat-icon" style={{ color: '#EF4444' }} />
          <div className="stat-content">
            <span className="stat-value">Ottima</span>
            <span className="stat-label">Salute</span>
          </div>
        </Card>
        
        <Card className="stat-card">
          <CalendarIcon className="stat-icon" style={{ color: '#3B82F6' }} />
          <div className="stat-content">
            <span className="stat-value">{healthRecords.length}</span>
            <span className="stat-label">Visite</span>
          </div>
        </Card>
      </div>
      
      {/* Health Timeline */}
      <section className="health-section">
        <div className="section-header">
          <h2>
            <HeartIcon />
            Storico Salute
          </h2>
          <Button variant="ghost" size="sm" icon={<PlusIcon />}>
            Aggiungi
          </Button>
        </div>
        
        {healthRecords.length > 0 ? (
          <div className="health-timeline">
            {healthRecords.map((record, index) => (
              <div key={record.id} className="timeline-item">
                <div className="timeline-marker" />
                <Card className="timeline-card" padding="md">
                  <div className="record-header">
                    <span className="record-type">{record.recordType}</span>
                    <span className="record-date">
                      {new Date(record.date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="record-notes">{record.notes}</p>
                  )}
                  {record.vetName && (
                    <span className="record-vet">Dr. {record.vetName}</span>
                  )}
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="empty-health">
            <p>Nessun record di salute ancora</p>
            <Button variant="outline" size="sm" icon={<PlusIcon />}>
              Aggiungi primo record
            </Button>
          </Card>
        )}
      </section>
      
      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Conferma eliminazione"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
              Annulla
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Elimina
            </Button>
          </>
        }
      >
        <p>
          Sei sicuro di voler eliminare <strong>{selectedDog.name}</strong>?
          Questa azione non può essere annullata.
        </p>
      </Modal>
    </div>
  );
};

export default DogDetail;
