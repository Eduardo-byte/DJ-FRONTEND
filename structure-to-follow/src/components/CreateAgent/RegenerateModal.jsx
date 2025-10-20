import { useState } from "react";
import { webScraperService } from "../../api/services/webscraper.service";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Sparkles } from "lucide-react";

export default function RegenerateModal({ onRegenerate, websiteUrl, qualificationQuestions }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [instructions, setInstructions] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");

  const handleRegenerate = async () => {
    if (!instructions.trim()) return;

    setIsRegenerating(true);
    setError("");

    try {
      // Prepare data for the API call
      const data = {
        userInstructions: instructions,
        url: websiteUrl,
        qualificationQuestions: qualificationQuestions
      };

      //console.log("Regenerating questions with data:", data);

      // Call the API
      const result = await webScraperService.regenerateQualificationQuestions(data);

      // console.log("Regeneration result:", result);

      // console.log("Regeneration API response:", result);

      if (result && result.success === true && Array.isArray(result.questions)) {
        // Call the onRegenerate callback with the questions array
        onRegenerate(result.questions);
        setInstructions("");
        onClose();
      } else {
        setError("Failed to regenerate questions. Please try again.");
      }
    } catch (error) {
      console.error("Error regenerating questions:", error);
      setError("An error occurred while regenerating questions. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="bordered"
        className="text-brand border-brand"
        startContent={<Sparkles className="w-4 h-4" />}
        onPress={onOpen}
      >
        Regenerate
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Regenerate Questions
                </h3>
                <p className="text-sm text-gray-500">
                  Provide instructions on how you'd like to modify the questions
                </p>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  placeholder="Example: Make the questions more specific to crypto trading, focus on beginner users, add questions about security concerns..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={6}
                  className="w-full"
                />
              </ModalBody>
              <ModalFooter className="flex flex-col items-end gap-2">
                {error && (
                  <p className="text-danger text-sm w-full">{error}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-brand text-white"
                    onPress={handleRegenerate}
                    isDisabled={!instructions.trim() || isRegenerating}
                    isLoading={isRegenerating}
                    startContent={!isRegenerating && <Sparkles className="w-4 h-4" />}
                  >
                    {isRegenerating ? "Regenerating..." : "Regenerate"}
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
