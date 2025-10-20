import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { Play } from "lucide-react";
import '../styles/payment-modal.css';

export default function PaymentModal({ isOpen, onClose, onGoToCheckout, onBookDemo }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      backdrop="blur"
      isDismissable={false}
      hideCloseButton={true}
      className="payment-modal-override"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900/60 to-zinc-900/10 backdrop-opacity-10 payment-modal-backdrop",
        wrapper: "payment-modal-override",
        base: "payment-modal-content"
      }}
      style={{ zIndex: 2147483647 }}
      portalContainer={document.body}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col w-full gap-1 text-center">

          {/* Canva What Happens Next Video */}
          <div className="w-full mb-6 rounded-2xl overflow-hidden relative aspect-video">
            <iframe
              src="https://www.canva.com/design/DAGvUKX6BxI/nVUonP6sFd3QYXMgu4Z1eg/watch?embed"
              allowFullScreen
              className="w-full h-full"
              title="What happens next - Olivia AI Network"
            />
          </div>
          
          
        </ModalHeader>
        <ModalBody className="text-center px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get Full Access to <span className="text-brand">Olivia AI Network</span>
          </h2>
          <p className="text-gray-600 mb-2">
            Enjoy a 14-day free trial with full access! To get started, we just need your
            billing information for verification purposes. Don't worry,{" "}
            <span className="font-semibold text-gray-900">
              you won't be charged during the trial period.
            </span>
          </p>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-3 px-6 pb-6">
          <Button
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            onPress={onGoToCheckout}
            size="lg"
          >
            Activate Your Agent
          </Button>
          <Button
            variant="light"
            className="text-gray-600 hover:text-gray-800 underline text-sm"
            onPress={onBookDemo}
          >
            Book a demo →
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
