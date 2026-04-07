import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store';
import { authAPI } from '@/services/api';
import { Button, Input } from '@/components/common';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome richiesto';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    
    if (!formData.username) {
      newErrors.username = 'Username richiesto';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username troppo corto (min 3 caratteri)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password troppo corta (min 6 caratteri)';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await authAPI.register(userData);
      login(response.data.user, response.data.token);
      toast.success('Benvenuto nella famiglia DogLife! 🐾');
      navigate('/app/dogs/new'); // Redirect to add first dog
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la registrazione';
      toast.error(message);
      if (error.response?.data?.field) {
        setErrors({ [error.response.data.field]: message });
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <img src="/images/logo-ugo1.png" alt="DogLife" />
            </Link>
            <h1>Unisciti a noi! 🐕</h1>
            <p>Crea il tuo account DogLife gratuito</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <Input
                name="firstName"
                type="text"
                label="Nome"
                placeholder="Mario"
                icon={<UserIcon />}
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              <Input
                name="lastName"
                type="text"
                label="Cognome"
                placeholder="Rossi"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="la.tua@email.com"
              icon={<EnvelopeIcon />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <Input
              name="username"
              type="text"
              label="Username"
              placeholder="mario_cane_lover"
              icon={<UserIcon />}
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
            />
            
            <div className="password-field">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                icon={<LockClosedIcon />}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            
            <Input
              name="confirmPassword"
              type="password"
              label="Conferma Password"
              placeholder="••••••••"
              icon={<LockClosedIcon />}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            
            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  Accetto i <a href="/terms">Termini di Servizio</a> e la{' '}
                  <a href="/privacy">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Crea account
            </Button>
          </form>
          
          <div className="auth-footer">
            <p>
              Hai già un account?{' '}
              <Link to="/login">Accedi</Link>
            </p>
          </div>
        </motion.div>
        
        <div className="auth-side register">
          <div className="side-content">
            <span className="side-emoji">🎉</span>
            <h2>Inizia la tua avventura</h2>
            <ul className="features-list">
              <li>🐾 Profili cani illimitati</li>
              <li>📊 Traccia la salute dei tuoi amici</li>
              <li>🛍️ Marketplace locale Roma/Lazio</li>
              <li>👥 Community di dog lovers</li>
              <li>🎬 AI Video Trainer (Premium)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
