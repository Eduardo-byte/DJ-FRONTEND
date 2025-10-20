import React, { useState, useEffect } from "react";
import { chatService } from "../api/services/chat.service";
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

const DeleteAgentModal = ({ 
  isOpen, 
  onClose, 
  agent, 
  onDelete,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  
  // Reset the input when the modal opens with a different agent
  useEffect(() => {
    setConfirmText("");
    setIsConfirmEnabled(false);
  }, [agent, isOpen]);
  
  // Check if the confirmation text matches the agent name
  useEffect(() => {
    if (agent && confirmText === agent.name.toLowerCase().replace(/\s+/g, '-')) {
      setIsConfirmEnabled(true);
    } else {
      setIsConfirmEnabled(false);
    }
  }, [confirmText, agent]);
  
  const handleDelete = async () => {
    if (!isConfirmEnabled || !agent) return;
    
    setIsDeleting(true);
    setError("");
    
    try {
      // Call the deleteAgent service
      const success = await chatService.deleteAgent(agent.id);
      
      if (success) {
        // Call the onDelete callback to update the UI
        if (onDelete) {
          onDelete(agent);
        }
        onClose();
      } else {
        setError("Failed to delete the agent. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      setError("An error occurred while deleting the agent. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const expectedText = agent ? agent.name.toLowerCase().replace(/\s+/g, '-') : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5 text-danger" />
                <h3 className="text-xl font-semibold text-danger">Delete Agent</h3>
              </div>
              <p className="text-sm text-gray-500">
                This action cannot be undone
              </p>
            </ModalHeader>
            <ModalBody>
              {agent && (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    You are about to delete <span className="font-semibold">{agent.name}</span>. This will permanently remove the agent and all associated data.
                  </p>
                  
                  <div className="bg-danger-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-danger-600">
                      To confirm, please type <span className="font-mono font-medium">{expectedText}</span> below:
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
              {error && (
                <p className="text-danger text-sm">{error}</p>
              )}
              <Button 
                color="danger" 
                onPress={handleDelete}
                isDisabled={!isConfirmEnabled || isDeleting}
                isLoading={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Agent"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeleteAgentModal;
