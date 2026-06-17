import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { FaBolt, FaCheckCircle, FaCreditCard, FaMapMarkerAlt, FaShieldAlt, FaWallet } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Payments.css';

const FALLBACK_PLANS = [
  {
    _id: 'fallback-monthly',
    name: 'Monthly Membership',
    price: 2500,
    duration: 1,
    category: 'starter',
    popular: false,
    features: ['Unlimited gym access', 'Group classes', 'Weekly progress support']
  },
  {
    _id: 'fallback-quarterly',
    name: '3-Month Membership',
    price: 6500,
    duration: 3,
    category: 'popular',
    popular: true,
    features: ['Unlimited gym access', 'Group classes', 'Nutrition guide', 'Monthly trainer check-in']
  },
  {
    _id: 'fallback-yearly',
    name: 'Annual Membership',
    price: 22500,
    duration: 12,
    category: 'premium',
    popular: false,
    features: ['Maximum savings', 'Premium coaching', 'All-access pass', 'Priority support']
  }
];

const UPI_DETAILS = {
  vpa: '9390672746@axl',
  phone: '+91 93906 72746',
  note: 'Use PhonePe, Google Pay, Paytm, or any UPI app to complete your membership payment.',
  instructions: [
    'Open your UPI app and choose Scan QR or UPI ID payment.',
    'Confirm the total amount shown in the summary.',
    'Complete the transfer and keep the payment reference ready if needed.'
  ]
};

const GYM_CENTERS = [
  {
    id: 'kukatpally',
    name: 'FitHub Kukatpally',
    address: 'KPHB Colony, Kukatpally, Hyderabad, Telangana',
    fee: 0,
    highlights: 'Spacious strength floor, cardio zone, and group classes.'
  },
  {
    id: 'jubilee-hills',
    name: 'FitHub Jubilee Hills',
    address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana',
    fee: 500,
    highlights: 'Premium hub with specialized equipment, sauna access, and valet parking.'
  },
  {
    id: 'hitec-city',
    name: 'FitHub HITEC City',
    address: 'Madhapur Road, HITEC City, Hyderabad, Telangana',
    fee: 300,
    highlights: 'Tech-district favorite with express training zones and recovery lounge.'
  },
  {
    id: 'gachibowli',
    name: 'FitHub Gachibowli',
    address: 'Financial District, Gachibowli, Hyderabad, Telangana',
    fee: 300,
    highlights: 'Large functional training turf, Olympic lifting platforms, and pool.'
  },
  {
    id: 'banjara-hills',
    name: 'FitHub Banjara Hills',
    address: 'Road No. 12, Banjara Hills, Hyderabad, Telangana',
    fee: 800,
    highlights: 'Elite wellness center with spa, personal coaching, and rooftop yoga.'
  },
  {
    id: 'secunderabad',
    name: 'FitHub Secunderabad',
    address: 'SP Road, Secunderabad, Telangana',
    fee: 0,
    highlights: 'Classic bodybuilding zone with extensive free weights and heavy machines.'
  }
];

const QR_IMAGE_URL = '/qr-code.png';

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const enrichPlan = (plan = {}) => ({
  ...plan,
  category: plan.category || (plan.duration >= 12 ? 'premium' : plan.duration >= 3 ? 'popular' : 'starter'),
  popular: Boolean(plan.popular || plan.duration === 3),
  features: Array.isArray(plan.features) ? plan.features : [],
  savingsLabel:
    plan.duration >= 12 ? 'Best yearly savings' : plan.duration >= 3 ? 'Most selected by members' : 'Flexible monthly access'
});

const CheckoutForm = ({ plan, center, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        API_ENDPOINTS.PAYMENTS_CREATE_INTENT,
        { planId: plan._id, centerId: center?.id || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        const response = await axios.post(
          API_ENDPOINTS.PAYMENTS_CONFIRM,
          {
            paymentIntentId: data.clientSecret.split('_secret_')[0],
            planId: plan._id,
            centerId: center?.id || null
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const trainerName = response.data?.assignedTrainer?.name;
        toast.success(
          trainerName
            ? `Payment successful. Membership activated and linked to trainer ${trainerName}.`
            : 'Payment successful. Membership activated.'
        );
        onSuccess(response.data?.assignedTrainer || null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form-card">
      <h3>Secure Card Payment</h3>
      <p>Pay online and activate the selected membership immediately after successful confirmation.</p>
      <div className="form-group">
        <label>Card Details</label>
        <div className="card-element">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#334155',
                  '::placeholder': { color: '#94a3b8' }
                },
                invalid: { color: '#b91c1c' }
              }
            }}
          />
        </div>
      </div>
      <button type="submit" disabled={!stripe || loading} className="pay-btn">
        {loading ? 'Processing...' : `Pay ${formatCurrency((plan?.price || 0) + (center?.fee || 0))}`}
      </button>
    </form>
  );
};

