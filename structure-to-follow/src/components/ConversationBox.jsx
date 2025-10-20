import { useState } from 'react'
import {
  Input,
  Button,
  Avatar,
  Switch,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react"
import {
  Send,
  Bot,
  User2,
  MoreVertical,
  PlusCircle,
  Download,
  Archive,
  Flag
} from "lucide-react"

export default function ConversationBox({ conversation, onClose }) {
  const [isAiMode, setIsAiMode] = useState(true)
  const [message, setMessage] = useState('')

  // Mock messages for demonstration
  const messages = [
    {
      id: 1,
      type: 'user',
      content: 'Hi, I have a question about your service',
      timestamp: '10:30 AM',
      sender: {
        name: conversation.user.name,
        avatar: conversation.user.avatar
      }
    },
    {
      id: 2,
      type: 'ai',
      content: 'Hello! I\'m here to help. What would you like to know?',
      timestamp: '10:31 AM',
      sender: {
        name: 'AI Assistant',
        avatar: null
      }
    },
    {
      id: 3,
      type: 'user',
      content: 'What are your business hours?',
      timestamp: '10:31 AM',
      sender: {
        name: conversation.user.name,
        avatar: conversation.user.avatar
      }
    },
    {
      id: 4,
      type: 'ai',
      content: 'Our business hours are Monday to Friday, 9 AM to 6 PM EST.',
      timestamp: '10:32 AM',
      sender: {
        name: 'AI Assistant',
        avatar: null
      }
    }
  ]

  const handleSendMessage = () => {
    if (!message.trim()) return
    // Add message sending logic here
    setMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-lg h-[calc(100vh-13rem)] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={conversation.user.avatar}
              className="w-10 h-10"
            />
            {conversation.user.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.user.name}</h3>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: conversation.user.online ? '#22C55E' : '#9CA3AF'
                }}
              />
              <span className="text-sm text-gray-500">
                {conversation.user.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bot className={`w-4 h-4 ${isAiMode ? 'text-brand' : 'text-gray-400'}`} />
            <Switch
              size="sm"
              color="success"
              isSelected={!isAiMode}
              onValueChange={(value) => setIsAiMode(!value)}
            />
            <User2 className={`w-4 h-4 ${!isAiMode ? 'text-green-500' : 'text-gray-400'}`} />
          </div>

          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                className="text-gray-500"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Conversation actions">
              <DropdownItem
                startContent={<PlusCircle className="w-4 h-4" />}
              >
                Add to Contacts
              </DropdownItem>
              <DropdownItem
                startContent={<Download className="w-4 h-4" />}
              >
                Export Chat
              </DropdownItem>
              <DropdownItem
                startContent={<Archive className="w-4 h-4" />}
              >
                Archive
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
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
          >
            {msg.type !== 'user' && (
              <div className="flex-shrink-0">
                {msg.sender.avatar ? (
                  <Avatar
                    src={msg.sender.avatar}
                    className="w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand" />
                  </div>
                )}
              </div>
            )}
            <div className={`max-w-[70%] ${msg.type === 'user' ? 'order-1' : 'order-2'
              }`}>
              <div className={`rounded-lg p-3 ${msg.type === 'user'
                  ? 'bg-brand text-gray-900'
                  : 'bg-gray-100 text-gray-900'
                }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">
                {msg.timestamp}
              </span>
            </div>
            {msg.type === 'user' && (
              <div className="flex-shrink-0 order-2">
                <Avatar
                  src={msg.sender.avatar}
                  className="w-8 h-8"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex gap-2">
          <Input
            placeholder={`Type a message... (${isAiMode ? 'AI Mode' : 'Agent Mode'})`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            endContent={
              <Tooltip content="Send message">
                <Button
                  isIconOnly
                  className="bg-brand text-gray-900"
                  size="sm"
                  onClick={handleSendMessage}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </Tooltip>
            }
          />
        </div>
        {!isAiMode && (
          <p className="text-xs text-gray-400 mt-2">
            You are in Agent mode. AI assistance is disabled.
          </p>
        )}
      </div>
    </div>
  )
}
