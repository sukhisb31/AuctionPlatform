import  { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { X, ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';

const SuryaVilasPage = () => {
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [email, setEmail] = useState('');
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const closeModal = () => {
    setShowEmailModal(false);
  };

  return (
    <div className="surya-vilas">
      {/* Top Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark text-white py-2 position-relative"
      >
        <div className="container d-flex justify-content-center align-items-center flex-wrap">
          <span>Use Promo Code: <strong>SURPRISE</strong> to avail a surprise discount</span>
          <a href="#" className="text-white ms-3 text-decoration-none">
            BOOK NOW! <span className="ms-1">↗</span>
          </a>
          <button className="btn-close btn-close-white position-absolute end-0 me-3" aria-label="Close"></button>
        </div>
      </motion.div>

      {/* Navbar */}
      <motion.nav 
        className={`navbar navbar-expand-lg navbar-dark ${scrolled ? 'fixed-top shadow-sm' : ''}`}
        style={{ backgroundColor: '#0a1248', transition: 'all 0.3s ease' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="container">
          <a className="navbar-brand" href="#">
            <motion.img 
              src="/api/placeholder/150/50" 
              alt="SURYAVILAS" 
              className="img-fluid"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </a>
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setNavbarCollapsed(!navbarCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${navbarCollapsed ? '' : 'show'}`}>
            <ul className="navbar-nav mx-auto">
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link" href="#">Upcoming Hotels</a>
              </motion.li>
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link" href="#">About Us</a>
              </motion.li>
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link active" href="#">Accommodations</a>
              </motion.li>
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link" href="#">Dining</a>
              </motion.li>
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link" href="#">Wellness & Spa</a>
              </motion.li>
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link" href="#">Offers</a>
              </motion.li>
              <motion.li className="nav-item" whileHover={{ scale: 1.05 }}>
                <a className="nav-link" href="#">Blogs</a>
              </motion.li>
            </ul>
            <motion.button 
              className="btn px-4"
              style={{ backgroundColor: '#d6a84d', color: 'white' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              BOOK NOW
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div 
        className="position-relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <img 
          src="/api/placeholder/1920/800" 
          alt="Luxury Room" 
          className="img-fluid w-100" 
          style={{ maxHeight: '80vh', objectFit: 'cover' }}
        />
        
        {/* Experience Title */}
        <motion.div 
          className="w-100 text-center py-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <h2 className="display-5 fw-bold my-5">The Suryavilas Experience</h2>
        </motion.div>
      </motion.div>

      {/* Social Media Sidebar */}
      <div className="social-sidebar position-fixed start-0 top-50 translate-middle-y d-none d-md-block" style={{ zIndex: 1000 }}>
        <motion.div 
          className="d-flex flex-column gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <motion.a 
            href="#" 
            className="btn btn-success p-2 rounded-circle"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <img src="/api/placeholder/24/24" alt="TripAdvisor" className="img-fluid" />
          </motion.a>
          <motion.a 
            href="#" 
            className="btn btn-primary p-2 rounded-circle"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <img src="/api/placeholder/24/24" alt="Facebook" className="img-fluid" />
          </motion.a>
          <motion.a 
            href="#" 
            className="btn btn-danger p-2 rounded-circle"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <img src="/api/placeholder/24/24" alt="Instagram" className="img-fluid" />
          </motion.a>
        </motion.div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div 
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-dark text-white p-4 rounded shadow"
              style={{ maxWidth: '400px', width: '90%' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="m-0">Get these prices emailed to you!</h4>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="mb-3">
                <input 
                  type="email" 
                  className="form-control form-control-lg" 
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <motion.button 
                className="btn w-100 mb-2"
                style={{ backgroundColor: '#d6a84d', color: 'white' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Send me the prices
              </motion.button>
              <p className="text-center mb-0 text-secondary small">No spam ever, promise!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      <motion.a 
        href="#" 
        className="position-fixed bottom-0 end-0 m-4 btn btn-success p-3 rounded-circle shadow-lg"
        style={{ zIndex: 1000 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <img src="/api/placeholder/30/30" alt="WhatsApp" className="img-fluid" />
      </motion.a>

      {/* Back to Top Button */}
      <motion.button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`position-fixed bottom-0 end-0 m-4 me-5 btn p-3 rounded-circle shadow-lg ${scrolled ? 'visible' : 'invisible'}`}
        style={{ backgroundColor: '#d6a84d', color: 'white', zIndex: 1000, opacity: scrolled ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp size={24} />
      </motion.button>
    </div>
  );
};

export default SuryaVilasPage;