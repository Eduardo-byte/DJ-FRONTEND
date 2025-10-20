import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { requestsService } from '../api';
import { stripePromise } from '../lib/stripe';
import { formatCurrency, dollarsToCents } from '../utils/money';
import { validateSongTitle, validateGreeting, validateImageFile, validateRequired } from '../utils/validators';
import toast from 'react-hot-toast';

const TIERS = [
  {
    id: 'song',
    name: 'Song Request',
    description: 'Request a song',
    basePrice: 5.00,
    icon: '🎵'
  },
  {
    id: 'song_greeting',
    name: 'Song + Greeting',
    description: 'Request a song with a personal message',
    basePrice: 10.00,
    icon: '💬'
  },
  {
    id: 'song_greeting_picture',
    name: 'Song + Greeting + Picture',
    description: 'Request a song with a message and photo',
    basePrice: 15.00,
    icon: '📸'
  }
];

const RequestForm = ({ eventData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [formData, setFormData] = useState({
    tier: 'song',
    songTitle: '',
    greeting: '',
    image: null,
    tip: 0,
    receiptEmail: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const selectedTier = TIERS.find(tier => tier.id === formData.tier);
  const baseAmount = selectedTier?.basePrice || 0;
  const totalAmount = baseAmount + formData.tip;

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      if (file) {
        const validation = validateImageFile(file);
        if (validation.valid) {
          const reader = new FileReader();
          reader.onload = (e) => setImagePreview(e.target.result);
          reader.readAsDataURL(file);
          setErrors(prev => ({ ...prev, [name]: '' }));
        } else {
          setErrors(prev => ({ ...prev, [name]: validation.error }));
          setImagePreview(null);
        }
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleTipChange = (amount) => {
    setFormData(prev => ({ ...prev, tip: Math.max(0, amount) }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Song title validation
    if (!validateSongTitle(formData.songTitle)) {
      newErrors.songTitle = 'Song title is required';
    }

    // Greeting validation (optional but with limits)
    if (!validateGreeting(formData.greeting)) {
      newErrors.greeting = 'Greeting is too long (max 500 characters)';
    }

    // Email validation
    if (!validateRequired(formData.receiptEmail)) {
      newErrors.receiptEmail = 'Email is required for receipt';
    }

    // Image validation for picture tier
    if (formData.tier === 'song_greeting_picture' && !formData.image) {
      newErrors.image = 'Image is required for this tier';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Create request first
      const requestData = {
        tier: formData.tier,
        amount_cents: dollarsToCents(baseAmount),
        tip_cents: dollarsToCents(formData.tip),
        song_title: formData.songTitle,
        greeting: formData.greeting || undefined,
        has_image: !!formData.image,
        receipt_email: formData.receiptEmail
      };

      const response = await requestsService.createRequest(eventId, requestData);
      const { requestId, clientSecret } = response;

      // For now, we'll just show success - in a real implementation, 
      // you'd integrate the Stripe payment flow here with the clientSecret

      toast.success('Request submitted successfully!');
      
      // Reset form
      setFormData({
        tier: 'song',
        songTitle: '',
        greeting: '',
        image: null,
        tip: 0,
        receiptEmail: '',
      });
      setImagePreview(null);
      
    } catch (error) {
      console.error('Request submission error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tier Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Request Type
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <label
              key={tier.id}
              className={`relative p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                formData.tier === tier.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value={tier.id}
                checked={formData.tier === tier.id}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-2">{tier.icon}</div>
                <div className="font-medium text-gray-900">{tier.name}</div>
                <div className="text-sm text-gray-500 mb-2">{tier.description}</div>
                <div className="text-lg font-bold text-indigo-600">
                  {formatCurrency(dollarsToCents(tier.basePrice))}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Song Title */}
      <div>
        <label htmlFor="songTitle" className="block text-sm font-medium text-gray-700">
          Song Title *
        </label>
        <input
          type="text"
          id="songTitle"
          name="songTitle"
          value={formData.songTitle}
          onChange={handleInputChange}
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.songTitle ? 'border-red-300' : ''
          }`}
          placeholder="e.g., Don't Stop Believin' by Journey"
        />
        {errors.songTitle && (
          <p className="mt-1 text-sm text-red-600">{errors.songTitle}</p>
        )}
      </div>

      {/* Greeting (for greeting tiers) */}
      {(formData.tier === 'song_greeting' || formData.tier === 'song_greeting_picture') && (
        <div>
          <label htmlFor="greeting" className="block text-sm font-medium text-gray-700">
            Personal Message
          </label>
          <textarea
            id="greeting"
            name="greeting"
            rows={3}
            value={formData.greeting}
            onChange={handleInputChange}
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.greeting ? 'border-red-300' : ''
            }`}
            placeholder="Say hello, share a memory, or make a dedication..."
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.greeting.length}/500 characters
          </p>
          {errors.greeting && (
            <p className="mt-1 text-sm text-red-600">{errors.greeting}</p>
          )}
        </div>
      )}

      {/* Image (for picture tier) */}
      {formData.tier === 'song_greeting_picture' && (
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Upload Photo *
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleInputChange}
            className={`mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 ${
              errors.image ? 'border-red-300' : ''
            }`}
          />
          {imagePreview && (
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg"
              />
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">
            JPG, PNG, or GIF up to 5MB
          </p>
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>
      )}

      {/* Tip */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a Tip (Optional)
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleTipChange(formData.tip - 1)}
            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            -
          </button>
          <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50 min-w-20 text-center">
            {formatCurrency(dollarsToCents(formData.tip))}
          </div>
          <button
            type="button"
            onClick={() => handleTipChange(formData.tip + 1)}
            className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            +
          </button>
        </div>
        <div className="flex space-x-2 mt-2">
          {[2, 5, 10].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleTipChange(amount)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Receipt Email */}
      <div>
        <label htmlFor="receiptEmail" className="block text-sm font-medium text-gray-700">
          Email for Receipt *
        </label>
        <input
          type="email"
          id="receiptEmail"
          name="receiptEmail"
          value={formData.receiptEmail}
          onChange={handleInputChange}
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            errors.receiptEmail ? 'border-red-300' : ''
          }`}
          placeholder="your.email@example.com"
        />
        {errors.receiptEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.receiptEmail}</p>
        )}
      </div>

      {      /* Payment will be handled after request creation */}

      {/* Total */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Total:</span>
          <span className="text-2xl font-bold text-indigo-600">
            {formatCurrency(dollarsToCents(totalAmount))}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {formatCurrency(dollarsToCents(baseAmount))} request
          {formData.tip > 0 && ` + ${formatCurrency(dollarsToCents(formData.tip))} tip`}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          `Submit Request - ${formatCurrency(dollarsToCents(totalAmount))}`
        )}
      </button>
    </form>
  );
};

const PublicRequest = () => {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🎵 PublicRequest component loaded, eventId:', eventId);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching event data for eventId:', eventId);
      
      // TODO: Add proper public endpoint to get event details
      // For now, use placeholder data so the form works
      setEventData({
        id: eventId,
        dj: { 
          nickname: 'DJ', 
          display_name: 'DJ',
          name: 'DJ' 
        },
        venue_name: 'Live Event',
        status: 'running'
      });
      
      console.log('✅ Event data loaded (placeholder)');
      
    } catch (error) {
      console.error('❌ Error fetching event data:', error);
      setError(error.response?.status === 404 ? 'Event not found' : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Available</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Check if Stripe is configured
  if (!stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment System Not Available</h1>
          <p className="text-gray-600">
            The payment system is not configured. Please contact the DJ or try again later.
          </p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎵</div>
          <h1 className="text-3xl font-bold text-gray-900">
            Request a Song
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            for {eventData?.dj?.display_name || 'the DJ'}
          </p>
          <div className="text-sm text-gray-500 mt-1">
            {eventData?.venue_name}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <Elements stripe={stripePromise}>
            <RequestForm eventData={eventData} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PublicRequest;
