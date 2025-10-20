import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";
import { X } from "lucide-react";

const ContentModal = ({
  isOpen,
  onClose,
  scrapingUrl,
  modalContent,
  handleAddToAiBrain,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h3>Add URL to AI Brain</h3>
          </div>
        </ModalHeader>
        <ModalBody>
          {scrapingUrl && !modalContent ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner color="primary" size="lg" className="mb-4" />
              <p>Scraping...</p>
              <p className="text-sm text-gray-500">{scrapingUrl}...</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-2">Page Content:</p>
              <div className="border border-gray-200 rounded-md p-3 max-h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">{modalContent}</pre>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="w-full flex justify-end items-center">
          {/* <Button 
            className="bg-gray-900 text-white"
            onPress={handleAddToAiBrain}
          >
            Add to AI Brain
          </Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ContentModal;
