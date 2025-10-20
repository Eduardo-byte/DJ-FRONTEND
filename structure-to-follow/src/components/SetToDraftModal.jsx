import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Power } from "lucide-react";

const SetToDraftModal = ({ isOpen, onClose, agent, onSetToDraft }) => {
  if (!agent) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gray-100">
                  <Power className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Set Agent to Draft
                </h3>
              </div>
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                Are you sure you want to set <span className="font-semibold">{agent.name}</span> to draft mode? 
                This will disable the agent and make it inactive.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Note:</span> Setting an agent to draft mode will:
                </p>
                <ul className="mt-2 text-sm text-amber-800 list-disc pl-5">
                  <li>Stop the agent from responding to new conversations</li>
                  <li>Disable all integrations (Facebook, Instagram, etc.)</li>
                  <li>Free up connected pages and accounts for use by other agents</li>
                </ul>
                <p className="mt-2 text-sm text-amber-800">
                  Existing conversations will remain accessible.
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button 
                className="bg-gray-700 text-white" 
                onPress={() => onSetToDraft(agent)}
              >
                Set to Draft
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SetToDraftModal;
