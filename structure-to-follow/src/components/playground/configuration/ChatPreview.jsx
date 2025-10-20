import { useState, useRef, useEffect, useContext } from "react";
import { chatService } from "../../../api/services/chat.service";
import { aiService } from "../../../api";
import { Card, CardBody, Input, Button, Tooltip, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Bot, Copy, Trash2, Sparkles, RefreshCw, CloudCog, FileText, ExternalLink } from "lucide-react";
import CorrectionModal from "./CorrectionModal";
import SaveResponseButton from "./SaveResponseButton";
import MessageContent from "../../Ask/MessageContent";
import CardsDisplay from "./CardsDisplay";
import { toast } from "sonner";
import { UserDataContext } from "../../../context/UserDataContext";

const ChatPreview = ({
  botName, // TODO: Rename to agentName in props
  avatarImage,
  introMessage,
  selectedAgent
}) => {
  const [messages, setMessages] = useState([{ role: "assistant", content: introMessage }]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);
  const { loggedInUser } = useContext(UserDataContext);

  // Sources modal state
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);

  // Get the agent ID from the URL
  const [chatId, setChatId] = useState();
  const [aiVersion, setAiVersion] = useState(null);
  const [selectedModelName, setSelectedModelName] = useState(null);

  useEffect(() => {
    // Extract agent ID from URL
    const pathname = window.location.pathname;
    const match = pathname.match(/\/playground\/([^\/]+)/);
    if (match && match[1]) {
      setChatId(match[1] || selectedAgent.id);
    }
  }, [selectedAgent]);

  // Fetch chat data and ai_version when chatId changes
  useEffect(() => {
    const fetchChatData = async () => {
      if (chatId) {
        try {
          const chatData = await chatService.fetchChatbyId(chatId);
          if (chatData && chatData.ai_version) {
            setAiVersion(chatData.ai_version);
            setSelectedModelName(chatData.model_names_v2)
          }
        } catch (error) {
          console.error('Error fetching chat data:', error);
        }
      }
    };

    fetchChatData();
  }, [chatId]);

  // Auto-scroll to bottom of chat container when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Update first message when introMessage changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === 'assistant') {
      const updatedMessages = [...messages];
      updatedMessages[0] = {
        ...updatedMessages[0],
        content: introMessage
      };

      setMessages(updatedMessages);
    }
  }, [introMessage]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping) return;

    // Store the current input before clearing it
    const currentInput = userInput;

    // Add user message to chat
    const userMessage = { role: 'user', content: currentInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Clear input and show typing indicator
    setUserInput("");
    setIsTyping(true);

    try {
      if (!chatId) {
        //console.log("ChatPreview page");
        console.error("No chat ID available. Using simulated response.");
        // Add delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add simulated response
        setMessages([...updatedMessages, {
          role: "assistant",
          content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration."
        }]);
        setIsTyping(false);
        return;
      }

      // Clean messages to only include role and content before formatting for API
      const cleanedMessages = messages.map(({ role, content }) => ({ role, content }));
      
      // Format chat history for the API (this includes the intro message)
      const chatHistory = chatService.formatChatHistory(cleanedMessages, userInput.trim());

      //console.log(`Sending message to API with chat ID: ${chatId}`);

      // Send message to API
      try {
        let response;
        if (aiVersion !== 'v2'){
          response = await aiService.sendMessage(chatId, currentInput, chatHistory);
        }else{
          // For v2, ensure we include the full conversation context including intro message
          // Add the current user message to the cleaned messages for v2 API
          const messagesForV2 = [...cleanedMessages, { role: 'user', content: currentInput }];
          response = await aiService.sendMessageV2(chatId, selectedModelName, messagesForV2);
        }

        // Handle the API response
        if (aiVersion !=="v2"){
          if (response && response.success && response.data && response.data.data) {
            const checkString = `${botName}:`
            const splitResponse = response.data.data.startsWith(checkString)
              ? response.data.data.split(`${botName}:`)[1].trim()
              : response.data.data;
            // Add the actual API response to the chat
            setMessages([...updatedMessages, {
              role: 'assistant',
              content: splitResponse
            }]);
          } else {
            // Show a simulated response if the API is not available or configured
            setMessages([...updatedMessages, {
              role: 'assistant',
              content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration..."
            }]);
          }
        }else{
          if (response && response.success && response.data && response.data.data.text) {
          const checkString = `${botName}:`
          const splitResponse = response.data.data.text.startsWith(checkString)
            ? response.data.data.text.split(`${botName}:`)[1].trim()
            : response.data.data.text;
          
          // Extract knowledge base sources
          const knowledgeBaseSources = response.data.data.data?.sources?.knowledgeBase?.sources || [];
          const CardSources = response.data.data.data?.sources?.cards?.hasCards ? response.data.data.data?.sources?.cards.sources : null;
          const processedSources = knowledgeBaseSources.map(source => {
            return source.references.map(ref => {
              const fileName = ref.file.name;
              // Add http:// prefix if it's a domain without file extension
              const isUrl = fileName.includes('.com/') || fileName.includes('.org/') || fileName.includes('.net/');
              const hasFileExtension = /\.(pdf|txt|doc|docx|html)$/i.test(fileName);
              
              return {
                name: fileName,
                url: isUrl && !hasFileExtension ? `http://${fileName}` : fileName,
                signedUrl: ref.file.signedUrl,
                status: ref.file.status
              };
            });
          }).flat();
          
          // Add the actual API response to the chat
          setMessages([...updatedMessages, {
            role: 'assistant',
            content: splitResponse,
            sources: processedSources.length > 0 ? processedSources : null,
            cards: CardSources
          }]);
        } else {
          // Show a simulated response if the API is not available or configured
          setMessages([...updatedMessages, {
            role: 'assistant',
            content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration..."
          }]);
        }
        }
      } catch (error) {
        console.error("Error in chat:", error);
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration..."
        }]);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      // Fallback to simulated response
      setMessages([...updatedMessages, {
        role: "assistant",
        content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration."
      }]);
    } finally {
      // Always turn off typing indicator when done
      setIsTyping(false);
    }
  };

  // Handle saving a corrected message
  const handleSaveCorrection = (messageIndex, correctedContent) => {
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: correctedContent
    };
    setMessages(updatedMessages);
  };

  // Handle giving feedback
  const handleGiveFeedback = (messageIndex, type) => {
    setFeedbackGiven(prev => {
      const newFeedback = { ...prev };
      // If the same type is already selected, toggle it off
      if (newFeedback[messageIndex] === type) {
        delete newFeedback[messageIndex];
      } else {
        // Otherwise, set the new type
        newFeedback[messageIndex] = type;
      }
      return newFeedback;
    });
  };

  // Handle saving conversation
  const saveConversation = () => {
    // In a real app, this would save the conversation to the backend
    alert("Conversation saved for future reference!");
  };

  //Clear conversation when user changes agent
  useEffect(() => {
    clearConversation();
  }, [selectedAgent]);

  // Handle clearing conversation
  const clearConversation = () => {
    setMessages([{ role: "assistant", content: introMessage || "Hello! How can I help you today?" }]);
  };

   // Migrate to v2
  const handleMigrateToAIv2 = async () => {
    const migrateToV2 = await chatService.updateAgent(chatId, {
      ai_version: "v2"
    })

    if (migrateToV2.ai_version === "v2"){
      toast.success("You've now migrated to the V2 of Agents. Please test the new version below.")
      setAiVersion("v2")
      return {
        success: true
      }
    }
  }

  return (
    <Card className="border border-gray-100 bg-white h-full" shadow="none">
      <CardBody className="p-0 h-full">
        <div className="flex flex-col h-full">
          {/* Chat header */}
          
          {/* Migration Porcess */}
          {
            aiVersion && aiVersion === "v1" && loggedInUser.role === "God Mode" &&
            <div className="w-full flex justify-end items-center">
              <Button onPress={handleMigrateToAIv2} size="sm">Migrate V2</Button>
            </div>
          }

          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Bot className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Test your Agent</h3>
                <p className="text-xs text-gray-500">
                  See how your Agent responds in real-time
                  {/* {chatId && <span className="ml-1 text-xs text-gray-400">(ID: {chatId.substring(0, 8)}...)</span>} */}
                  {/* {aiVersion && <span className="ml-1 text-xs text-blue-600">(AI {aiVersion})</span>} */}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="New Conversation">
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  onPress={clearConversation}
                >
                  <RefreshCw size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "500px", minHeight: "500px" }}>
            {messages.map((message, index) => (
              <div key={index} className="w-full">
                <div
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                      ? 'bg-brand text-gray-900'
                      : 'bg-gray-50 text-gray-800'
                      }`}
                  >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {avatarImage ? (
                          <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Bot className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      <span className="text-xs font-medium">{botName}</span>
                      <Chip size="sm" variant="flat" color="primary" className="ml-1">AI</Chip>
                    </div>
                  )}
                  <div className="text-sm [&_*]:text-sm [&_p]:text-sm [&_li]:text-sm [&_span]:text-sm [&_div]:text-sm">
                    <MessageContent content={message.content} role={message.role} />
                  </div>

                 
                  {/* Sources indicator - Show for assistant messages with sources */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 p-3 bg-brand/10 rounded-lg border border-brand/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand" />
                          <span className="text-sm font-medium text-gray-800">
                            Sources Used
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="flat"
                          className="bg-brand text-gray-800 hover:bg-brand/90"
                          startContent={<FileText size={12} />}
                          onPress={() => {
                            setSelectedSources(message.sources);
                            setIsSourcesModalOpen(true);
                          }}
                        >
                          {message.sources.length} Source{message.sources.length > 1 ? 's' : ''}
                        </Button>
                      </div>
                    </div>
                  )}

                 

                  {/* Message actions - Only show for assistant messages that are not the first message */}
                  {message.role === 'assistant' && index > 0 && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <Tooltip content="Copy response">
                        <button
                          className="p-1 rounded-full hover:bg-gray-200"
                          onClick={() => navigator.clipboard.writeText(message.content)}
                        >
                          <Copy size={12} className="text-gray-500" />
                        </button>
                      </Tooltip>

                      {/* Feedback buttons */}
                      <div className="flex items-center gap-1">
                        <SaveResponseButton
                          messageIndex={index}
                          feedbackType={feedbackGiven[index]}
                          onGiveFeedback={handleGiveFeedback}
                        />
                        <CorrectionModal
                          messageIndex={index}
                          messageContent={message.content}
                          onSaveCorrection={handleSaveCorrection}
                          feedbackType={feedbackGiven[index]}
                          onGiveFeedback={handleGiveFeedback}
                        />
                      </div>
                    </div>
                  )}

                </div>
                </div>

                {/* Cards Display - Show for assistant messages with cards below the message */}
                {message.role === 'assistant' && message.cards && (
                  <div className="w-full">
                    <CardsDisplay cards={message.cards} />
                  </div>
                )}
              </div>
            ))}

            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {avatarImage ? (
                        <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Bot className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                    <span className="text-xs font-medium">{botName}</span>
                  </div>
                  <div className="flex space-x-1 mt-3">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible element for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <Input
                fullWidth
                placeholder="Type a message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                disabled={isTyping}
                classNames={{
                  inputWrapper: "border-gray-200",
                  input: "text-sm",
                }}
                startContent={<Sparkles size={16} className="text-gray-400" />}
              />
              <Button
                className="bg-brand text-gray-900"
                onPress={handleSendMessage}
                size="sm"
                isLoading={isTyping}
                isDisabled={isTyping}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </CardBody>

      {/* Sources Modal */}
      <Modal 
        isOpen={isSourcesModalOpen} 
        onOpenChange={setIsSourcesModalOpen}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1  border-b ">
                <h3 className="text-lg font-semibold text-gray-900">Knowledge Base Sources</h3>
                <p className="text-sm text-gray-600">
                  {selectedSources.length} source{selectedSources.length > 1 ? 's' : ''} used for this response
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3">
                  {selectedSources.map((source, index) => {
                    const isUrl = source.url.startsWith('http://') || source.url.startsWith('https://');
                    const displayName = source.name.length > 60 ? `${source.name.substring(0, 60)}...` : source.name;
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-brand/5 rounded-lg border border-brand/20 hover:bg-brand/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileText className="w-5 h-5 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-600">
                              Status: {source.status}
                            </p>
                          </div>
                        </div>
                        {isUrl && (
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-brand text-white hover:bg-brand/90"
                            isIconOnly
                            onPress={() => window.open(source.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ModalBody>
              <ModalFooter className=" border-t ">
                <Button 
                  className="bg-brand text-gray-800 hover:bg-brand/90" 
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default ChatPreview;
