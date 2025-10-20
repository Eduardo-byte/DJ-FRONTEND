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

export default function RegenerateQAModal({ onRegenerate, websiteUrl, qaItems }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [instructions, setInstructions] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");

  const handleRegenerate = async () => {
    if (!instructions.trim()) return;

    setIsRegenerating(true);
    setError("");

    try {
      // Format the QA items for the API
      const formattedQA = {
        potential_questions: qaItems.map(item => item.question),
        answers: qaItems.map(item => item.answer)
      };

      // Prepare data for the API call
      const data = {
        userInstructions: instructions,
        url: websiteUrl,
        questionsAndAnswers: formattedQA
      };

      //console.log("Regenerating Q&A with data:", data);

      // Call the API
      const result = await webScraperService.regenerateQA(data);

      //console.log("Regeneration result:", result);

      if (result && result.success === true &&
        Array.isArray(result.potential_questions) &&
        Array.isArray(result.answers)) {

        // Format the result back to the expected format
        const regeneratedQA = result.potential_questions.map((question, index) => ({
          question,
          answer: index < result.answers.length ? result.answers[index] : ""
        }));

        // Call the onRegenerate callback with the regenerated QA pairs
        onRegenerate(regeneratedQA);
        setInstructions("");
        onClose();
      } else {
        setError("Failed to regenerate Q&A pairs. Please try again.");
      }
    } catch (error) {
      console.error("Error regenerating Q&A pairs:", error);
      setError("An error occurred while regenerating Q&A pairs. Please try again.");
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
                  Regenerate Q&A Pairs
                </h3>
                <p className="text-sm text-gray-500">
                  Provide instructions on how you'd like to modify the questions and answers
                </p>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  placeholder="Example: Make the answers more technical, focus on enterprise use cases, add more details about security features..."
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
