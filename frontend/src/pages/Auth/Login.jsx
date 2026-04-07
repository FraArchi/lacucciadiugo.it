import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store';
import { authAPI } from '@/services/api';
import { Button, Input } from '@/components/common';
import toast from 'react-hot-toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, setLoading, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }
    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      login(response.data.user, response.data.token);
      toast.success('Benvenuto! 🐾');
      navigate('/app');
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il login';
      toast.error(message);
      if (error.response?.status === 401) {
        setErrors({ password: 'Credenziali non valide' });
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
            <h1>Bentornato! 🐕</h1>
            <p>Accedi al tuo account DogLife</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
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
            
            <div className="auth-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Ricordami</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Password dimenticata?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Accedi
            </Button>
          </form>
          
          <div className="auth-footer">
            <p>
              Non hai un account?{' '}
              <Link to="/register">Registrati gratis</Link>
            </p>
          </div>
        </motion.div>
        
        <div className="auth-side">
          <div className="side-content">
            <span className="side-emoji">🐾</span>
            <h2>Benvenuto nella famiglia DogLife</h2>
            <p>
              Gestisci la salute dei tuoi cani, scopri il marketplace locale 
              e connettiti con altri dog lovers!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
