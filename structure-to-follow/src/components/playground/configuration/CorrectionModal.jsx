import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Tooltip } from "@heroui/react";
import { ThumbsDown, Check } from "lucide-react";

const CorrectionModal = ({ messageIndex, messageContent, onSaveCorrection, feedbackType, onGiveFeedback }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [correctedMessage, setCorrectedMessage] = useState("");

  // Open the modal and set the current message
  const openModal = () => {
    setCorrectedMessage(messageContent);
    setIsOpen(true);
    onGiveFeedback(messageIndex, 'negative');
  };

  // Close the modal
  const closeModal = () => {
    setIsOpen(false);
  };

  // Save the correction
  const handleSaveCorrection = () => {
    if (correctedMessage.trim() !== "") {
      onSaveCorrection(messageIndex, correctedMessage.trim());
      closeModal();
    }
  };

  return (
    <>
      {/* Thumbs Down Button */}
      <Tooltip content="Correct this response">
        <button 
          className={`p-1 rounded-full hover:bg-gray-200 ${feedbackType === 'negative' ? 'bg-red-100' : ''}`}
          onClick={openModal}
          aria-label="Correct response"
        >
          <ThumbsDown size={12} className={`${feedbackType === 'negative' ? 'text-red-500' : 'text-gray-500'}`} />
        </button>
      </Tooltip>

      {/* Correction Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={closeModal}
        size="lg"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-medium">Correct AI Response</h3>
            <p className="text-sm text-gray-500">Edit the response to provide a better answer</p>
          </ModalHeader>
          <ModalBody>
            <Textarea
              value={correctedMessage}
              onChange={(e) => setCorrectedMessage(e.target.value)}
              placeholder="Enter corrected response..."
              minRows={5}
              className="w-full"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={closeModal}
            >
              Cancel
            </Button>
            <Button
              className="bg-brand text-gray-900"
              onPress={handleSaveCorrection}
              startContent={<Check size={16} />}
            >
              Save Correction
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CorrectionModal;
