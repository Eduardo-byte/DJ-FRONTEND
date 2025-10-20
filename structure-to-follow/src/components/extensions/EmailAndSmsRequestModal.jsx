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

const RequestEmailAndSmsIntegrationModal = ({ isOpen, onClose, platforms, selectedPlatform }) => {
    const { loggedInUser } = useContext(UserDataContext);
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);


    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const payload = {
                client_data: loggedInUser,
                selected_platforms: selectedPlatform
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
                            <h3 className="text-xl font-semibold">Enterprise Integration</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            You are requesting {selectedPlatform} Integration
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

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-green-700">
                                        One of the team will reach out to get this started for you, please submit the request bellow
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

export default RequestEmailAndSmsIntegrationModal;
