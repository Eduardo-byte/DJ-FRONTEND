import React, { useContext } from "react";
import { Accordion, AccordionItem, Input, Button } from "@heroui/react";
import { Bot, Upload } from "lucide-react";

const BotIdentity = ({
  botName,
  setBotName,
  introMessage,
  setIntroMessage,
  avatarImage,
  handleFileUpload,
  avatarMessage,
  setAvatarMessage
}) => {

  return (
    <>
      <Accordion
        variant="bordered"
        className="bg-white border border-gray-100"
        defaultExpandedKeys={["1"]}
      >
        <AccordionItem
          key="1"
          aria-label="Agent Identity"
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Bot className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Agent Identity</span>
            </div>
          }
          subtitle="Configure your agent's name, introduction message, and avatar"
        >
          <div className="px-4 py-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent name</label>
              <Input
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Enter agent name"
                size="sm"
                aria-label="Agent name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Introduction message</label>
              <Input
                value={introMessage}
                onChange={(e) => setIntroMessage(e.target.value)}
                placeholder="Hi there, how can I help you today?"
                size="sm"
                aria-label="Introduction message"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Popup Message</label>
              <Input
                value={avatarMessage}
                onChange={(e) => setAvatarMessage(e.target.value)}
                placeholder="Hi there"
                size="sm"
                aria-label="Avatar Popup Message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Image</label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {avatarImage ? (
                    <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Bot className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <Button
                  variant="bordered"
                  startContent={<Upload className="w-4 h-4" />}
                  size="sm"
                  as="label"
                  htmlFor="avatar-upload"
                  aria-label="Upload avatar image"
                >
                  Upload
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    aria-label="Upload avatar image file"
                  />
                </Button>
                <p className="text-xs text-gray-500">File size should not exceed 1MB.</p>
              </div>
            </div>
          </div>
        </AccordionItem>
      </Accordion>
    </>
  );
};

export default BotIdentity;
