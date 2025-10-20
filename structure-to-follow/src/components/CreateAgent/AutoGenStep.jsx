import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../../context/UserDataContext";
import {
  Button,
  Input,
  Avatar,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { ArrowLeft, Send, Bot, RefreshCw } from "lucide-react";

export default function AutoGenStep({ wizardData, updateWizardData, onBack }) {
  const navigate = useNavigate();
  const { loggedInUser, userData } = useContext(UserDataContext);
  //console.log("User: ", loggedInUser);

  // Initialize with default values
  const [userName, setUserName] = useState("there");
  const [websiteUrl, setWebsiteUrl] = useState("olivianetwork.ai");

  // Initialize messages with a placeholder that will be updated
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: `Hi there! I'm here to help you build your AI agent. I see you're interested in creating an agent for olivianetwork.ai. Is this the correct website, or would you like to use a different one?`,
      timestamp: new Date(),
    }
  ]);

  // Update user name and website when loggedInUser data becomes available
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      const newName = userData.first_name || "there";
      const newWebsite = wizardData.manualData?.websiteUrl ||
        (userData.website ? userData.website.replace(/^https?:\/\//, "").replace(/\/$/, "") : "olivianetwork.ai");

      setUserName(newName);
      setWebsiteUrl(newWebsite);

      // Update the first message with the user's name and website
      setMessages(prevMessages => [
        {
          ...prevMessages[0],
          content: `Hi ${newName}! I'm here to help you build your AI agent. I see you're interested in creating an agent for ${newWebsite}. Is this the correct website, or would you like to use a different one?`
        },
        ...prevMessages.slice(1)
      ]);
    }
  }, [loggedInUser, wizardData.manualData]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        role: "assistant",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };

      setMessages(prevMessages => [...prevMessages, aiResponse]);

      // Update wizard data with the conversation
      updateWizardData({
        autoData: {
          conversation: [...messages, userMessage, aiResponse],
          agentName: extractAgentName([...messages, userMessage, aiResponse]),
        }
      });
    }, 1000);
  };

  // Simple response generation based on user input
  const generateAIResponse = (userInput) => {
    const userInputLower = userInput.toLowerCase();

    if (userInputLower.includes("yes") && (userInputLower.includes("correct") || userInputLower.includes("right"))) {
      return `Great! I'll help you create an AI agent for ${websiteUrl}. What type of agent would you like to create? For example, a customer support agent, lead generation agent, or appointment booking agent?`;
    } else if (userInputLower.includes("no") || userInputLower.includes("different")) {
      return "I understand. What website would you like to create an AI agent for?";
    } else if (userInputLower.includes("website") && (userInputLower.includes("is") || userInputLower.includes("would be"))) {
      // Extract website URL from user input
      const websiteMatch = userInput.match(/\b(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)\b/);
      const newWebsite = websiteMatch ? websiteMatch[0] : userInput.replace(/.*website is |.*website would be /, "").trim();

      // Update wizard data with new website
      updateWizardData({
        autoData: {
          ...wizardData.autoData,
          websiteUrl: newWebsite
        }
      });

      return `Thanks! I'll help you create an AI agent for ${newWebsite}. What type of agent would you like to create? For example, a customer support agent, lead generation agent, or appointment booking agent?`;
    } else if (userInputLower.includes("customer support") || userInputLower.includes("support")) {
      return "Great! I'll help you create a customer support agent. What specific features would you like this agent to have? For example, should it handle product inquiries, technical support, or order status updates?";
    } else if (userInputLower.includes("lead") || userInputLower.includes("sales")) {
      return "A lead generation agent is a great choice! What industry will this agent be working in? And what kind of leads are you looking to generate?";
    } else if (userInputLower.includes("appointment") || userInputLower.includes("booking") || userInputLower.includes("schedule")) {
      return "An appointment booking agent will be very useful! What type of appointments will this agent be handling? And do you have a specific calendar system you'd like to integrate with?";
    } else if (userInputLower.includes("name")) {
      return "I'll name your agent based on its purpose. What would you like your agent to be called?";
    } else if (userInputLower.includes("thank")) {
      return "You're welcome! I'm creating your agent now. You'll be able to customize it further in the playground after it's created.";
    } else {
      return "I understand. Can you tell me more about what you'd like this agent to do? The more details you provide, the better I can tailor it to your needs.";
    }
  };

  // Extract a potential agent name from the conversation
  const extractAgentName = (conversation) => {
    // This is a simplified implementation
    // In a real app, you would use NLP to extract the agent name
    const nameMessages = conversation.filter(msg =>
      msg.role === "user" &&
      msg.content.toLowerCase().includes("name")
    );

    if (nameMessages.length > 0) {
      return "Custom Agent"; // Placeholder
    }

    return "New AI Agent";
  };

  // Reset chat confirmation modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Handle resetting the chat
  const handleResetChat = () => {
    // Reset to initial message
    setMessages([
      {
        id: 1,
        role: "assistant",
        content: `Hi ${userName}! I'm here to help you build your AI agent. I see you're interested in creating an agent for ${websiteUrl}. Is this the correct website, or would you like to use a different one?`,
        timestamp: new Date(),
      }
    ]);

    // Reset wizard data
    updateWizardData({
      autoData: {
        conversation: [],
        agentName: "New AI Agent",
      }
    });

    onClose();
  };

  // Handle creating the agent and navigating to playground
  const handleCreateAgent = () => {
    //console.log("Creating agent with data:", wizardData.autoData);
    navigate("/playground");
  };

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Header with back button and reset button */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            onPress={onBack}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-xl font-semibold">Create Agent with Olivia</h3>
        </div>

        <Button
          variant="light"
          onPress={onOpen}
          size="sm"
          className="text-gray-500 mr-5"
          startContent={<RefreshCw className="w-4 h-4" />}
        >
          Reset
        </Button>
      </div>

      {/* Messages container */}
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col mb-4 ${message.role === "user" ? "items-end" : "items-start"
              }`}
          >
            {message.role === "assistant" && (
              <div className="flex justify-start items-center gap-1 mb-1 ml-2">
                <span className="text-xs text-gray-500">Olivia</span>
              </div>
            )}
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}>
              <div
                className={`px-4 py-3 rounded-2xl w-fit max-w-[80%] ${message.role === "user"
                  ? "bg-gradient-to-r from-brand to-brand-secondary "
                  : "bg-gray-100 text-gray-800"
                  }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div>
        <div className="relative">
          <Input
            fullWidth
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="rounded-full pr-12"
          />
          <Button
            isIconOnly
            color="primary"
            variant="flat"
            onPress={handleSendMessage}
            isDisabled={!inputValue.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand text-white rounded-full w-10 h-10"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send your message
        </p>
      </div>

      {/* Reset Chat Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reset Chat
                </h3>
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to reset the chat? This will clear all your conversation history.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button fullWidth color="danger" onPress={handleResetChat}>
                  Reset
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
