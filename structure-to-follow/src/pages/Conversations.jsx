import { useState, useEffect, useMemo, useContext, useCallback, useRef } from 'react';
import {
  Input,
  Button,
  Avatar,
  Tooltip,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ScrollShadow,
  Autocomplete,
  AutocompleteItem
} from "@heroui/react";
import {
  Search,
  Filter,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Send,
  Globe,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  User,
  Bot,
  ArrowLeft
} from "lucide-react";
import ChatInterface from '../components/ChatInterface';
import { UserDataContext } from '../context/UserDataContext';
import { useRealtime } from '../context/RealtimeContext';

// YOUR EXISTING API CALLS
import { today, getLocalTimeZone } from "@internationalized/date";
import DateRangePicker from '../components/datePicker/dateRangePicker';

// ReactSelect + custom components
import ReactSelect, { components } from 'react-select';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { channels, getChannelColor, getChannelIcon, sortOptions } from '../utils/globalFunctions';
import { conversationService } from '../api/services/conversations.service';
import { useLocation } from 'react-router-dom';
import Joyride from 'react-joyride';
import useTourController from '../Demo/utils/useTourController';
import { messagesSteps } from '../Demo/Conversations/conversation.demo';
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip';
dayjs.extend(relativeTime);

export default function Conversations() {
  // ----------------------------
  // State Variables & Constants
  // ----------------------------
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedConversationMessages, setSelectedConversationMessages] = useState([]);
  const selectedConversationRef = useRef(null);
  const [conversationMetadata, setConversationMetadata] = useState([]);
  const [loadingSelectedConversation, setLoadingSelectedConversation] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // For new or updated messages, track their status (e.g. 'new', 'updated')
  const [messageStatus, setMessageStatus] = useState({});
  // Track the last processed message timestamp to avoid re-highlighting old messages
  const [lastProcessedMessageTimestamp, setLastProcessedMessageTimestamp] = useState(null);

  // For top-level metrics (bots, conversations, contacts)
  const [filteredBotCount, setFilteredBotCount] = useState(0);
  const [filteredConversationCount, setFilteredConversationCount] = useState(0);
  const [filteredContactCount, setFilteredContactCount] = useState(0);

  // For chat dropdown
  const [chatDetails, setChatDetails] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Date range filter
  const [dateRangeValue, setDateRangeValue] = useState({
    start: today(getLocalTimeZone()).subtract({ years: 2 }),
    end: today(getLocalTimeZone())
  });

  const { userData, loggedInUser } = useContext(UserDataContext);
  const currentUserId = userData?.client_id;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlAgt = queryParams.get("agt");

  // Keep ref in sync with state
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_URL_KEY = import.meta.env.VITE_API_URL_KEY;

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("conversations", loggedInUser);


  // -- ReactSelect Components
  function formatTimeOrAgo(timestamp) {
    const dateObj = new Date(timestamp);

    // Check if it's the same calendar day as "now"
    const now = new Date();
    const isSameDay =
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    if (isSameDay) {
      // If it's today, show standard time like "2:30 PM"
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }).format(dateObj);
    } else {
      // Otherwise, show how long ago e.g. "2 days ago"
      return dayjs(dateObj).fromNow();
    }
  }

  // ----------------------------
  // Fetch Paginated Data (Optimized)
  // ----------------------------
  const fetchConversations = useCallback(async (page = 0, resetData = true, options = {}) => {
    if (!currentUserId) return;
    
    const finalSearchQuery = options.searchQuery !== undefined ? options.searchQuery : searchQuery;
    const finalSelectedChatId = options.selectedChatId !== undefined ? options.selectedChatId : selectedChatId;
    //console.log('fetchConversations called with searchQuery:', finalSearchQuery, 'selectedChatId:', finalSelectedChatId); // Debug log
    
    if (page === 0 && resetData) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await conversationService.fetchConversationsPaginated(currentUserId, {
        page,
        limit: options.limit || 20, // Use custom limit from options or default to 20
        searchQuery: finalSearchQuery,
        selectedChannel,
        selectedChatId: finalSelectedChatId,
        dateRange: dateRangeValue ? {
          start: new Date(dateRangeValue.start).toISOString(),
          end: new Date(dateRangeValue.end).toISOString()
        } : null,
        sortBy,
        ...options
      });

      if (result) {
        if (resetData || page === 0) {
          // First load or filter change - replace data
          setConversationMetadata(result.data);
          setCurrentPage(0);
        } else {
          // Load more - append data
          setConversationMetadata(prev => [...prev, ...result.data]);
          setCurrentPage(page);
        }
        
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);

        // Build chat details ONLY on initial load to get all available chats
        if ((resetData || page === 0) && options.isInitialLoad) {
          const uniqueChats = new Map();
          result.data.forEach(conv => {
            const chat_id = conv.chat_id;
            if (!uniqueChats.has(chat_id)) {
              uniqueChats.set(chat_id, {
                chat_id,
                company_name: conv.company_name || "",
                bot_name: conv.bot_name || ""
              });
            }
          });
          
          const newChatDetails = Array.from(uniqueChats.values()).map((chat) => ({
            value: chat.chat_id,
            label: chat.company_name,
            botName: chat.bot_name
          }));
          
          
          setChatDetails(newChatDetails);
          
          // Set selectedChatId only if it's currently null or if we have a URL parameter
          const newSelectedChatId = urlAgt || (newChatDetails.length > 0 ? newChatDetails[0].value : null);
          
          if (newSelectedChatId && newSelectedChatId !== selectedChatId) {
            setSelectedChatId(newSelectedChatId);
            // The filter effect will automatically trigger with the new selectedChatId
          }
        } else if ((resetData || page === 0) && !options.isInitialLoad) {
          console.log('Skipping chatDetails rebuild - this is filtered data with selectedChatId:', finalSelectedChatId);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUserId, urlAgt, searchQuery, selectedChannel, selectedChatId, dateRangeValue, sortBy]); // Include all variables used in the function

  // Separate effect for non-search filters to avoid interference with search
  useEffect(() => {
    if (selectedChatId && currentUserId && !searchQuery) { // Only trigger when we have a valid selectedChatId
      
      // Clear selected conversation when filters change (but not on initial selectedChatId set)
      const isInitialChatIdSet = selectedChatId && !selectedConversation;
      if (!isInitialChatIdSet) {
        setSelectedConversation(null);
        setSelectedConversationMessages([]);
      }
      
      // Add a delay to avoid race condition with initial load
      const timeoutId = setTimeout(() => {
        fetchConversations(0, true, { selectedChatId }); // Pass the current selectedChatId explicitly
      }, 200); // Slightly longer delay to ensure initial load completes
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedChannel, selectedChatId, dateRangeValue, sortBy]); // Removed currentUserId to avoid double-triggering

  // Debounced search effect to avoid too many API calls while typing
  useEffect(() => {
    //console.log('Search query changed:', searchQuery); // Debug log
    
    // Clear selected conversation when search query changes
    setSelectedConversation(null);
    setSelectedConversationMessages([]);
    
    const timeoutId = setTimeout(() => {
      if (currentUserId) {
        //console.log('Triggering search with query:', searchQuery); // Debug log
        // Use fetchConversations which already handles all the logic
        fetchConversations(0, true, { searchQuery });
      }
    }, searchQuery ? 300 : 0); // 300ms debounce for search, immediate for no search
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // Only depend on searchQuery to avoid circular deps

  // Initial load and user change handler
  useEffect(() => {
    if (currentUserId) {
      // Clear any selected conversation when user changes
      setSelectedConversation(null);
      setSelectedConversationMessages([]);
      
      // Reset selectedChatId when user changes to avoid using stale chatId
      setSelectedChatId(null);
      // First, get available chats without filtering by selectedChatId
      // Use a higher limit to ensure we get conversations from all available chats
      fetchConversations(0, true, { 
        selectedChatId: null, 
        isInitialLoad: true,
        limit: 100 // Higher limit to capture conversations from multiple chats
      });
    }
  }, [currentUserId]); // Simplified dependency

  // Clear old message highlighting when user visits conversations page
  useEffect(() => {
    
    // Clear all green highlighting from conversations
    setMessageStatus({});
    
    // Set timestamp to current time to prevent old messages from re-highlighting
    setLastProcessedMessageTimestamp(new Date().toISOString());
  }, [location.pathname]); // Run when pathname changes (including when user returns to conversations)

  // No need for separate filter effect - fetchConversations already updates when dependencies change

  // Load more function
  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchConversations(currentPage + 1, false);
    }
  };

  // ----------------------------
  // Real-Time Subscriptions (using global context)
  // ----------------------------
  const { lastMessageEvent, lastUserEvent, markConversationAsRead } = useRealtime();

  // Handle incoming message events from the global RealtimeProvider
  useEffect(() => {
    if (!lastMessageEvent) return;
    
    const payload = lastMessageEvent;
    const oldRecord = payload.old;
    const newRecord = payload.new;
    const messageTimestamp = payload.commit_timestamp;
    
    // Only process messages newer than the last processed one
    if (lastProcessedMessageTimestamp && messageTimestamp <= lastProcessedMessageTimestamp) {
      console.log("[Conversations] Message already processed (timestamp check), skipping:", messageTimestamp);
      return;
    }

    let isLiveAgentChanged = false;
    let otherFieldsChanged = false;

    if (oldRecord && newRecord) {
      isLiveAgentChanged =
        oldRecord.isLiveAgent !== undefined &&
        newRecord.isLiveAgent !== undefined &&
        oldRecord.isLiveAgent !== newRecord.isLiveAgent;

      // If length of content.messages changed => new/updated message
      otherFieldsChanged =
        (oldRecord.content?.messages?.length !== newRecord.content?.messages?.length);
    }

    // 1. Update the conversation metadata list (this is the main conversations list)
    setConversationMetadata((prevMetadata) => {
      const existingIndex = prevMetadata.findIndex(meta => meta.id === newRecord.message_id);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updated = [...prevMetadata];
        const existingConversation = updated[existingIndex];
        
        // Get the latest message from the content
        const messages = newRecord.content?.messages || [];
        const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        updated[existingIndex] = {
          ...existingConversation,
          lastMessage: latestMessage?.content || existingConversation.lastMessage,
          timestamp: newRecord.updated_at || existingConversation.timestamp,
          messageCount: messages.length,
          isLiveAgent: newRecord.isLiveAgent
        };
        
        // Move updated conversation to top if new message was added
        if (otherFieldsChanged && !isLiveAgentChanged) {
          const updatedConversation = updated.splice(existingIndex, 1)[0];
          return [updatedConversation, ...updated];
        }
        
        return updated;
      } else {
        // This is a new conversation - add it to the top
        const messages = newRecord.content?.messages || [];
        const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        
        const newConversationMeta = {
          id: newRecord.message_id,
          chat_id: newRecord.chat_id,
          user_first_name: newRecord.user_first_name || '',
          user_last_name: newRecord.user_last_name || '',
          user_email: newRecord.user_email || 'Unknown',
          user_avatar_img: newRecord.user_avatar_img || null,
          message_type: newRecord.message_type || 'website',
          lastMessage: latestMessage?.content || '',
          timestamp: newRecord.created_at || newRecord.updated_at,
          messageCount: messages.length,
          isLiveAgent: newRecord.isLiveAgent || false
        };
        
        return [newConversationMeta, ...prevMetadata];
      }
    });

    // 2. If the user is currently viewing this same conversation, update it
    setSelectedConversation((prevSelected) => {
      // If no conversation is selected, or it's a different one, do nothing
      if (!prevSelected || prevSelected.id !== newRecord.message_id) {
        return prevSelected;
      }
      // Otherwise, return a new object with the updated content
      return {
        ...prevSelected,
        // newRecord.content is the updated conversation messages
        messages: newRecord.content?.messages || [],
        // Update last message
        lastMessage: newRecord.content?.messages?.length > 0 
          ? newRecord.content.messages[newRecord.content.messages.length - 1]?.content || ""
          : prevSelected.lastMessage,
        // if you have other fields that changed (like isLiveAgent), update them here
        full_details: newRecord
      };
    });

    // 3. Also update selectedConversationMessages if this conversation is currently selected
    setSelectedConversationMessages((prevMessages) => {
      const currentlySelected = selectedConversationRef.current;
      
      if (currentlySelected && currentlySelected.id === newRecord.message_id) {
        return newRecord.content?.messages || prevMessages;
      }
      return prevMessages;
    });

    // 4. Skip marking "new" or "updated" if only isLiveAgent changed
    if (!isLiveAgentChanged || otherFieldsChanged) {
      // Only add green highlighting if we're currently on the conversations page
      // (if user navigates away and comes back, the highlighting will be cleared by the other effect)
      setMessageStatus((prevStatus) => ({
        ...prevStatus,
        [newRecord.message_id]: payload.eventType === 'UPDATE' ? 'updated' : 'new'
      }));

      // Update the last processed timestamp
      setLastProcessedMessageTimestamp(messageTimestamp);

      // Clear the status after 5 seconds
      setTimeout(() => {
        setMessageStatus((prevStatus) => {
          const newStatus = { ...prevStatus };
          delete newStatus[newRecord.message_id];
          return newStatus;
        });
      }, 5000);
    }
  }, [lastMessageEvent]);

  // Handle user updates from the global RealtimeProvider
  useEffect(() => {
    if (!lastUserEvent) return;
    
    
    const payload = lastUserEvent;
    
    // Update conversation metadata with new user information
    setConversationMetadata((prevMetadata) => {
      return prevMetadata.map(meta => {
        if (meta.user_email === payload.new.email) {
          return {
            ...meta,
            user_first_name: payload.new.first_name || meta.user_first_name,
            user_last_name: payload.new.last_name || meta.user_last_name,
            user_avatar_img: payload.new.avatar_img || meta.user_avatar_img
          };
        }
        return meta;
      });
    });

    // Update selected conversation if it's the same user
    setSelectedConversation((prevSelected) => {
      if (prevSelected && prevSelected.user.email === payload.new.email) {
        return {
          ...prevSelected,
          user: {
            ...prevSelected.user,
            name: payload.new.first_name && payload.new.last_name 
              ? `${payload.new.first_name} ${payload.new.last_name}` 
              : prevSelected.user.name,
            avatar: payload.new.avatar_img || prevSelected.user.avatar
          }
        };
      }
      return prevSelected;
    });
  }, [lastUserEvent]);

  // ----------------------------
  // Build "Conversations" Array (Optimized) 
  // ----------------------------
  const conversations = useMemo(() => {
    return conversationMetadata.map((metadata) => {
      // ✅ User data is now embedded in metadata - no lookup needed!
      const displayName = metadata.user_first_name
        ? `${metadata.user_first_name}${metadata.user_last_name ? ` ${metadata.user_last_name}` : ""}`
        : "";

      return {
        id: metadata.id,
        chat_id: metadata.chat_id,
        channel:
          metadata.message_type === 'text'
            ? 'website'
            : metadata.message_type || 'website',
        user: {
          name: displayName,
          avatar: metadata.user_avatar_img,
          online: false,
          email: metadata.user_email || "Unknown"
        },
        messages: [], // Will be loaded lazily when conversation is selected
        lastMessage: metadata.lastMessage || "",
        timestamp: metadata.timestamp,
        unread: 0,
        status: metadata.isLiveAgent ? 'active' : 'closed',
        messageCount: metadata.messageCount || 0,
        // Store metadata for lazy loading
        metadata: metadata
      };
    });
  }, [conversationMetadata]);

  // ----------------------------
  // Update Metrics (No Client-Side Filtering Needed)
  // ----------------------------
  const filteredConversations = useMemo(() => {
    // No filtering needed - all filtering is done server-side!
    const filtered = conversations;

    // Update top-level metrics
    const botChats = new Set(conversations.map(conv => conv.chat_id)).size;
    setFilteredBotCount(botChats);

    setFilteredConversationCount(totalCount); // Use server-provided total count
    // Count unique users from current page
    const uniqueUsers = new Set(conversations.map(conv => conv.user.email)).size;
    setFilteredContactCount(uniqueUsers);
    
    return filtered;
  }, [conversations, totalCount]);

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleDateChange = (newValue) => {
    setDateRangeValue(newValue);
  };

  // For the ReactSelect chat dropdown
  const handleChatSelect = (selectedOption) => {
    const newChatId = selectedOption ? selectedOption.value : null;
    
    // Clear any selected conversation when chat changes
    setSelectedConversation(null);
    setSelectedConversationMessages([]);
    
    setSelectedChatId(newChatId);
    
    // Immediately fetch conversations with the new selectedChatId
    if (newChatId && currentUserId && !searchQuery) {
      fetchConversations(0, true, { selectedChatId: newChatId });
    }
  };

  // Load full conversation content when selected (lazy loading)
  const handleSelectConversation = async (conversation) => {
    // Check if this conversation had new messages (green highlighting)
    const hadNewMessages = messageStatus[conversation.id] === 'new' || messageStatus[conversation.id] === 'updated';
    
    // Clear any existing status for this conversation
    setMessageStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[conversation.id];
      return newStatus;
    });
    
    // Mark this conversation as read (will reduce sidebar count if it had new messages)
    if (hadNewMessages) {
      markConversationAsRead(conversation.id);
      // Update processed timestamp to ensure this conversation doesn't get re-highlighted
      setLastProcessedMessageTimestamp(new Date().toISOString()); 
    }
    
    // Set the selected conversation immediately for UI feedback
    setSelectedConversation(conversation);
    
    // If we already have messages, don't fetch again
    if (conversation.messages && conversation.messages.length > 0) {
      setSelectedConversationMessages(conversation.messages);
      return;
    }
    
    // Start loading
    setLoadingSelectedConversation(true);
    
    try {
      // Fetch full conversation content
      const fullConversation = await conversationService.fetchConversationById(conversation.id);
      
      if (fullConversation) {
        const messageArray = fullConversation.content?.messages || [];
        setSelectedConversationMessages(messageArray);
        
        // Get the actual last message from the loaded conversation
        const actualLastMessage = messageArray.length > 0 
          ? messageArray[messageArray.length - 1]?.content || ""
          : "";
        
        // Update the conversation with the loaded messages for future reference
        setSelectedConversation(prev => ({
          ...prev,
          messages: messageArray,
          lastMessage: actualLastMessage,
          full_details: fullConversation
        }));

        // Update the conversation metadata so the sidebar shows the actual last message
        setConversationMetadata(prev => 
          prev.map(metadata => 
            metadata.id === conversation.id 
              ? { 
                  ...metadata, 
                  lastMessage: actualLastMessage,
                  messageCount: messageArray.length
                }
              : metadata
          )
        );
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoadingSelectedConversation(false);
    }
  };

  // ----------------------------
  // Render UI
  // ----------------------------
  return (
    <div className="space-y-8 ">

      {/* Joyride component at the top level */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={messagesSteps}
        run={runTour}
        scrollOffset={300}
        continuous={true}
        showSkipButton={true}
        tooltipComponent={MyCustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Conversations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your customer conversations</p>
        </div>
        <div className="flex items-center gap-4">
          {chatDetails && chatDetails.length > 0 && (
            <div className="min-w-[250px]">
              <Autocomplete
                aria-label="conversations"
                className="w-full"
                defaultItems={chatDetails.map(chat => ({
                  label: chat.label,
                  key: chat.value,
                  description: chat.botName,
                }))}
                placeholder="select agent"
                startContent={<Bot className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="sm"
                selectedKey={selectedChatId}
                onSelectionChange={(key) => {
                  const selected = chatDetails.find(chat => chat.value === key);
                  handleChatSelect(selected);
                }}
              >
                {(item) => (
                  <AutocompleteItem key={item.key} textValue={item.description}>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-gray-500 truncate">{item.description}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-gray-900">
              {searchQuery ? (
                <>
                  {totalCount} Search Results {totalCount > 0 && (
                    <span className="text-green-600 text-xs ml-1">✓ Content Search</span>
                  )}
                </>
              ) : (
                <>
                  {totalCount} Conversations
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className=" rounded-lg space-y-2">
        <div className="flex flex-col lg:flex-row gap-4 w-full justify-between">
          {/* Left side: Channel/Searching */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Input
              aria-label="conversations"
              placeholder="Search by name, email, or message content..."
              value={searchQuery}
              onChange={(e) => {
                //console.log('Search input changed:', e.target.value); // Debug log
                setSearchQuery(e.target.value);
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              size="sm"
              classNames={{ inputWrapper: "border-gray-100" }}
            />

            {/* <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] bg-gray-50 text-gray-600"
                  startContent={<Filter className="w-4 h-4" />}
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {sortOptions.find(opt => opt.key === sortBy)?.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
              >
                {sortOptions.map((option) => (
                  <DropdownItem
                    key={option.key}
                    startContent={<option.icon className="w-4 h-4" />}
                  >
                    {option.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown> */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    aria-label="conversations"
                    size="sm"
                    className="min-w-[140px] bg-gray-50 text-gray-600"
                    startContent={<Filter className="w-4 h-4" />}
                    endContent={<ChevronDown className="w-4 h-4" />}
                  >
                    {sortOptions.find(opt => opt.key === sortBy)?.name}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Sort options"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([sortBy])}
                  onSelectionChange={(keys) => {
                    const [newKey] = keys;
                    setSortBy(newKey);
                  }}
                >
                  {sortOptions.map((option) => (
                    <DropdownItem
                      key={option.key}
                      startContent={<option.icon className="w-4 h-4" />}
                    >
                      {option.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    className="min-w-[140px] bg-gray-50 text-gray-600"
                    endContent={<ChevronDown className="w-4 h-4" />}
                  >
                    {channels.find(channel => channel.id === selectedChannel)?.name || "All Channels"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Channel options"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([selectedChannel])}
                  onSelectionChange={(keys) => {
                    const [newKey] = keys;
                    setSelectedChannel(newKey);
                  }}
                >
                  <DropdownItem key="all">All Channels</DropdownItem>
                  {channels.map((channel) => (
                    <DropdownItem
                      key={channel.id}
                      startContent={
                        <channel.icon className="w-4 h-4" style={{ color: getChannelColor([], channel.id) }} />
                      }
                    >
                      {channel.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>

              <div className="min-w-[140px]">
                <DateRangePicker
                  value={dateRangeValue}
                  onDateChange={handleDateChange}
                  className="text-xs"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Layout with Conversations List + Chat Interface */}
      <div className={`grid gap-6 ${selectedConversation ? 'grid-cols-1' : 'grid-cols-1'} xl:grid-cols-[400px,1fr]`}>
        {/* Conversations List */}
        <div className={`${selectedConversation ? 'hidden xl:block' : 'block'}`}>
          <ScrollShadow className="w-full h-[calc(100vh-13rem)] view-all">
            <div className="space-y-4">
            
            {loading && conversations.length === 0 ? (
              // Initial loading state
              <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-500">Loading conversations...</p>
              </div>
            ) : (
              <>
            {filteredConversations.map((conversation) => {
              const channelColor = getChannelColor(channels, conversation.channel);
              const ChannelIcon = getChannelIcon(channels, conversation.channel);

              // Check if this conversation is "new" or "updated" in messageStatus
              const status = messageStatus[conversation.id]; // 'new', 'updated', etc.

              return (
                <div
                  key={conversation.id}
                  className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors duration-250
                  ${selectedConversation?.id === conversation.id ? 'border-brand' : 'border-gray-100 hover:border-brand'}
                  ${status === 'new' || status === 'updated' ? 'border-green-500' : ''}
                `}
                      onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600">
                        {
                          conversation.user.avatar
                            ? (
                              <img
                                src={conversation.user.avatar}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full"
                              />
                            )
                            : conversation.user.name !== ""
                              ? conversation.user.name
                                .split(" ")
                                .map((word) => word.charAt(0))
                                .join("")
                                .toUpperCase()
                              : <User className="w-6 h-6" />
                        }
                      </div>
                      {/* If the conversation is new or updated, show a small dot */}
                      {(status === 'new' || status === 'updated') && (
                        <span
                          className="absolute -top-1 -left-1 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"
                          title={status === 'new' ? 'New message' : 'Updated message'}
                        />
                      )}
                      {conversation.user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.user.name}
                        </h3>
                        <Chip size="sm" className="p-1 rounded"
                          style={{ backgroundColor: `#CCFC0120` }}>
                          {conversation.channel}
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {conversation.lastMessage || 'Click to load messages...'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-400">
                        {formatTimeOrAgo(conversation.timestamp)}
                      </span>
                      {conversation.unread > 0 && (
                        <Chip
                          size="sm"
                          className="bg-brand text-gray-900 min-w-[20px] h-5"
                        >
                          {conversation.unread}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="bg-gray-50 text-gray-600 hover:bg-gray-100"
                      size="sm"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        `Load More (${totalCount - conversations.length} remaining)`
                      )}
                    </Button>
                  </div>
                )}

                {filteredConversations.length === 0 && !loading && (
              <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No conversations found</h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
                )}
              </>
            )}
            </div>
          </ScrollShadow>
        </div>

        {/* Chat Interface */}
        {selectedConversation ? (
          <div className="xl:block">
            {/* Mobile Back Button */}
            <div className="xl:hidden mb-4">
              <Button
                size="sm"
                variant="ghost"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onPress={() => setSelectedConversation(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to conversations
              </Button>
            </div>
            <div className="w-full h-[calc(100vh-13rem)] total-conversations">
              {loadingSelectedConversation ? (
                <div className="bg-white border border-gray-100 rounded-lg p-8 text-center h-[500px] flex items-center justify-center">
                  <div>
                    <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading conversation...</p>
                  </div>
                </div>
              ) : (
              <ChatInterface
                  conversation={{
                    ...selectedConversation,
                    messages: selectedConversationMessages
                  }}
                  onClose={() => {
                    setSelectedConversation(null);
                    setSelectedConversationMessages([]);
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-lg p-8 text-center h-[calc(100vh-13rem)] flex items-center justify-center total-conversations">
            <div>
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Select a conversation</h3>
              <p className="text-sm text-gray-500">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
