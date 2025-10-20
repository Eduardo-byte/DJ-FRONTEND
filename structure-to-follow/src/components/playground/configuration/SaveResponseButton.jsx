import React from "react";
import { Tooltip } from "@heroui/react";
import { ThumbsUp } from "lucide-react";

const SaveResponseButton = ({ messageIndex, feedbackType, onGiveFeedback }) => {
  // Handle saving the response
  const handleSaveResponse = () => {
    onGiveFeedback(messageIndex, 'positive');
    // alert("Message saved!");
  };

  const isSelected = feedbackType === 'positive';

  return (
    <Tooltip content="Save this response">
      <button
        className={`p-1 rounded-full hover:bg-gray-200 ${isSelected ? 'bg-green-100' : ''}`}
        onClick={handleSaveResponse}
        aria-label="Save response"
      >
        <ThumbsUp size={12} className={`${isSelected ? 'text-green-500' : 'text-gray-500'}`} />
      </button>
    </Tooltip>
  );
};

export default SaveResponseButton;
