import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  SparklesIcon, 
  SunIcon, 
  CakeIcon,
  ArrowRightIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            <img src="/images/logo-ugo1.png" alt="Ugo" className="logo-img" />
            <span className="logo-text">Ugo</span>
          </Link>
          
          <div className="nav-links">
            <a href="#about" className="nav-link">Chi è Ugo</a>
            <a href="#gallery" className="nav-link">Galleria</a>
            <a href="#wisdom" className="nav-link">Saggezze</a>
            <Link to="/login" className="nav-link nav-cta">
              Accedi 🐾
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="hero-gradient" />
        </div>
        
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-badge">
            <span className="badge-icon">🐾</span>
            <span className="badge-text">Benvenuto nel mio mondo</span>
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">Il Meraviglioso</span>
            <span className="title-line highlight">Mondo di Ugo</span>
          </h1>
          
          <p className="hero-subtitle">
            Ciao, sono Ugo! Un cane con un cuore grande come il sole, 
            una coda che non smette mai di scodinzolare e tanti pensieri 
            profondi da condividere con te.
          </p>
          
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              <span>Unisciti a noi</span>
              <ArrowRightIcon className="btn-icon-r" />
            </Link>
            <a href="#gallery" className="btn btn-secondary btn-lg">
              <span>Guarda le foto</span>
              <PhotoIcon className="btn-icon-r" />
            </a>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">365</span>
              <span className="stat-label">Giorni di Felicità</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1000+</span>
              <span className="stat-label">Biscotti Mangiati</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">∞</span>
              <span className="stat-label">Coccole Ricevute</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="image-wrapper">
            <img src="/images/Ugo.jpeg" alt="Ugo, il cane più buono del mondo" />
            <div className="image-glow" />
          </div>
          <div className="floating-elements">
            <span className="float-emoji float-1">🦴</span>
            <span className="float-emoji float-2">❤️</span>
            <span className="float-emoji float-3">🐾</span>
            <span className="float-emoji float-4">⭐</span>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Chi Sono</span>
            <h2 className="section-title">Ciao, sono Ugo! 🐕</h2>
            <p className="section-subtitle">Un cane speciale con un cuore d'oro</p>
          </div>
          
          <div className="about-grid">
            <motion.div 
              className="about-card glass-card"
              whileHover={{ y: -8 }}
            >
              <div className="card-icon">
                <HeartIcon />
              </div>
              <h3>Dolcezza Infinita</h3>
              <p>Non mordo, non distruggo, non scavo. Abbaia solo per salutare e per dire "ti voglio bene"!</p>
            </motion.div>
            
            <motion.div 
              className="about-card glass-card"
              whileHover={{ y: -8 }}
            >
              <div className="card-icon">
                <SparklesIcon />
              </div>
              <h3>Filosofo del Divano</h3>
              <p>Medito fissando il vuoto, ignoro il caos, ma mai un biscotto. La saggezza arriva dalla pazienza.</p>
            </motion.div>
            
            <motion.div 
              className="about-card glass-card"
              whileHover={{ y: -8 }}
            >
              <div className="card-icon">
                <SunIcon />
              </div>
              <h3>Amante del Sole</h3>
              <p>Mi piacciono le giornate calde, le carezze lunghe e i pisolini nel raggio di sole sul pavimento.</p>
            </motion.div>
            
            <motion.div 
              className="about-card glass-card"
              whileHover={{ y: -8 }}
            >
              <div className="card-icon">
                <CakeIcon />
              </div>
              <h3>Gourmet Selettivo</h3>
              <p>Ogni crocchetta merita rispetto. Ogni biscotto è un momento sacro. La pazienza premia sempre.</p>
            </motion.div>
          </div>
          
          <div className="about-featured">
            <div className="featured-image">
              <img src="/images/ugo-francesco.jpeg" alt="Francesco e Ugo insieme" />
            </div>
            <div className="featured-content">
              <span className="featured-badge">La nostra storia</span>
              <h3>Francesco & Ugo</h3>
              <p>
                Una storia di amicizia che va oltre le parole. Io sono Francesco, 
                e Ugo è il mio compagno di avventure. Insieme esploriamo il mondo, 
                condividiamo momenti di gioia e creiamo ricordi indimenticabili.
              </p>
              <p>
                Questo sito è nato per celebrare l'amore incondizionato che un cane 
                sa dare e per ricordare che ogni giorno è un'opportunità per essere 
                felici, proprio come Ugo ci insegna.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery" id="gallery">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Galleria</span>
            <h2 className="section-title">I Mille Volti di Ugo 📸</h2>
            <p className="section-subtitle">Momenti catturati, ricordi indelebili</p>
          </div>
          
          <div className="gallery-grid">
            {[
              { src: '/images/Ugo.jpeg', title: 'Il Poeta', category: 'portrait' },
              { src: '/images/ugo-occhi.jpeg', title: 'Occhi Parlanti', category: 'cute', large: true },
              { src: '/images/ugo-curioso.jpeg', title: 'Il Curioso', category: 'action' },
              { src: '/images/ugo-buffo.jpeg', title: 'Il Buffone', category: 'portrait' },
              { src: '/images/ugo-piccolo.jpeg', title: 'Baby Ugo', category: 'cute', large: true },
              { src: '/images/ugo-inpiedi.jpeg', title: "L'Esploratore", category: 'action' },
            ].map((img, i) => (
              <motion.div 
                key={i}
                className={`gallery-item ${img.large ? 'large' : ''}`}
                whileHover={{ scale: 1.02 }}
              >
                <img src={img.src} alt={img.title} loading="lazy" />
                <div className="gallery-overlay">
                  <span className="gallery-title">{img.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wisdom Section */}
      <section className="wisdom" id="wisdom">
        <div className="container">
          <div className="section-header light">
            <span className="section-badge">Saggezze Quotidiane</span>
            <h2 className="section-title">I Pensieri di Ugo 💭</h2>
            <p className="section-subtitle">Riflessioni dal divano più saggio del mondo</p>
          </div>
          
          <div className="wisdom-cards">
            {[
              {
                quote: "La pazienza è la virtù dei cani. Aspetto il mio umano davanti alla porta, e so che tornerà. Sempre.",
                author: "Ugo, filosofo quadrupede"
              },
              {
                quote: "Ogni biscotto ha il suo momento. Non bisogna affrettare la felicità, va assaporata un morso alla volta.",
                author: "Ugo, esperto di biscotti"
              },
              {
                quote: "Non serve abbaiare per farsi sentire. Basta uno sguardo carico d'amore e il cuore di un umano si scioglie.",
                author: "Ugo, esperto di comunicazione"
              }
            ].map((w, i) => (
              <motion.div 
                key={i}
                className="wisdom-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="wisdom-quote">
                  <span className="quote-icon">❝</span>
                  <p>{w.quote}</p>
                  <span className="wisdom-author">— {w.author}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Entra a far parte della famiglia! 🐕</h2>
              <p>
                Unisciti a DogLife: gestisci la salute del tuo cane, 
                scopri il marketplace locale e connettiti con altri dog lovers!
              </p>
              <div className="cta-features">
                <span>🐾 Profili cani illimitati</span>
                <span>🛍️ Marketplace locale</span>
                <span>🎬 AI Video Trainer</span>
                <span>👥 Community Roma</span>
              </div>
              <Link to="/register" className="btn btn-primary btn-lg">
                <span>Inizia Gratis</span>
                <ArrowRightIcon className="btn-icon-r" />
              </Link>
            </div>
            <div className="cta-image">
              <img src="/images/impronta stupenda.jpg" alt="DogLife" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src="/images/logo-ugo1.png" alt="Ugo" />
              <span>Il Mondo di Ugo</span>
            </div>
            <p>© 2026 DogLife. Creato con ❤️ da Francesco Archidiacono.</p>
            <p className="footer-tagline">
              Perché ogni cane merita una cuccia, un nome e un umano che lo ama. 🐕
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
