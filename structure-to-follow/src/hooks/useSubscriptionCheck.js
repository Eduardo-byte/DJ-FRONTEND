import { useState, useEffect } from 'react';
import { subscriptionService } from '../api/services/subscription.service';

/**
 * Custom hook to check subscription status and show payment modal if needed
 * @param {Object} loggedInUser - Logged in user data containing subscription_id
 * @param {Object} user - Authenticated user object
 * @returns {Object} - { showPaymentModal, setShowPaymentModal, handleGoToCheckout, handleBookDemo }
 */
export const useSubscriptionCheck = (loggedInUser, user) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!loggedInUser?.subscription_id || !user) return;

      // Don't show payment modal for Enterprise users (custom payment arrangements)
      if (loggedInUser?.account_type === "enterprise") {
        console.log("Enterprise user - no payment modal needed");
        setShowPaymentModal(false);
        return;
      }

      // Don't show payment modal for God Mode users (app owners/administrators)
      if (loggedInUser?.role === "God Mode") {
        console.log("God Mode user - no payment modal needed");
        setShowPaymentModal(false);
        return;
      }

      try {
        // console.log("Checking subscription status for:", loggedInUser.subscription_id);
        const subscriptionData = await subscriptionService.getSubscriptionById(loggedInUser.subscription_id);
        // console.log("Subscription data:", subscriptionData);

        if (subscriptionData && subscriptionData.zoho_info) {
          // Check if zoho_info is empty object {}
          const isZohoInfoEmpty = Object.keys(subscriptionData.zoho_info).length === 0;
          
          if (isZohoInfoEmpty) {
            console.log("Inactive subscription");
            setShowPaymentModal(true);
          } else {
            console.log("Active subscription");
          }
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscriptionStatus();
  }, [loggedInUser?.subscription_id, loggedInUser?.account_type, loggedInUser?.role, user]);

  const handleGoToCheckout = (navigate) => {
    return () => {
      // Navigate to profile plans page for checkout
      navigate('/profile?tab=plans');
      setShowPaymentModal(false);
    };
  };

  const handleBookDemo = () => {
    // Open demo booking link in new tab
    window.open('https://api.leadconnectorhq.com/widget/booking/qrRuIqTrtBmzRoqVBg5r', '_blank');
    setShowPaymentModal(false);
  };

  return {
    showPaymentModal,
    setShowPaymentModal,
    handleGoToCheckout,
    handleBookDemo
  };
};
