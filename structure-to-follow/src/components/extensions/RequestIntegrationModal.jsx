import React, { useState, useContext } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Spinner,
} from "@heroui/react";
import { Bot, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import axios from "axios";

const WEBHOOK_URL = "https://hook.eu1.make.com/1w5kt6tnnmuy2gk1lxd8gfm8x974rbpu";

const RequestIntegrationModal = ({ isOpen, onClose, platforms }) => {
  const { loggedInUser } = useContext(UserDataContext);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Filter out "Widget" and "Add to a team" platforms and only include coming soon platforms
  // const availablePlatforms = platforms.filter(
  //   (platform) =>
  //     platform.comingSoon &&
  //     platform.name !== "Widget" &&
  //     platform.name !== "Add to a team"
  // );
  // Filter out platforms that shouldn't be requestable
  const availablePlatforms = platforms.filter(
    (platform) =>
      platform.comingSoon &&
      !["Widget", "Add to a team", "Email", "SMS"].includes(platform.name)
  );


  const handlePlatformToggle = (platformName) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformName)) {
        return prev.filter((name) => name !== platformName);
      } else {
        return [...prev, platformName];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform to request integration");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        client_data: loggedInUser,
        selected_platforms: selectedPlatforms
      };

      await axios.post(WEBHOOK_URL, payload);

      setIsSuccess(true);
      toast.success("Integration request submitted successfully!");

      // Reset after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedPlatforms([]);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting integration request:", error);
      toast.error("Failed to submit integration request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-900">
              <Bot className="w-5 h-5 text-brand" />
              <h3 className="text-xl font-semibold">Request Integration</h3>
            </div>
            <p className="text-sm text-gray-500">
              Select the platforms you'd like us to integrate with your account
            </p>
          </ModalHeader>

          <ModalBody>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Request Submitted!</h4>
                <p className="text-center text-gray-600">
                  Our team will review your integration request and get back to you soon.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">
                  Select the platforms you want to integrate with your account:
                </p>

                <div className="space-y-3 max-h-60 overflow-y-auto p-1">
                  {availablePlatforms.map((platform) => (
                    <div
                      key={platform.name}
                      className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        isSelected={selectedPlatforms.includes(platform.name)}
                        onChange={() => handlePlatformToggle(platform.name)}
                        color="primary"
                      />
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          <platform.icon
                            className="w-4 h-4"
                            style={{ color: platform.color }}
                          />
                        </div>
                        <span className="font-medium text-gray-800">{platform.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Our team will review your request and contact you with next steps for integration.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="bg-brand text-gray-900"
              onPress={handleSubmit}
              isDisabled={selectedPlatforms.length === 0 || isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="current" className="mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
};

export default RequestIntegrationModal;