const Payments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(GYM_CENTERS[0]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [stripeLoadError, setStripeLoadError] = useState(null);
  const [myMembership, setMyMembership] = useState(null);

  const stripePromise = useMemo(() => {
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey || publishableKey === 'pk_test_your_key_here') {
      return null;
    }

    return loadStripe(publishableKey).catch((error) => {
      console.error('Stripe failed to load:', error);
      setStripeLoadError('Online card payments are unavailable right now. Please use UPI.');
      return null;
    });
  }, []);

  const fetchMembership = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.MY_MEMBERSHIP, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyMembership(res.data);
    } catch (err) {
      setMyMembership(null);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(API_ENDPOINTS.PAYMENTS_PLANS);
      const fetchedPlans = Array.isArray(res.data) ? res.data.map(enrichPlan) : [];
      const finalPlans = fetchedPlans.length ? fetchedPlans : FALLBACK_PLANS.map(enrichPlan);
      setPlans(finalPlans);

      const selectedName = location.state?.selectedPlanName;
      if (selectedName) {
        const matchedPlan = finalPlans.find(
          (plan) => plan.name === selectedName || plan.name?.toLowerCase() === selectedName?.toLowerCase()
        );
        if (matchedPlan) {
          setSelectedPlan(matchedPlan);
          setShowPaymentForm(true);
        }
      }
    } catch (err) {
      console.error('Payments fetch error:', err);
      setFetchError('Unable to load payment plans. Showing default options.');
      setPlans(FALLBACK_PLANS.map(enrichPlan));
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchPlans();
    fetchMembership();
  }, [fetchMembership, fetchPlans]);

  const selectedCenterFee = selectedCenter?.fee || 0;
  const totalAmount = selectedPlan ? (selectedPlan.price || 0) + selectedCenterFee : 0;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setSelectedCenter(GYM_CENTERS[0]);
    setPaymentMethod('card');
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (assignedTrainer = null) => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    setPaymentMethod('card');
    fetchMembership();
    if (assignedTrainer) {
      setMyMembership((currentMembership) => ({
        ...(currentMembership || {}),
        assignedTrainer
      }));
    }
  };

  return (
    <div className="payments-page">
      <section className="payments-hero">
        <div className="payments-hero-copy">
          <span className="payments-eyebrow">Membership Checkout</span>
          <h1>Choose a plan, select your center, and activate access faster</h1>
          <p>
            Compare membership plans, review branch upgrade fees, and complete payment through card or UPI from one streamlined page.
          </p>
        </div>

        <div className="payments-highlights">
          <div className="payments-highlight-card">
            <FaShieldAlt />
            <div>
              <strong>Secure checkout</strong>
              <span>Card and UPI payment support</span>
            </div>
          </div>
          <div className="payments-highlight-card">
            <FaBolt />
            <div>
              <strong>Instant activation</strong>
              <span>Membership updates after payment confirmation</span>
            </div>
          </div>
          <div className="payments-highlight-card">
            <FaMapMarkerAlt />
            <div>
              <strong>Center selection</strong>
              <span>Choose the branch that fits your routine</span>
            </div>
          </div>
        </div>
      </section>

      {myMembership && (
        <section className="current-membership-banner">
          <div>
            <span className="payments-eyebrow">Active Membership</span>
            <h2>{myMembership.planName}</h2>
            <p>
              {myMembership.center ? `${myMembership.center} center selected.` : 'Center selection not set yet.'}
              {myMembership.expiryDate ? ` Expires on ${new Date(myMembership.expiryDate).toLocaleDateString()}.` : ''}
              {myMembership.assignedTrainer?.name ? ` Trainer: ${myMembership.assignedTrainer.name}.` : ''}
            </p>
          </div>
          <button className="membership-link-btn" onClick={() => navigate('/membership')}>
            Manage Membership
          </button>
        </section>
      )}

      {fetchError && (
        <div className="payment-error">
          <p>{fetchError}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading plans...</div>
      ) : !showPaymentForm ? (
        <section className="payments-layout">
          <div className="plans-grid">
            {plans.length ? plans.map((plan) => (
              <article key={plan._id} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                <div className="plan-topline">
                  <span className={`plan-category category-${plan.category}`}>{plan.category}</span>
                  {plan.popular && <span className="plan-badge">Most Popular</span>}
                </div>
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">Rs.</span>
                    <span className="amount">{Number(plan.price || 0).toLocaleString('en-IN')}</span>
                    <span className="period">/{plan.duration} month{plan.duration > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <p className="plan-savings">{plan.savingsLabel}</p>
                <div className="plan-features">
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li key={index}><FaCheckCircle /> <span>{feature}</span></li>
                    ))}
                  </ul>
                </div>
                <button className="select-plan-btn" onClick={() => handlePlanSelect(plan)}>
                  Select Plan
                </button>
              </article>
            )) : (
              <div className="payment-empty">
                <p>No plans are available right now. Please try again later or contact support.</p>
              </div>
            )}
          </div>

          <aside className="payments-side-panel">
            <h3>Before you pay</h3>
            <ul>
              <li>Pick the plan that matches your training timeline.</li>
              <li>Choose your preferred branch before checkout.</li>
              <li>Card payments activate immediately after confirmation.</li>
              <li>UPI payments can be completed using the QR or UPI ID shown.</li>
            </ul>
            <button className="membership-link-btn secondary" onClick={() => navigate('/membership')}>
              View Membership Details
            </button>
          </aside>
        </section>
      ) : (
        <section className="payment-container">
          <div className="payment-summary">
            <h3>Payment Summary</h3>
            <p><strong>Plan:</strong> {selectedPlan.name}</p>
            <p><strong>Base amount:</strong> {formatCurrency(selectedPlan.price)}</p>
            <p><strong>Duration:</strong> {selectedPlan.duration} month{selectedPlan.duration > 1 ? 's' : ''}</p>

            <div className="center-selection-section">
              <h4>Select Your Gym Center</h4>
              <div className="center-selection">
                {GYM_CENTERS.map((center) => (
                  <button
                    key={center.id}
                    type="button"
                    className={`center-card ${selectedCenter?.id === center.id ? 'active' : ''}`}
                    onClick={() => setSelectedCenter(center)}
                  >
                    <h4>{center.name}</h4>
                    <p className="center-address">{center.address}</p>
                    <p className="center-highlights">{center.highlights}</p>
                    <p className="center-price">
                      {center.fee > 0 ? `+ ${formatCurrency(center.fee)} premium access` : 'Included'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="summary-row">
              <span>Location upgrade fee</span>
              <span>{formatCurrency(selectedCenterFee)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Payable</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>

            <div className="payment-method-toggle">
              <button
                type="button"
                className={`method-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
                disabled={!stripePromise}
              >
                <FaCreditCard /> Card
              </button>
              <button
                type="button"
                className={`method-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <FaWallet /> UPI
              </button>
            </div>
          </div>

          {paymentMethod === 'card' ? (
            stripePromise ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm plan={selectedPlan} center={selectedCenter} onSuccess={handlePaymentSuccess} />
              </Elements>
            ) : (
              <div className="payment-error">
                <p>{stripeLoadError || 'Online card payments are unavailable right now. Please use UPI.'}</p>
              </div>
            )
          ) : (
            <div className="upi-panel">
              <h3>UPI / PhonePe Payment</h3>
              <p>{UPI_DETAILS.note}</p>
              <div className="upi-details">
                <span><strong>Center:</strong> {selectedCenter?.name}</span>
                <span><strong>UPI ID:</strong> {UPI_DETAILS.vpa}</span>
                <span><strong>Phone:</strong> {UPI_DETAILS.phone}</span>
              </div>
              <div className="summary-row total">
                <span>Total Payable</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <ul>
                {UPI_DETAILS.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
              {QR_IMAGE_URL ? (
                <img src={QR_IMAGE_URL} alt="UPI QR Code" className="qr-code-image" />
              ) : (
                <div className="qr-code-placeholder">
                  <strong>Place your QR code image:</strong>
                  <p>Save your UPI QR code as <code>qr-code.png</code> in the <code>Frontend/public/</code> folder.</p>
                </div>
              )}
              <p className="upi-qr-note">Scan the QR code or use the UPI ID / PhonePe number to complete payment.</p>
            </div>
          )}

          <button className="back-btn" onClick={() => setShowPaymentForm(false)}>
            Back to Plans
          </button>
        </section>
      )}
    </div>
  );
};

export default Payments;
