// DeleteLeadModal.jsx
import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { userService } from "../../api/services/users.service";

const DeleteLeadModal = ({
    isOpen,
    onClose,
    lead, // can be a single lead object or an array of leads
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    setLeadToDelete,
}) => {
    const [confirmText, setConfirmText] = useState("");
    const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

    // Reset input when the modal opens or when a new lead is passed in
    useEffect(() => {
        setConfirmText("");
        setIsConfirmEnabled(false);
    }, [lead, isOpen]);

    // Enable deletion only when the confirmation text matches "confirm-delete"
    useEffect(() => {
        setIsConfirmEnabled(confirmText.trim().toLowerCase() === "confirm-delete");
    }, [confirmText]);

    const handleDelete = async () => {
        if (isConfirmEnabled) {
            // If 'lead' is an array, extract each user_id; otherwise, wrap the single id in an array.
            const userIds = Array.isArray(lead)
                ? lead.map(item => item.user_id)
                : [lead.user_id];
            //console.log("Deleting user(s):", userIds);
            const result = await userService.deleteUsers(userIds);
            // if (result) {
            //     console.log("User(s) deleted:", result);
            //     // Optionally, you might want to trigger a re-fetch or update state here.
            // }
        }
        onClose();
    };

    const expectedText = "confirm-delete";

    // Display different message based on whether we're deleting one or multiple leads.
    let displayMessage = "";
    if (Array.isArray(lead)) {
        displayMessage = `You are about to delete ${lead.length} leads. This will permanently remove these leads and all associated data.`;
    } else if (lead) {
        displayMessage = `You are about to delete ${lead.first_name} ${lead.last_name}. This will permanently remove the lead and all associated data.`;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <>
                    <ModalHeader className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-danger">
                            <AlertTriangle className="w-5 h-5 text-danger" />
                            <h3 className="text-xl font-semibold text-danger">
                                Delete Lead{Array.isArray(lead) ? "s" : ""}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </ModalHeader>
                    <ModalBody>
                        {lead && (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    {displayMessage}
                                </p>
                                <div className="bg-danger-50 p-4 rounded-lg mb-4">
                                    <p className="text-sm text-danger-600">
                                        To confirm, please type{" "}
                                        <span className="font-mono font-medium">{expectedText}</span> below:
                                    </p>
                                </div>
                                <Input
                                    placeholder={`Type ${expectedText} to confirm`}
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    variant="bordered"
                                    color={isConfirmEnabled ? "success" : "default"}
                                    className="w-full"
                                />
                            </>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onPress={handleDelete}
                            isDisabled={!isConfirmEnabled}
                        >
                            Delete Lead{Array.isArray(lead) ? "s" : ""}
                        </Button>
                    </ModalFooter>
                </>
            </ModalContent>
        </Modal>
    );
};

export default DeleteLeadModal;
