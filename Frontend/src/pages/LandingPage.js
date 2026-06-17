import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

// Premium video sources with better fallback handling
const HERO_VIDEO_SRC = 'https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-dumbbells-in-a-gym-4835-large.mp4';
const GYM_VIDEO_SRC = 'https://assets.mixkit.co/videos/preview/mixkit-people-training-in-a-gym-4834-large.mp4';
const HERO_FALLBACK_IMG = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80';
const GYM_FALLBACK_IMG = 'https://images.unsplash.com/photo-1594868096513-7713f1463c6f?auto=format&fit=crop&w=1920&q=80';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planToConfirm, setPlanToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [heroVideoError, setHeroVideoError] = useState(false);
  const [gymVideoError, setGymVideoError] = useState(false);

  React.useEffect(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.play().catch(error => {
        console.log("Video autoplay blocked or failed:", error);
      });
    });
  }, []);

  const planOptions = [
    {
      id: 'monthly',
      title: 'Monthly Membership',
      price: '₹2,500',
      description: 'Unlimited gym access + group classes',
      duration: '1 month',
    },
    {
      id: 'quarterly',
      title: '3-Month Membership',
      price: '₹6,500',
      description: 'Best value for steady progress',
      duration: '3 months',
    },
    {
      id: 'yearly',
      title: 'Annual Membership',
      price: '₹22,500',
      description: 'Maximum savings for long-term training',
      duration: '12 months',
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    setPlanToConfirm(plan);
    setShowConfirmModal(true);
  };

  const confirmAndPay = () => {
    if (planToConfirm) {
      setShowConfirmModal(false);
      navigate('/payments', { state: { selectedPlanName: planToConfirm.title } });
    }
  };

  const gymCenters = [
    {
      id: 'kukatpally',
      name: 'FitHub Kukatpally',
      address: 'KPHB Colony, Kukatpally, Hyderabad, Telangana',
      description: 'Spacious strength floor, cardio zone, and group classes.',
      fee: 0,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jubilee-hills',
      name: 'FitHub Jubilee Hills',
      address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana',
      description: 'Premium hub with specialized equipment, sauna access, and valet parking.',
      fee: 500,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'hitec-city',
      name: 'FitHub HITEC City',
      address: 'Madhapur Road, HITEC City, Hyderabad, Telangana',
      description: 'Tech-district favorite with express training zones and recovery lounge.',
      fee: 300,
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'gachibowli',
      name: 'FitHub Gachibowli',
      address: 'Financial District, Gachibowli, Hyderabad, Telangana',
      description: 'Large functional training turf, Olympic lifting platforms, and pool.',
      fee: 300,
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'banjara-hills',
      name: 'FitHub Banjara Hills',
      address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana',
      description: 'Elite wellness center with spa, personal coaching, and rooftop yoga.',
      fee: 800,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'secunderabad',
      name: 'FitHub Secunderabad',
      address: 'SP Road, Secunderabad, Telangana',
      description: 'Classic bodybuilding zone with extensive free weights and heavy machines.',
      fee: 0,
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Member since 2023",
      text: "FitHub transformed my fitness journey. The trainers are top-notch and the atmosphere is electric!",
      avatar: "https://i.pravatar.cc/150?u=rahul"
    },
    {
      id: 2,
      name: "Priya Patel",
      role: "Athlete",
      text: "Best equipment in the city. I love the variety of classes and the community support.",
      avatar: "https://i.pravatar.cc/150?u=priya"
    },
    {
      id: 3,
      name: "Amit Verma",
      role: "Weightlifter",
      text: "The premium facilities at FitHub Uptown are unmatched. Highly recommend to anyone serious about their goals.",
      avatar: "https://i.pravatar.cc/150?u=amit"
    }
  ];

  const faqs = [
    {
      question: "What are the gym timings?",
      answer: "We are open 24/7 at all our premium locations to fit your schedule."
    },
    {
      question: "Do you offer personal training?",
      answer: "Yes, we have certified personal trainers available for one-on-one sessions and customized plans."
    },
    {
      question: "Can I access all FitHub centers?",
      answer: "Depending on your membership plan, you can enjoy access to multiple FitHub locations across the city."
    }
  ];

  const [activeFaq, setActiveFaq] = useState(null);

  const cancelConfirm = () => {
    setShowConfirmModal(false);
    setPlanToConfirm(null);
  };

  return (
    <div className="landing-page">
      <nav className="navbar-landing">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">FitHub</Link>
          <div className="navbar-links">
            <a href="#intro">Workouts</a>
            <a href="#plans">Plans</a>
            <a href="#centers">Centers</a>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-btn-primary">Join Now</Link>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-video-background">
          {!heroVideoError ? (
            <video
              className="hero-bg-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={HERO_FALLBACK_IMG}
              onError={() => setHeroVideoError(true)}
              onLoadStart={() => console.log('Hero video loading...')}
              style={{ display: heroVideoError ? 'none' : 'block' }}
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          ) : null}
          {heroVideoError && (
            <div 
              className="hero-video-fallback"
              style={{ backgroundImage: `url(${HERO_FALLBACK_IMG})` }}
            />
          )}
          <div className="hero-overlay"></div>
        </div>

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Welcome to FitHub Gym</h1>
          <p>Train like a community. Unlock premium intro workouts, guided videos, and live class energy.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-secondary">Login</Link>
          </div>
        </motion.div>
      </header>

      <section id="intro" className="intro-section">
        <div className="intro-header">
          <h2>Intro Workouts for Every Level</h2>
          <p>Start with guided sessions, intro videos, and premium routines that feel motivating and energizing.</p>
        </div>
        <div className="intro-grid">
          {[
            { title: "Bootcamp Blast", desc: "Short intro workout to ignite your energy and build strength with every rep.", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80", link: "https://www.youtube.com/watch?v=dJlFmxiL11s" },
            { title: "Mobility Reset", desc: "Ease into movement with a guided warm-up routine that improves flexibility and recovery.", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80", link: "https://www.youtube.com/watch?v=UItWltVZZmE" },
            { title: "Strength Ritual", desc: "Learn proper form, pacing, and intensity through a motivating strength introduction.", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80", link: "https://www.youtube.com/watch?v=2pLT-olgUJs" }
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              className="intro-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <img src={item.img} alt={item.title} />
              <div className="intro-card-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <a href={item.link} target="_blank" rel="noreferrer" className="btn-secondary">Watch Intro</a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="gym-video-section">
        <div className="gym-video-header">
          <span className="section-tag">Gym Atmosphere</span>
          <h2>Feel the gym energy before you join</h2>
          <p>Watch our training floor come alive with strength sessions, coached workouts, and premium gym space.</p>
        </div>
        <div className="gym-video-container">
          <div className="hero-video-frame">
            {!gymVideoError ? (
              <video
                className="hero-background-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={GYM_FALLBACK_IMG}
                onError={() => setGymVideoError(true)}
                onLoadStart={() => console.log('Gym video loading...')}
                style={{ display: gymVideoError ? 'none' : 'block' }}
              >
                <source src={GYM_VIDEO_SRC} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            ) : null}
            {gymVideoError && (
              <div
                className="hero-video-fallback"
                style={{
                  backgroundImage: `url(${GYM_FALLBACK_IMG})`,
                }}
              />
            )}
            <div className="gym-video-overlay"></div>
          </div>
        </div>
      </section>

      <section id="plans" className="plans-section">
        <div className="plans-content">
          <span className="section-tag">Passes & Plans</span>
          <h2>Explore Passes and Membership Plans</h2>
          <p>Choose the right pass for your schedule, then select the plan and complete payment instantly to get started.</p>
          <ul className="plans-benefits">
            <li>Flexible plans for every fitness goal</li>
            <li>Transparent pricing with instant checkout</li>
            <li>Easy selection and payment flow</li>
          </ul>
          <div className="plans-actions">
            <Link to="/payments" className="btn-primary">Browse Plans</Link>
          </div>
          <p className="plans-note">Already a member? Manage your plan on the membership page.</p>
        </div>
        <div className="plans-cards">
          {planOptions.map((plan, idx) => (
            <motion.div
              key={plan.id}
              className={`plan-card-landing ${selectedPlan === plan.id ? 'selected' : ''}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <h3>{plan.title}</h3>
              <p>{plan.price} / {plan.duration}</p>
              <ul>
                <li>{plan.description}</li>
                <li>Trusted payment checkout</li>
                <li>Activate instantly</li>
              </ul>
              <button
                type="button"
                className="select-plan-landing-btn"
                onClick={() => handleSelectPlan(plan)}
              >
                Select & Pay Now
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="centers" className="centers-section">
        <div className="centers-header">
          <span className="section-tag">Our Centers</span>
          <h2>Premium Gym Centers Near You</h2>
          <p>Choose the location that fits your schedule and training style.</p>
        </div>
        <div className="centers-grid">
          {gymCenters.map(center => (
            <div key={center.id} className="center-card">
              <img src={center.image} alt={center.name} className="center-image" />
              <div className="center-card-body">
                <h3>{center.name}</h3>
                <p className="center-address">{center.address}</p>
                <p className="center-description">{center.description}</p>
                <div className="center-card-footer">
                  <span>{center.fee > 0 ? `+₹${center.fee} upgrade` : 'Standard access included'}</span>
                  <Link to="/payments" className="btn-secondary">Book Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showConfirmModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Confirm Plan Selection</h3>
            <p>You're about to select <strong>{planToConfirm?.title}</strong> for <strong>{planToConfirm?.price}</strong>.</p>
            <div className="confirm-plan-details">
              <p><strong>Duration:</strong> {planToConfirm?.duration}</p>
              <p><strong>Description:</strong> {planToConfirm?.description}</p>
              <ul>
                <li>Instant access to classes</li>
                <li>Easy checkout from the payments page</li>
                <li>Choose UPI / PhonePe or card payment</li>
              </ul>
            </div>
            <p>Do you want to continue to payment?</p>
            <div className="confirm-actions">
              <button className="btn-secondary" type="button" onClick={cancelConfirm}>
                Cancel
              </button>
              <button className="btn-primary" type="button" onClick={confirmAndPay}>
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="features-section">
        <span className="section-tag">Benefits</span>
        <h2>Why Choose FitHub?</h2>
        <div className="features-grid">
          {[
            { title: "Expert Trainers", desc: "Professional trainers to guide you through your fitness journey", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" },
            { title: "Modern Equipment", desc: "State-of-the-art equipment for all your workout needs", img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80" },
            { title: "Flexible Plans", desc: "Choose from various membership plans that fit your lifestyle", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80" }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="feature-card"
              initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
            >
              <img src={feature.img} alt={feature.title} className="feature-image" />
              <div className="feature-card-body">
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="testimonials-section">
        <span className="section-tag">Community</span>
        <h2>What Our Members Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <motion.div 
              key={t.id} 
              className="testimonial-card"
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: t.id * 0.1 }}
            >
              <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
              <p className="testimonial-text">"{t.text}"</p>
              <h4>{t.name}</h4>
              <span>{t.role}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <span className="section-tag">FAQ</span>
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`}>
              <button 
                className="faq-question" 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
              >
                {faq.question}
                <span className="faq-icon">{activeFaq === index ? '-' : '+'}</span>
              </button>
              {activeFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-section">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>FitHub</h3>
            <p>Elevating your fitness experience with premium facilities and expert guidance.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/membership">Membership</Link></li>
              <li><Link to="/attendance">Attendance</Link></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p>Email: hello@fithub.com</p>
            <p>Phone: +91 98765 43210</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 FitHub Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;