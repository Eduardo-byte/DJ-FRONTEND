import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Button, Spinner } from '@heroui/react';
import { Plus, Search, Globe } from 'lucide-react';
import { aiService } from '../api/services/ai.service';
import { chatService } from '../api/services/chat.service';
import { toast } from 'sonner';
import { UserDataContext } from '../context/UserDataContext';
import ChatInput from '../components/Ask/ChatInput';
import MessageContent from '../components/Ask/MessageContent';
import SourcesDrawer from '../components/Ask/SourcesDrawer';
import VideoEmbed from '../components/Ask/VideoEmbed';

const Ask = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const messagesEndRef = useRef(null);

  // WebSocket connection
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [wsError, setWsError] = useState(null);
  const requestIdRef = useRef(0);
  const pendingRequestsRef = useRef(new Map());

  // Action tracking for enhanced loading states
  const [currentAction, setCurrentAction] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  // Custom tools state
  const [customTools, setCustomTools] = useState([]);

  // User chats state
  const [userChats, setUserChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Business tools state
  const [enabledBusinessTools, setEnabledBusinessTools] = useState([]);

  // Search functionality state
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  // Image functionality state
  const [isImageEnabled, setIsImageEnabled] = useState(false);


  // Get user data from context
  const { userData, loggedInUser } = useContext(UserDataContext);

  // AI service configuration
  // const AGENT_ID = '8ea7ef30-7694-491b-89ed-db619d6acecf'; // Fabio
  // const AGENT_ID =  'e66ea468-98a4-40a9-a9fd-803a39574e0e'; // Ben
  const AGENT_ID = '5e049a01-ee5e-416f-a020-d79900a3db52'; // Monica
  const MODEL_NAME = 'gpt-4.1';

  // Get user's first name for personalization
  const getFirstName = () => {
    if (userData?.contact_name) {
      return userData.contact_name.split(' ')[0];
    }
    if (loggedInUser?.email) {
      return loggedInUser.email.split('@')[0];
    }
    return 'there';
  };

  const firstName = getFirstName();

  // Extract user profile data for WebSocket options
  const extractUserOptions = () => {
    // Extract from userData (primary) or loggedInUser (fallback)
    const contactName = userData?.contact_name || loggedInUser?.contact_name || '';
    const [firstName = '', ...lastNameParts] = contactName.split(' ');
    const lastName = lastNameParts.join(' '); // Handle multiple middle/last names

    return {
      type: 'olivia_ask',
      firstName: firstName,
      lastName: lastName,
      email: userData?.contact_email || loggedInUser?.contact_email || loggedInUser?.email || '',
      phoneNumber: userData?.contact_phone || loggedInUser?.contact_phone || '',
      companyName: userData?.company_name || loggedInUser?.company_name || '',
      // Pass complete user objects for backend access
      userData: userData || null,
      loggedInUser: loggedInUser || null,
      // Pass user chats for backend access
      userChats: userChats || []
    };
  };

  // Generate request ID
  const generateRequestId = () => {
    return `req_${++requestIdRef.current}_${Date.now()}`;
  };

  // WebSocket connection management
  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // const wsUrl = `wss://agents-micro-service-yr8zx.ondigitalocean.app/ws/agent/stream`;
    const wsUrl = `wss://web2-agents-ai-micro-service-nodejs-8851907900.europe-west1.run.app/ws/agent/stream`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      setWsError(null);
      setConnectionAttempts(0);
      console.log('WebSocket connected successfully');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');

      // Attempt to reconnect if not at max attempts
      if (connectionAttempts < 4) {
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
          connectWebSocket();
        }, Math.pow(2, connectionAttempts) * 1000); // Exponential backoff
      } else {
        setWsError('Ask is currently down. Please try again later.');
        toast.error('Ask is currently down. Please try again later.');
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'stream_chunk':
        handleStreamChunk(data);
        break;

      case 'stream_complete':
        handleStreamComplete(data);
        break;

      case 'explanation_chunk':
        handleExplanationChunk(data);
        break;

      case 'explanation_complete':
        handleExplanationComplete(data);
        break;

      case 'event':
        handleEvent(data);
        break;

      default:
        console.log('Unknown message type:', data.type, 'Full data:', data);
    }
  };

  // Handle action events
  const handleEvent = (data) => {
    const { eventType, data: eventData } = data;

    console.log('Event received:', { eventType, eventData });

    switch (eventType) {
      case 'action_start':
        if (eventData.action === 'web_search') {
          setCurrentAction('web_search');
          setActionStatus('in_progress');
        }
        break;

      case 'action_complete':
        if (eventData.status === 'completed') {
          setCurrentAction(null);
          setActionStatus(null);
        }
        break;

      default:
        console.log('Unknown event type:', eventType);
    }
  };

  // Handle streaming chunks
  const handleStreamChunk = (data) => {
    const { requestId, data: chunkData } = data;
    const text = chunkData.text || '';

    // Stop loading indicator and clear action state when first chunk arrives
    setIsLoading(false);
    setCurrentAction(null);
    setActionStatus(null);

    if (text) {
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];

        // Only update if the last message is a regular assistant message (not explanation)
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isExplanation) {
          // Update existing assistant message
          return newMessages.map((msg, index) =>
            index === newMessages.length - 1
              ? { ...msg, content: msg.content + text }
              : msg
          );
        } else {
          // Create new assistant message if none exists or last message is explanation
          return [...newMessages, {
            id: Date.now() + Math.random(),
            role: 'assistant',
            content: text,
            timestamp: new Date()
          }];
        }
      });
    }
  };

  // Handle stream completion
  const handleStreamComplete = (data) => {
    const { requestId, data: completeData } = data;

    console.log('Stream Complete received:', { requestId, completeData });

    // Add the full response to chat history if available
    if (completeData && completeData.fullResponse) {
      // Check if sources should be included (only for web_search type)
      const shouldIncludeSources = completeData.urlSources?.type === 'web_search' && completeData.urlSources?.annotations;

      // Update the last assistant message with the complete response
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];

        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isExplanation) {
          const updatedMessage = {
            ...lastMessage,
            content: completeData.fullResponse,
            timestamp: new Date(),
            sources: shouldIncludeSources ? completeData.urlSources.annotations : null,
            isComplete: true // Mark as complete for video detection
          };

          // Update the existing assistant message with the complete response and sources
          return newMessages.map((msg, index) =>
            index === newMessages.length - 1 ? updatedMessage : msg
          );
        } else {
          // Create new assistant message if none exists
          const newMessage = {
            id: Date.now() + Math.random(),
            role: 'assistant',
            content: completeData.fullResponse,
            timestamp: new Date(),
            sources: shouldIncludeSources ? completeData.urlSources.annotations : null,
            isComplete: true // Mark as complete for video detection
          };

          return [...newMessages, newMessage];
        }
      });
    }

    // Clean up pending request
    if (requestId) {
      pendingRequestsRef.current.delete(requestId);
    }

    // Reset loading state
    setIsLoading(false);
  };

  // Handle explanation chunks
  const handleExplanationChunk = (data) => {
    const { data: chunkData } = data;
    const text = chunkData.text || '';

    if (text) {
      // Update the explanation in real-time like stream chunks
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];

        // Check if the last message is an explanation message being streamed
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isExplanation && !lastMessage.completed) {
          // Update existing explanation message
          return newMessages.map((msg, index) =>
            index === newMessages.length - 1
              ? { ...msg, content: msg.content + text }
              : msg
          );
        } else {
          // Create new explanation message if none exists
          return [...newMessages, {
            id: Date.now() + Math.random(),
            role: 'assistant',
            content: text,
            timestamp: new Date(),
            isExplanation: true,
            completed: false // Mark as streaming
          }];
        }
      });
    }
  };

  // Handle explanation completion
  const handleExplanationComplete = (data) => {
    const { data: explanationData } = data;

    // Mark the last explanation message as completed
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      const lastMessage = newMessages[newMessages.length - 1];

      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isExplanation && !lastMessage.completed) {
        // Update the existing explanation message with the complete response and mark as completed
        const finalContent = explanationData.fullResponse || lastMessage.content;
        return newMessages.map((msg, index) =>
          index === newMessages.length - 1
            ? { ...msg, content: finalContent, completed: true, timestamp: new Date() }
            : msg
        );
      } else {
        // Fallback: Add the complete explanation as a new message if no streaming message exists
        const explanationText = explanationData.fullResponse;
        if (explanationText) {
          return [...newMessages, {
            id: Date.now() + Math.random(),
            role: 'assistant',
            content: explanationText,
            timestamp: new Date(),
            isExplanation: true,
            completed: true
          }];
        }
        return newMessages;
      }
    });
  };

  // Send WebSocket message
  const sendWebSocketMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // End transition after animation completes
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 800); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // Fetch user chats on page load
  useEffect(() => {
    const fetchUserChats = async () => {
      // Only fetch if we have a client ID
      const clientId = loggedInUser?.id || userData?.client_id;
      if (!clientId) {
        console.log('No client ID available, skipping chat fetch');
        return;
      }

      setIsLoadingChats(true);
      try {
        const chatData = await chatService.fetchChatIds(clientId);
        if (chatData && chatData.chat_ids) {
          setUserChats(chatData.chat_ids);
          console.log('User chats loaded:', chatData.chat_ids.length, 'chats found');
        } else {
          console.log('No chats found for user');
          setUserChats([]);
        }
      } catch (error) {
        console.error('Error fetching user chats:', error);
        toast.error('Failed to load your chats');
        setUserChats([]);
      } finally {
        setIsLoadingChats(false);
      }
    };

    // Only fetch chats if we have user data
    if (loggedInUser || userData) {
      fetchUserChats();
    }
  }, [loggedInUser, userData]);

  // Auto-connect to WebSocket on component mount
  useEffect(() => {
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isConnected) return;

    // Start transition animation if this is the first message
    if (messages.length === 0) {
      setIsTransitioning(true);
    }

    const requestId = generateRequestId();
    pendingRequestsRef.current.set(requestId, { content: inputValue.trim(), timestamp: Date.now() });

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history (excluding system messages and explanation messages)
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .filter(msg => !msg.isExplanation) // Filter out explanation messages
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Get user profile data for options
      const userOptions = extractUserOptions();

      // Create WebSocket message
      const message = {
        type: 'text',
        requestId,
        data: {
          model: MODEL_NAME,
          text: currentInput,
          messages: conversationHistory,
          options: {
            agentId: AGENT_ID,
            search_available: isSearchEnabled,
            image_available: isImageEnabled,
            custom_tools: enabledBusinessTools,
            ...userOptions
          }
        }
      };

      // Send via WebSocket
      const sent = sendWebSocketMessage(message);
      if (!sent) {
        throw new Error('Failed to send message. WebSocket not connected.');
      }

      // Don't add empty assistant message - let handleStreamChunk create it when content arrives

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);

      // Clean up pending request
      pendingRequestsRef.current.delete(requestId);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsTransitioning(false);
  };

  // Handle custom tools update
  const handleToolsUpdate = (newTools) => {
    setCustomTools(newTools);
    // Here you could also save to backend/localStorage if needed
    console.log('Custom tools updated:', newTools);
  };

  // Handle business tools update
  const handleBusinessToolsUpdate = (enabledTools) => {
    setEnabledBusinessTools(enabledTools);
    console.log('Enabled business tools updated:', enabledTools);
  };

  // Handle search toggle
  const handleSearchToggle = (enabled) => {
    setIsSearchEnabled(enabled);
    if (enabled) {
      setIsImageEnabled(false); // Disable image when search is enabled
    }
    console.log('Search enabled:', enabled);
  };

  // Handle image toggle
  const handleImageToggle = (enabled) => {
    setIsImageEnabled(enabled);
    if (enabled) {
      setIsSearchEnabled(false); // Disable search when image is enabled
    }
    console.log('Image enabled:', enabled);
  };


  const isEmpty = messages.length === 0;
  const showConversation = messages.length > 0 || isTransitioning;

  return (
    <div className="h-[calc(100vh-200px)] py-0 flex flex-col relative">
      {/* Floating New Chat Button - only show during conversation */}
      <div className={`absolute -top-5 -right-5 z-20 transition-all duration-800 ${showConversation ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}>
        <Button
          variant="bordered"
          size="sm"
          onPress={handleNewChat}
          startContent={<Plus className="w-4 h-4" />}
          className="shadow-lg bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white"
        >
          New Chat
        </Button>
      </div>

      {/* Welcome Header - only show in empty state */}
      <div className={`text-center transition-all duration-800 ${isEmpty && !isTransitioning ? 'opacity-100 translate-y-0 py-12' : 'opacity-0 -translate-y-8 py-0 h-0 overflow-hidden'
        }`}>
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">
          Hi {firstName}, what can I help with?
        </h1>
      </div>

      {/* Messages Area - only show during conversation */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 transition-all duration-800 ${showConversation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 h-0'
        }`}>
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user'
                  ? 'bg-brand text-gray-900'
                  : message.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <MessageContent
                  content={message.content}
                  role={message.role}
                />
                <div className={`text-xs mt-2 opacity-70 ${message.role === 'user' ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>


            {/* Sources Section - compact drawer component */}
            <SourcesDrawer sources={message.sources} />
          </div>
        ))}

        {/* Enhanced Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl px-4 py-3 flex items-center space-x-3 transition-all duration-300 ${currentAction === 'web_search'
              ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 animate-pulse'
              : 'bg-gray-100'
              }`}>
              {currentAction === 'web_search' ? (
                <div className="relative">
                  <Search className="w-4 h-4 text-blue-600 animate-pulse" />
                  <div className="absolute -inset-1 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                </div>
              ) : (
                <Spinner size="sm" />
              )}
              <span className={`font-medium ${currentAction === 'web_search' ? 'text-blue-700' : 'text-gray-600'
                }`}>
                {currentAction === 'web_search' ? 'Searching web...' : 'Thinking...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Flexible spacer - grows when in empty state to center the input */}
      <div className={`transition-all duration-800 ${isEmpty && !isTransitioning ? 'flex-1' : 'flex-none'
        }`}></div>

      {/* Input Area */}
      <div
        className={`transition-all duration-800 ease-in-out p-0 ${showConversation ? '' : ''
          }`}
      >
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isEmpty={isEmpty}
          isTransitioning={isTransitioning}
          customTools={customTools}
          onToolsUpdate={handleToolsUpdate}
          userChats={userChats}
          onBusinessToolsUpdate={handleBusinessToolsUpdate}
          isSearchEnabled={isSearchEnabled}
          onSearchToggle={handleSearchToggle}
          isImageEnabled={isImageEnabled}
          onImageToggle={handleImageToggle}
        />
      </div>
    </div>
  );
};

export default Ask;
