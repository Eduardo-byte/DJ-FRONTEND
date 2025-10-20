import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { validateRequired, validateMinLength, validateMaxLength } from '../utils/validators';

const Settings = () => {
  const { djProfile, refreshDjProfile } = useAuthStore();
  const [profileForm, setProfileForm] = useState({
    display_name: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [stripeAccount, setStripeAccount] = useState(null);
  const [loadingStripe, setLoadingStripe] = useState(false);

  useEffect(() => {
    if (djProfile) {
      setProfileForm({
        display_name: djProfile.display_name || '',
      });
    }
    fetchStripeAccount();
  }, [djProfile]);

  const fetchStripeAccount = async () => {
    setLoadingStripe(true);
    try {
      const response = await api.get('/api/djs/stripe/account');
      setStripeAccount(response.data);
    } catch (error) {
      console.error('Error fetching Stripe account:', error);
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Display name validation
    if (!validateRequired(profileForm.display_name)) {
      newErrors.display_name = 'Display name is required';
    } else if (!validateMinLength(profileForm.display_name, 2)) {
      newErrors.display_name = 'Display name must be at least 2 characters';
    } else if (!validateMaxLength(profileForm.display_name, 100)) {
      newErrors.display_name = 'Display name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.put('/api/djs/me', profileForm);
      await refreshDjProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeOnboarding = async () => {
    setLoadingStripe(true);
    try {
      const response = await api.post('/api/djs/stripe/onboarding-link');
      window.open(response.data.url, '_blank');
      
      // Refresh Stripe account data after a delay
      setTimeout(() => {
        fetchStripeAccount();
      }, 2000);
    } catch (error) {
      console.error('Error creating Stripe onboarding link:', error);
      toast.error('Failed to create Stripe onboarding link');
    } finally {
      setLoadingStripe(false);
    }
  };

  const getStripeStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'restricted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStripeStatusText = (account) => {
    if (!account) return 'Not connected';
    if (account.charges_enabled && account.payouts_enabled) return 'Active';
    if (account.details_submitted) return 'Under review';
    return 'Incomplete';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your profile and payment settings.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={profileForm.display_name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.display_name ? 'border-red-300' : ''
                  }`}
                  placeholder="Your DJ name"
                />
                {errors.display_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This is the name guests will see when making requests.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : null}
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Stripe Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h2>
            
            {loadingStripe ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading payment info...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Stripe Account Status
                      </p>
                      <p className="text-sm text-gray-500">
                        Required to receive payments from requests
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStripeStatusColor(stripeAccount?.status)
                    }`}>
                      {getStripeStatusText(stripeAccount)}
                    </span>
                    {(!stripeAccount || !stripeAccount.charges_enabled) && (
                      <button
                        onClick={handleStripeOnboarding}
                        disabled={loadingStripe}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {loadingStripe ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Complete Setup'
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {stripeAccount && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account ID
                      </p>
                      <p className="text-sm text-gray-900 font-mono">
                        {stripeAccount.account_id}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capabilities
                      </p>
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            stripeAccount.charges_enabled ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          Charges {stripeAccount.charges_enabled ? 'enabled' : 'disabled'}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            stripeAccount.payouts_enabled ? 'bg-green-400' : 'bg-red-400'
                          }`}></span>
                          Payouts {stripeAccount.payouts_enabled ? 'enabled' : 'disabled'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-blue-400">ℹ️</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        {stripeAccount?.charges_enabled ? 
                          'Your Stripe account is set up and ready to receive payments!' :
                          'Complete your Stripe onboarding to start receiving payments from song requests.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
