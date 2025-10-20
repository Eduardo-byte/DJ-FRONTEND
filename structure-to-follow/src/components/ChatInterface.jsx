import { useState, useRef, useEffect, useContext } from 'react';
import {
  Input,
  Button,
  Avatar,
  Switch,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip
} from "@heroui/react";
import {
  Send,
  Bot,
  User2,
  MoreVertical,
  Download,
  Archive,
  Flag,
  Phone,
  Video,
  Mail,
  Clock,
  CheckCheck,
  User,
  Headset
} from "lucide-react";
import { generateMessageId } from '../utils/conversationsFunctionsUtils';
import { conversationService } from '../api/services/conversations.service';

import Joyride from 'react-joyride';
import useTourController from '../Demo/utils/useTourController';
import { chatSteps } from '../Demo/Conversations/chat.demo';
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip';
import { UserDataContext } from '../context/UserDataContext';
import { facebookService } from '../api/services/meta/facebook.service';
import { instagramService } from '../api/services/meta/instagram.service'
import { telegramService } from '../api/services/telegram.service';
import { whatsappService } from '../api/services/meta';

export default function ChatInterface({ conversation, onClose }) {
  // const [isAiMode, setIsAiMode] = useState(true);
  const [isAiMode, setIsAiMode] = useState(
    conversation?.full_details.isLiveAgent === true ? false : true
  );
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // We'll use conversation.messages instead of mock data:
  const [chatMessages, setChatMessages] = useState(conversation.messages || []);

  const { userData, loggedInUser } = useContext(UserDataContext);
  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("chat", loggedInUser);

  // Scroll to bottom utility
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Whenever the conversation changes or the messages change, scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, conversation]);

  // If conversation changes, re-sync chatMessages from conversation
  useEffect(() => {
    //console.log("conversation:", conversation);
    setChatMessages(conversation.messages || []);
    setIsAiMode(conversation?.full_details.isLiveAgent === true ? false : true)
  }, [conversation]);

  // function in use  to change the isliveAgent field on Supabase
  const handleSwitchChange = async (messageId, isChecked) => {
    //console.log("Switch Clicked: ", messageId, isChecked);

    try {
      const updateLiveAgent = await conversationService.updateIsLiveAgentInSupabase(messageId, isChecked);
      // console.log("updateLiveAgent response:", updateLiveAgent);
      setIsAiMode(!isChecked);
      // setShowInputForMessageId(isChecked ? messageId : null);
    } catch (error) {
      console.error("Failed to update live agent status: ", error);
      // Optionally handle the error in UI, like showing a notification
    }
    // Update showInputForMessageId based on the switch state
    setIsAiMode(!isChecked);
    // setShowInputForMessageId(isChecked ? messageId : null);

  };

  // function used  to handle/send a new message entry/sent by Agent to the Supabase
  // ----------------------------
  // Send a New Message
  // ----------------------------
  const handleSendMessage = async () => {
    // 1. Validate input
    if (!message.trim()) return;

    // 2. Build new message object
    const now = new Date();
    const dateOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const now_date_v2 = now.toLocaleString('en-GB', dateOptions).replace(',', '');

    const newMessage = {
      message_id: generateMessageId(), // unique ID
      content: message,
      created_at: now_date_v2,
      message_type: isAiMode ? 'AI' : 'Agent',
      status: 'sent'
    };

    // 3. Append to local array
    const updatedMessages = [...chatMessages, newMessage];
    const payload = {
      messages: updatedMessages
    }
    let updateConversation
    try {
      if (conversation.channel == "facebook") {
        const sendFacebookMessage = await facebookService.sendMessage(message, conversation.chat_id, conversation.full_details.client_id, conversation.full_details.user_id, false)
        // updateConversation = await conversationService.updateConversationInSupabase(conversation.id, { content: payload });
        //console.log(sendFacebookMessage);
      } else if (conversation.channel == "website") {
        updateConversation = await conversationService.updateConversationInSupabase(conversation.id, { content: payload });
      } else if (conversation.channel == "instagram") {
        const sendFacebookMessage = await instagramService.sendMessage(message, conversation.chat_id, conversation.full_details.client_id, conversation.full_details.user_id, true)
        // updateConversation = await conversationService.updateConversationInSupabase(conversation.id, { content: payload });
        //console.log(sendFacebookMessage);
      } else if (conversation.channel == "telegram") {
        const sendTelegramMessage = await telegramService.sendMessage(message, conversation.chat_id, conversation.full_details.client_id, conversation.full_details.user_id, conversation.full_details.channel.id, conversation.full_details.channel.name, conversation.full_details.message_id)
        // console.log("payload:", payload);
        // console.log("message:", message);
        // console.log("conversation.chat_id:", conversation.chat_id);
        // console.log("conversation.full_details.client_id:", conversation.full_details.client_id);
        // console.log("conversation.full_details.user_id:", conversation.full_details.user_id);
        // console.log("conversation.full_details:", conversation.full_details);
      } else if (conversation.channel == "whatsapp") {
        const messages = conversation.full_details.content.messages;

        // find the last message where message_type === 'User'
        const lastUserMessage = [...messages]        // copy so we don’t mutate original
          .reverse()                                // reverse to look from end
          .find(msg => msg.message_type === 'User');

        if (!lastUserMessage) {
          throw new Error('No user message found in conversation');
        }

        const wtMessageId = lastUserMessage.wt_message_id;
        const sendWhatsappMessage = await whatsappService.sendMessage(conversation.full_details.client_id, conversation.full_details.channel.user_phone_number, conversation.full_details.channel.phone_number_id, message, wtMessageId, conversation.full_details.user_id)
      }
      // 4. Update in Supabase (example call)
      //console.log("updateConversation: ", updateConversation);

      // 5. Update local state
      setChatMessages(updatedMessages);

      // 6. Clear the input
      setMessage('');
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  };

  // Press Enter to send
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper: Render the user avatar with initials if name available, or fallback to icon.
  const renderUserAvatar = (sizeClass, iconSizeClass) => (
    <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gray-200 text-gray-600`}>
      {/* {conversation.user.name
        ? conversation.user.name
          .split(" ")
          .map((word) => word.charAt(0))
          .join("")
          .toUpperCase()
        : <User className={iconSizeClass} />
      } */}
      {
        conversation.user.avatar ? (
          <img
            src={conversation.user.avatar}
            alt="User Avatar"
            className="w-12 h-12 rounded-full"
          />
        ) : conversation.user.name !== "" ? (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
            <span className="text-2xl ">
              {conversation.user.name
                .split(" ")
                .map((word) => word.charAt(0))
                .join("")
                .toUpperCase()}
            </span>
          </div>
        ) : (
          <User className="w-8 h-8" />
        )
      }

    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {/* Joyride component at the top level */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={chatSteps}
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

      <div className="bg-white border border-gray-100 rounded-t-lg p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              {renderUserAvatar("w-12 h-12", "w-6 h-6")}
              {conversation.user.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {conversation.user.name}
                </h2>
                <Chip size="sm" className="bg-brand/10 text-gray-900">
                  {conversation.channel}
                </Chip>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                {/* <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Last active: 2 min ago</span>
                </div> */}
                {conversation.user.email && conversation.channel != "telegram" && conversation.channel != "facebook" && conversation.channel != "instagram" && conversation.channel != "whatsapp" ? (
                  < div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span>{conversation.user.email}</span>
                  </div>
                ) : (
                  null
                )}
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <Tooltip content="AI Mode">
                <Bot className={`w-5 h-5 ${isAiMode ? 'text-gray-900' : 'text-gray-400'}`} />
              </Tooltip>
              <Switch
                className='agent-mode'
                size="sm"
                color="success"
                isSelected={!isAiMode}
                // onValueChange={(value) => setIsAiMode(!value)}
                onValueChange={(value) => handleSwitchChange(conversation.id, value)}
              />
              <Tooltip content="Agent Mode">
                <User2 className={`w-5 h-5 ${!isAiMode ? 'text-gray-900' : 'text-gray-400'}`} />
              </Tooltip>
            </div>

            {/* <div className="flex items-center gap-2">
              <Button isIconOnly className="bg-gray-50 text-gray-600" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button isIconOnly className="bg-gray-50 text-gray-600" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly className="bg-gray-50 text-gray-600" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Chat actions">
                  <DropdownItem startContent={<Download className="w-4 h-4" />}>
                    Export Chat
                  </DropdownItem>
                  <DropdownItem startContent={<Archive className="w-4 h-4" />}>
                    Archive Chat
                  </DropdownItem>
                  <DropdownItem
                    startContent={<Flag className="w-4 h-4" />}
                    className="text-danger"
                    color="danger"
                  >
                    Report Issue
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div> */}
          </div>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="flex-1 bg-white border-x border-gray-100 p-4 overflow-y-auto min-h-0">
        <div className="space-y-4">
          {chatMessages.map((msg) => {
            // Decide if it's a user, bot, or agent
            const isUser = msg.message_type === 'User';
            const isBot = msg.message_type === 'Bot' || msg.message_type === 'AI';
            const isAgent = msg.message_type === 'Agent';

            return (
              <div
                key={msg.message_id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Left avatar (only if it's NOT the user) */}
                {!isUser && (
                  <div className="flex-shrink-0">
                    {isBot ? (
                      // Bot avatar/icon
                      (<div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-brand" />
                      </div>)
                    ) : (
                      // Otherwise assume it's an agent
                      (<User2
                        className="w-6 h-6 text-brand"
                      />)
                    )}
                  </div>
                )}
                {/* Message bubble */}
                <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
                  <div className={`rounded-2xl px-4 py-2 ${isUser
                    ? 'bg-brand text-gray-900'
                    : isBot
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-gray-100 text-gray-900'
                    }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{msg.created_at}</span>
                    {msg.status === 'read' && (
                      <CheckCheck className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* Chat Input */}
      <div className="bg-white border border-gray-100 rounded-b-lg p-4 sticky bottom-0 z-10">
        <div className="flex gap-3">
          <Input
            fullWidth
            placeholder={isAiMode ? "AI is handling the conversation..." : "Type your message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isAiMode}
            classNames={{
              input: "text-sm",
              inputWrapper: "border-gray-100"
            }}
            className='agent-reply'
          />
          <Button
            isIconOnly
            className={`${isAiMode ? 'bg-gray-100 text-gray-400' : 'bg-brand text-gray-900'}`}
            size="lg"
            onClick={handleSendMessage}
            isDisabled={isAiMode}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isAiMode ? (
          <p className="text-xs text-gray-400 mt-2">
            AI is currently handling this conversation. Switch to Agent mode to take over.
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-2">
            You are in Agent mode. AI assistance is disabled.
          </p>
        )}
      </div>
    </div >
  );
}
