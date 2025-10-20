import { useState, useContext } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@heroui/react";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import { subscriptionService } from "../../api";

export default function CancelSubscriptionModal({ isOpen, onClose }) {
  const { userData, setUserData } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleCancellation = async () => {

    setIsLoading(true);

    try {
      const result = await subscriptionService.cancelSubscription(userData.contact_email, userData.account_type, userData.client_id);
      
      if (result.success) {
        // // Update user subscription to 'basic'
        // setUserData({
        //   ...userData,
        //   account_type: "basic",
        // });
        toast.success(`Your subscription has been cancelled. Your account will be deactivated on ${result.subscription.subscription.scheduled_cancellation_date}.`);
        onClose();
      } else {
        toast.error(result.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("An error occurred while cancelling your subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Cancel Subscription</ModalHeader>
        <Divider />
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to cancel your subscription? This will downgrade your account to the Basic plan immediately.
            </p>
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Important: You will lose access to:</h4>
              <ul className="list-disc pl-5 text-xs text-amber-700 space-y-1">
                <li>All premium AI agents you've created</li>
                <li>Conversation history beyond the Basic plan limits</li>
                <li>Team member access and permissions</li>
                <li>Social media and CRM integrations</li>
                <li>Advanced analytics and custom reports</li>
                <li>Premium message allowances</li>
              </ul>
              <p className="text-xs text-amber-700 mt-2">
                This action cannot be undone. You will need to subscribe again to regain access to premium features.
              </p>
            </div>
          </div>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            className="bg-gray-100 text-gray-700 text-sm h-8"
          >
            Abort
          </Button>
          <Button
            onPress={handleCancellation}
            className="bg-red-600 text-white text-sm h-8"
            isLoading={isLoading}
          >
            Confirm Cancellation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
