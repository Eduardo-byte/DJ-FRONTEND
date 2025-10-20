import React from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
} from "@heroui/react";
import { ChevronDown, Search, Save } from "lucide-react";

const TrainingHeader = ({
  selectedChatbot,
  filteredChatbots,
  searchQuery,
  setSearchQuery,
  handleSelectChatbot,
  handleApplyChanges,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Dropdown aria-label="Chatbot selection dropdown">
          <DropdownTrigger>
            <Button 
              variant="bordered" 
              endContent={<ChevronDown className="w-4 h-4" />}
              size="sm"
              className="min-w-[180px]"
              aria-label="Select a chatbot"
            >
              {selectedChatbot ? selectedChatbot.name : "Select Chatbot"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Chatbot Selection"
            variant="flat"
            closeOnSelect={true}
            selectionMode="single"
            selectedKeys={selectedChatbot ? [selectedChatbot.id] : []}
            onSelectionChange={(keys) => {
              const selectedId = Array.from(keys)[0];
              const selected = filteredChatbots.find(chatbot => chatbot.id === selectedId);
              if (selected) handleSelectChatbot(selected);
            }}
          >
            <DropdownItem key="search" className="gap-0" textValue="Search">
              <Input
                classNames={{
                  base: "w-full",
                  inputWrapper: "border-gray-200",
                }}
                placeholder="Search chatbots..."
                size="sm"
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                isClearable
                onClear={() => setSearchQuery("")}
                aria-label="Search for chatbots"
              />
            </DropdownItem>
            {filteredChatbots.map((chatbot) => (
              <DropdownItem 
                key={chatbot.id} 
                description={chatbot.description}
                textValue={chatbot.name}
              >
                {chatbot.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
      <Button
        className="bg-brand text-gray-900"
        startContent={<Save className="w-4 h-4" />}
        size="sm"
        onClick={handleApplyChanges}
        aria-label="Apply training changes"
      >
        Apply Changes
      </Button>
    </div>
  );
};

export default TrainingHeader;
