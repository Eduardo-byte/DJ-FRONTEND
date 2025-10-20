import { useState, useRef, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { chatService } from "../api/services/chat.service";
import { aiService } from "../api";
import { Card, CardBody, Input, Button, Tooltip, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea, Divider } from "@heroui/react";
import { Bot, Copy, Trash2, Sparkles, RefreshCw, CloudCog, FileText, ExternalLink, ThumbsUp, ThumbsDown, MessageSquare, X, PanelRightOpen, PanelRightClose, Mail, Lock, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import MessageContent from "../components/Ask/MessageContent";
import { toast } from "sonner";
// import { UserDataContext } from "../context/UserDataContext"; // Not available outside AuthProvider
import { supabase } from "../lib/supabase";
import { getAuthError } from "../utils/errorMessages";

const ChatLanding = () => {
  const { agentId } = useParams();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);
  // const { loggedInUser } = useContext(UserDataContext); // Not available outside AuthProvider

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Agent data
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sources modal state
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);

  // Chat configuration
  const [aiVersion, setAiVersion] = useState(null);
  const [selectedModelName, setSelectedModelName] = useState(null);

  // Feedback sidebar state
  const [isFeedbackSidebarOpen, setIsFeedbackSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState({});
  const [feedbackNotes, setFeedbackNotes] = useState({});
  const [overallNote, setOverallNote] = useState("");
  const [selectedMessageForFeedback, setSelectedMessageForFeedback] = useState(null);
  
  // Expandable sections state
  const [isOverallSectionExpanded, setIsOverallSectionExpanded] = useState(true);
  const [expandedMessageCard, setExpandedMessageCard] = useState(null);

  // Fetch agent data when component mounts
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!agentId) {
        setError("No agent ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const chatData = await chatService.fetchChatbyId(agentId);
        
        if (chatData) {
          setAgentData(chatData);
          setAiVersion(chatData.ai_version || "v2");
          setSelectedModelName(chatData.model_names_v2);
          
          // Set initial message
          const introMessage = chatData.intro_message || "Hello! How can I help you today?";
          setMessages([{ role: "assistant", content: introMessage }]);
        } else {
          setError("Agent not found");
        }
      } catch (err) {
        console.error('Error fetching agent data:', err);
        setError("Failed to load agent");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [agentId]);

  // Auto-scroll to bottom of chat container when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Mobile detection and sidebar management
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(isMobileDevice);
      // Always open on desktop, closed by default on mobile
      setIsFeedbackSidebarOpen(!isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for existing authentication (standalone - no redirects)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes but don't trigger redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN') {
        toast.success("Welcome! Loading your chat...");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim() || isTyping || !agentData) return;

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
      // Clean messages to only include role and content before formatting for API
      const cleanedMessages = messages.map(({ role, content }) => ({ role, content }));
      
      // Send message to API using v2 (as specified in requirements)
      try {
        // For v2, ensure we include the full conversation context including intro message
        // Add the current user message to the cleaned messages for v2 API
        const messagesForV2 = [...cleanedMessages, { role: 'user', content: currentInput }];
        const response = await aiService.sendMessageV2(agentId, selectedModelName, messagesForV2);

        // Handle the API response for v2
        if (response && response.success && response.data && response.data.data.text) {
          const botName = agentData.name || "Assistant";
          const checkString = `${botName}:`;
          const splitResponse = response.data.data.text.startsWith(checkString)
            ? response.data.data.text.split(`${botName}:`)[1].trim()
            : response.data.data.text;
          
          // Extract knowledge base sources
          const knowledgeBaseSources = response.data.data.data?.sources?.knowledgeBase?.sources || [];
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
            sources: processedSources.length > 0 ? processedSources : null
          }]);
        } else {
          // Show a fallback response if the API response is not as expected
          setMessages([...updatedMessages, {
            role: 'assistant',
            content: "I'm sorry, I'm having trouble processing your request right now. Please try again."
          }]);
        }
      } catch (error) {
        console.error("Error in chat:", error);
        setMessages([...updatedMessages, {
          role: 'assistant',
          content: "I'm sorry, I'm experiencing technical difficulties. Please try again later."
        }]);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      // Fallback response
      setMessages([...updatedMessages, {
        role: "assistant",
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later."
      }]);
    } finally {
      // Always turn off typing indicator when done
      setIsTyping(false);
    }
  };

  // Handle clearing conversation
  const clearConversation = () => {
    const introMessage = agentData?.intro_message || "Hello! How can I help you today?";
    setMessages([{ role: "assistant", content: introMessage }]);
    // Keep feedback data persistent across conversation resets
    // setMessageFeedback({}); // Removed - keep feedback
    // setFeedbackNotes({}); // Removed - keep notes  
    // setOverallNote(""); // Removed - keep overall note
    // setSelectedMessageForFeedback(null); // Removed - keep selection
  };

  // Handle feedback (thumbs up/down)
  const handleFeedback = (messageIndex, feedbackType) => {
    setMessageFeedback(prev => {
      const newFeedback = { ...prev };
      // If the same type is already selected, toggle it off
      if (newFeedback[messageIndex] === feedbackType) {
        delete newFeedback[messageIndex];
      } else {
        // Otherwise, set the new type
        newFeedback[messageIndex] = feedbackType;
      }
      return newFeedback;
    });

    // If thumbs down, auto-open sidebar on mobile and select this message
    if (feedbackType === 'down') {
      if (isMobile) {
        setIsFeedbackSidebarOpen(true);
      }
      setSelectedMessageForFeedback(messageIndex);
      // Auto-expand this message card and collapse others
      setExpandedMessageCard(messageIndex);
      setIsOverallSectionExpanded(false);
    }
  };

  // Handle saving feedback note for a specific message
  const handleSaveFeedbackNote = (messageIndex, note) => {
    setFeedbackNotes(prev => ({
      ...prev,
      [messageIndex]: note
    }));
    toast.success("Feedback note saved");
  };

  // Handle saving overall note
  const handleSaveOverallNote = () => {
    // Add overall note to feedback notes with a special key
    if (overallNote.trim()) {
      setFeedbackNotes(prev => ({
        ...prev,
        'overall': overallNote.trim()
      }));
      toast.success("Overall note saved");
    }
  };

  // Get feedback messages for sidebar
  const getFeedbackMessages = () => {
    return messages
      .map((message, index) => ({ ...message, index }))
      .filter((message, index) => 
        message.role === 'assistant' && 
        index > 0 && 
        messageFeedback[index]
      );
  };

  // Handle login form submission (standalone - no redirects)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Success is handled by the auth state change listener
    } catch (error) {
      toast.error(getAuthError(error));
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle social login (standalone - stays on current page)
  const handleSocialLogin = async (provider) => {
    try {
      toast.success(`Connecting with ${provider}...`);
      
      // Get current URL to redirect back to this exact page
      const redirectUrl = window.location.href;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.toLowerCase(),
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error(`Failed to connect with ${provider}. Please try again.`);
      console.error(`${provider} login error:`, error);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-gray-900 px-4 py-6">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <img
              className="w-[80px] mx-auto mb-4"
              src="/Olivia-ai-LOGO.png"
              alt="Olivia AI Network"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome to <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">Olivia AI Network</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              Sign in to chat with our AI agent
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {/* Google */}
            <Button
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 font-medium hover:bg-gray-700 transition-all duration-200 min-h-[48px] justify-start"
              startContent={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
              onPress={() => handleSocialLogin("Google")}
            >
              Continue with Google
            </Button>

            {/* Facebook */}
            <Button
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 font-medium hover:bg-gray-700 transition-all duration-200 min-h-[48px] justify-start"
              startContent={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              }
              onPress={() => handleSocialLogin("Facebook")}
            >
              Continue with Facebook
            </Button>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-600"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-600"></div>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-8">
            <Input
              type="email"
              label="Email"
              labelPlacement="outside"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              endContent={<Mail className="w-4 h-4 text-gray-400" />}
              isDisabled={isLoginLoading}
              autoComplete="email"
              classNames={{
                input: "transition-all duration-250 text-white",
                inputWrapper: "transition-all duration-250 bg-gray-800 border border-gray-700 text-white shadow-none py-6",
                label: "text-gray-300"
              }}
              required
            />
            <Input
              type="password"
              label="Password"
              labelPlacement="outside"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endContent={<Lock className="w-4 h-4 text-gray-400" />}
              isDisabled={isLoginLoading}
              autoComplete="current-password"
              classNames={{
                input: "transition-all duration-250 text-white",
                inputWrapper: "transition-all duration-250 bg-gray-800 border border-gray-700 text-white shadow-none py-6",
                label: "text-gray-300"
              }}
              required
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-400 hover:text-brand transition-all duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
              endContent={<ArrowRight className="w-4 h-4" />}
              isLoading={isLoginLoading}
              size="lg"
            >
              Sign in to Chat
            </Button>
          </form>

          <div className="text-center mt-8">
            <span className="text-sm text-gray-400">
              Don't have an account?{" "}
            </span>
            <Link
              to="/register"
              className="text-sm text-brand font-semibold hover:opacity-80 transition-all duration-200"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-gray-300">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isMobile 
          ? (isFeedbackSidebarOpen ? 'mr-96' : '')
          : 'mr-96' // Always make room for sidebar on desktop
      }`}>
        {/* Announcement Header */}
        <div className="border-b border-gray-900">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Chip 
                  variant="flat" 
                  color="success" 
                  size="lg"
                  className="bg-green-900 text-green-300 font-semibold"
                >
                  GOOD NEWS
                </Chip>
                <h1 className="text-5xl font-bold text-white">
                  {agentData?.name || "{CompanyName}"} Your Olivia AI Agent is Ready to Test
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Test your agent here and provide feedback directly - we'll use your input to continuously improve your agent's performance and responses.
              </p>
              {isMobile && (
                <div className="mt-4">
                  <Button
                    variant="light"
                    size="sm"
                    startContent={isFeedbackSidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                    onPress={() => setIsFeedbackSidebarOpen(!isFeedbackSidebarOpen)}
                  >
                    {isFeedbackSidebarOpen ? 'Close' : 'Feedback'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border border-gray-700 bg-gray-800" shadow="sm">
          <CardBody className="p-0">
            <div className="flex flex-col" style={{ height: "600px" }}>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand/20">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Chat with {agentData?.name}</h3>
                    <p className="text-xs text-gray-400">
                      AI-powered assistant ready to help
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                    ? 'bg-brand text-gray-900'
                    : 'bg-gray-700 text-gray-100'
                    }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                            {agentData?.avatar_image ? (
                              <img src={agentData.avatar_image} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <Bot className="w-3 h-3 text-gray-300" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-200">{agentData?.name || "Assistant"}</span>
                          <Chip size="sm" variant="flat" color="primary" className="ml-1">AI</Chip>
                        </div>
                      )}
                      <div className="text-sm [&_*]:text-sm [&_p]:text-sm [&_li]:text-sm [&_span]:text-sm [&_div]:text-sm">
                        <MessageContent content={message.content} role={message.role} />
                      </div>

                      {/* Sources indicator - Show for assistant messages with sources */}
                      {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 p-3 bg-brand/20 rounded-lg border border-brand/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-brand" />
                              <span className="text-sm font-medium text-gray-200">
                                Sources Used
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              className="bg-brand text-gray-900 hover:bg-brand/90"
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
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {/* Feedback buttons */}
                            <Tooltip content="Good response">
                              <button
                                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${
                                  messageFeedback[index] === 'up' ? 'bg-green-100 text-green-600' : 'text-gray-500'
                                }`}
                                onClick={() => handleFeedback(index, 'up')}
                              >
                                <ThumbsUp size={12} />
                              </button>
                            </Tooltip>
                            <Tooltip content="Poor response">
                              <button
                                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${
                                  messageFeedback[index] === 'down' ? 'bg-red-100 text-red-600' : 'text-gray-500'
                                }`}
                                onClick={() => handleFeedback(index, 'down')}
                              >
                                <ThumbsDown size={12} />
                              </button>
                            </Tooltip>
                            {messageFeedback[index] && (
                              <Tooltip content="Add feedback note">
                                <button
                                  className="p-1 rounded-full hover:bg-gray-200 text-blue-600"
                                  onClick={() => {
                                    setSelectedMessageForFeedback(index);
                                    if (isMobile) {
                                      setIsFeedbackSidebarOpen(true);
                                    }
                                    // Auto-expand this message card and collapse others
                                    setExpandedMessageCard(index);
                                    setIsOverallSectionExpanded(false);
                                  }}
                                >
                                  <MessageSquare size={12} />
                                </button>
                              </Tooltip>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Tooltip content="Copy response">
                              <button
                                className="p-1 rounded-full hover:bg-gray-200"
                                onClick={() => navigator.clipboard.writeText(message.content)}
                              >
                                <Copy size={12} className="text-gray-500" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                          {agentData?.avatar_image ? (
                            <img src={agentData.avatar_image} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Bot className="w-3 h-3 text-gray-300" />
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-200">{agentData?.name || "Assistant"}</span>
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
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Input
                    fullWidth
                    placeholder="Type a message..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                    disabled={isTyping}
                    classNames={{
                      inputWrapper: "border-gray-600 bg-gray-700",
                      input: "text-sm text-white",
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
        </Card>
        </div>

        {/* Testing Information Section */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Live Testing Your AI Agent</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              This page is your test environment. In the bottom right corner, you'll see your Olivia AI widget live and ready. 
              Use this space to put your agent through its paces before we launch.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What To Test Column */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">What To Test</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Ask the most common customer questions you receive</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Try edge cases, unusual wording, typos, or "tricky" questions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Test links, buttons, and call-to-actions (do they work and feel natural?)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Review tone: does the language match your brand voice?</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Check escalation: how does it handle a query it can't answer?</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Note any gaps in knowledge or missing FAQs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand text-lg">•</span>
                  <span>Try booking flows or form completions if they're enabled</span>
                </li>
              </ul>
            </div>

            {/* What To Look For Column */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              {/* Header with chip */}
              <div className="flex justify-center mb-6">
                <Chip 
                  variant="flat" 
                  color="success" 
                  size="sm"
                  className="bg-green-900 text-green-300 font-semibold"
                >
                  Helping Businesses
                </Chip>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white text-center mb-8">What To Look For</h3>

              {/* Stats Section */}
              <div className="text-center space-y-6 mb-8">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">10+</div>
                  <div className="text-sm text-gray-300 font-medium tracking-wide">
                    KEY TESTING<br />
                    SCENARIOS TO TRY<br />
                    BEFORE LAUNCH
                  </div>
                </div>

                <div>
                  <div className="text-4xl font-bold text-white mb-2">5-10 MINS</div>
                  <div className="text-sm text-gray-300 font-medium tracking-wide">
                    AVERAGE TIME IT TAKES<br />
                    TO RUN A FULL TEST<br />
                    FLOW
                  </div>
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div>
                <ul className="space-y-3 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-brand text-sm">•</span>
                    <span>Natural, human-like conversation flow</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand text-sm">•</span>
                    <span>Accurate answers with no "hallucinations"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand text-sm">•</span>
                    <span>Consistency across different ways of asking the same question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand text-sm">•</span>
                    <span>Clear handover to staff when needed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand text-sm">•</span>
                    <span>No broken links, missing responses, or formatting issues</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence & Testing Tips Section */}
        <div className="bg-gray-900 py-16 relative overflow-hidden">
          {/* Decorative green circles */}

          
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Confidence Card - SVG Background with Grid Layout */}
              <div className="relative w-full col-span-2">
                {/* SVG Background - Desktop Only */}
                <div className="absolute inset-0 hidden xl:block" style={{ aspectRatio: '492/375' }}>
                  <svg width="100%" height="100%" viewBox="0 0 492 375" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <path d="M456 7C475.882 7 492 23.1178 492 43V252.9C492 271.378 477.243 286.473 458.771 286.892L454 287H442C421.013 287 404 304.013 404 325V346.774C401.265 362.587 387.605 374.685 371.02 374.938L367 375H58C38.1178 375 22 358.882 22 339V62.0205C24.5616 62.6584 27.2409 63 30 63C48.2254 63 63 48.2254 63 30C63 21.0555 59.4398 12.9437 53.6611 7H456Z" fill="#F9F9F9"/>
                    <circle cx="30" cy="30" r="30" fill="#59FB89"/>
                    <circle cx="458" cy="345" r="30" fill="#59FB89"/>
                  </svg>
                </div>
                
                {/* Simple Background - Tablet and Mobile */}
                <div className="xl:hidden bg-gray-100 rounded-3xl p-8 relative min-h-[400px]">
                  {/* Green accent circles */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-400 rounded-full"></div>
                  <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-green-400 rounded-full"></div>
                </div>

                {/* Content Grid - Main 2 columns */}
                <div className="relative z-10 grid grid-cols-3 h-full p-8">
                  
                  {/* Left Column - Text Content */}
                  <div className="col-span-2 pr-4 flex flex-col justify-start">
                    <h3 className="font-bold pl-8 pt-20 text-2xl text-gray-900 ">
                      From first test to lasting confidence.
                    </h3>
                    <p className="text-gray-700 pl-8 text-base leading-relaxed mb-4">
                      Imagine transforming the way your AI agent supports your customers. With a few simple checks, you'll ensure it's ready to perform at its best — faster, smarter, and without limits.
                    </p>
                    
                    <div className="space-y-2">
                      <p className="text-gray-800 pl-8 font-medium text-xs">
                        Olivia AI empowers you to test by:
                      </p>
                      <ul className="space-y-1 text-gray-700 text-xs pl-8">
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Asking the top 10 questions your customers ask most often</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Trying "tricky" questions with typos or unusual phrasing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Checking how the bot handles questions it can't answer</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Making sure tone and responses feel on-brand</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Testing all links, buttons, and CTAs work correctly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Confirming integrations data flows into your CRM or systems</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Reviewing escalation paths to your team</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Booking flows or forms (if enabled) to confirm they complete</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          <span>Looking for consistency when the same question is asked different ways</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column - 2 Grid Stats */}
                  <div className="pl-4 flex flex-col justify-start items-center text-center pt-4">
                    
                    {/* Top Stats Box */}
                    <div className="flex flex-col justify-start items-center text-center mb-8">
                      <div className="text-4xl font-bold text-gray-900 mb-2">1.2M+</div>
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide leading-tight">
                        CONVERSATIONS<br/>
                        STRESS-TESTED<br/>
                        WITH REAL USERS
                      </div>
                    </div>
                    
                    {/* Bottom Stats Box */}
                    <div className="flex flex-col justify-start items-center text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-2">597 +</div>
                      <div className="text-xs text-gray-600 font-medium uppercase tracking-wide leading-tight">
                        CLIENT AGENTS<br/>
                        REFINED THROUGH<br/>
                        TESTING
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Eduardo's Testing Tips Card */}
              <div className="bg-gray-100 rounded-3xl p-8 relative">
                {/* Green accent circle */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-400 rounded-full"></div>
                
                <div className="space-y-6">
                  {/* Eduardo's photo placeholder and chip */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 bg-gray-800 rounded-full mb-4 flex items-center justify-center">
                      <div className="w-24 h-24 bg-gray-700 rounded-full"></div>
                    </div>
                    <Chip 
                      variant="flat" 
                      color="success" 
                      size="sm"
                      className="bg-green-400 text-gray-900 font-semibold"
                    >
                      Eduardo's Testing Tips
                    </Chip>
                  </div>

                  {/* Testing advice */}
                  <div className="space-y-4">
                    <p className="text-gray-800 font-medium text-sm">
                      Adopting AI isn't just about keeping up — it's about making sure it's ready for real customers. Try these when testing your agent:
                    </p>
                    
                    <div className="space-y-3 text-gray-700 text-sm">
                      <p className="leading-relaxed">
                        <strong>Act like an angry customer</strong> — does it stay calm and escalate?
                      </p>
                      <p className="leading-relaxed">
                        <strong>Add typos or slang</strong> — does it still understand?
                      </p>
                      <p className="leading-relaxed">
                        <strong>Ask outside-scope questions</strong> — does it reply gracefully?
                      </p>
                      <p className="leading-relaxed">
                        <strong>Test links and booking flows</strong> — do they work end to end?
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Bottom green circle */}
                <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Sidebar */}
      <div className={`${
        isMobile 
          ? `fixed top-0 right-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-lg transform transition-transform duration-300 z-50 ${
              isFeedbackSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`
          : `fixed top-0 right-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-lg z-40 ${
              isFeedbackSidebarOpen ? 'block' : 'hidden'
            }`
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-900">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-300" />
              <h3 className="text-lg font-semibold text-white">Feedback</h3>
            </div>
            {isMobile && (
              <Button
                variant="light"
                size="sm"
                isIconOnly
                onPress={() => setIsFeedbackSidebarOpen(false)}
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Overall Note Section */}
            <div>
              <div 
                className="flex items-center justify-between cursor-pointer py-2"
                onClick={() => {
                  setIsOverallSectionExpanded(!isOverallSectionExpanded);
                  if (!isOverallSectionExpanded) {
                    setExpandedMessageCard(null); // Close message cards when opening overall
                  }
                }}
              >
                <h4 className="text-sm font-medium text-white">Overall Conversation Note</h4>
                {isOverallSectionExpanded ? (
                  <ChevronDown size={16} className="text-gray-400" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400" />
                )}
              </div>
              
              {isOverallSectionExpanded && (
                <div className="mt-3 space-y-3">
                  <Textarea
                    placeholder="Add an overall note about this conversation..."
                    value={overallNote}
                    onChange={(e) => setOverallNote(e.target.value)}
                    minRows={3}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-600 bg-gray-700",
                      input: "text-white",
                    }}
                  />
                  <Button
                    size="sm"
                    className="bg-brand text-gray-900"
                    onPress={handleSaveOverallNote}
                    isDisabled={!overallNote.trim()}
                  >
                    Save Overall Note
                  </Button>
                </div>
              )}
            </div>

            <Divider className="bg-gray-700" />

            {/* Message-Specific Feedback */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Message Feedback</h4>
              
              {getFeedbackMessages().length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No feedback given yet. Click thumbs up/down on AI responses to provide feedback.
                </p>
              ) : (
                <div className="space-y-4">
                  {getFeedbackMessages().map((message) => {
                    const isExpanded = expandedMessageCard === message.index;
                    return (
                      <div
                        key={message.index}
                        className={`rounded-lg border ${
                          selectedMessageForFeedback === message.index 
                            ? 'border-brand bg-brand/10' 
                            : 'border-gray-600 bg-gray-700'
                        }`}
                      >
                        {/* Header - Always visible */}
                        <div 
                          className="p-3 cursor-pointer"
                          onClick={() => {
                            const newExpanded = isExpanded ? null : message.index;
                            setExpandedMessageCard(newExpanded);
                            if (newExpanded !== null) {
                              setIsOverallSectionExpanded(false); // Close overall when opening message
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {messageFeedback[message.index] === 'up' ? (
                                <ThumbsUp size={14} className="text-green-400" />
                              ) : (
                                <ThumbsDown size={14} className="text-red-400" />
                              )}
                              <span className="text-xs font-medium text-gray-200">
                                Message {message.index}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                messageFeedback[message.index] === 'up' 
                                  ? 'bg-green-900 text-green-300' 
                                  : 'bg-red-900 text-red-300'
                              }`}>
                                {messageFeedback[message.index] === 'up' ? 'Positive' : 'Negative'}
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown size={16} className="text-gray-400" />
                            ) : (
                              <ChevronRight size={16} className="text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Expandable content */}
                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-3">
                            <div className="text-xs text-gray-300 p-2 bg-gray-800 rounded border border-gray-600">
                              {message.content.length > 100 
                                ? `${message.content.substring(0, 100)}...` 
                                : message.content
                              }
                            </div>
                            
                            <Textarea
                              placeholder="Add a note about this response..."
                              value={feedbackNotes[message.index] || ""}
                              onChange={(e) => setFeedbackNotes(prev => ({
                                ...prev,
                                [message.index]: e.target.value
                              }))}
                              minRows={2}
                              variant="bordered"
                              size="sm"
                              classNames={{
                                inputWrapper: "border-gray-600 bg-gray-800",
                                input: "text-white",
                              }}
                            />
                            
                            <Button
                              size="sm"
                              className="bg-brand text-gray-900"
                              onPress={() => handleSaveFeedbackNote(message.index, feedbackNotes[message.index] || "")}
                              isDisabled={!feedbackNotes[message.index]?.trim()}
                            >
                              Save Note
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sources Modal */}
      <Modal 
        isOpen={isSourcesModalOpen} 
        onOpenChange={setIsSourcesModalOpen}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent className="bg-gray-800 border border-gray-700">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Knowledge Base Sources</h3>
                <p className="text-sm text-gray-300">
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
                        className="flex items-center justify-between p-3 bg-brand/10 rounded-lg border border-brand/30 hover:bg-brand/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileText className="w-5 h-5 text-brand" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-300">
                              Status: {source.status}
                            </p>
                          </div>
                        </div>
                        {isUrl && (
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-brand text-gray-900 hover:bg-brand/90"
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
              <ModalFooter className="border-t border-gray-700">
                <Button 
                  className="bg-brand text-gray-900 hover:bg-brand/90" 
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ChatLanding;
