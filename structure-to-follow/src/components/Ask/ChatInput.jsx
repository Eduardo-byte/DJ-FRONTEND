import React, { useState, useRef } from 'react';
import { Button, Textarea } from '@heroui/react';
import { Send, Mic, X, FileText, Globe, Image } from 'lucide-react';
import { toast } from 'sonner';
import ToolsDropdown from './ToolsDropdown';
import PlusDropdown from './PlusDropdown';

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  onSendMessage, 
  isLoading, 
  isEmpty, 
  isTransitioning,
  customTools,
  onToolsUpdate,
  userChats,
  onBusinessToolsUpdate,
  isSearchEnabled,
  onSearchToggle,
  isImageEnabled,
  onImageToggle
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // File handling functions
  const handleFileUpload = (files) => {
    // Check if adding new files would exceed the 4 file limit
    const remainingSlots = 4 - uploadedFiles.length;
    
    if (remainingSlots <= 0) {
      toast.error('Maximum of 4 files allowed');
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      // Accept images and common document types
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      
      return true;
    });

    // Limit to remaining slots
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (validFiles.length > remainingSlots) {
      toast.error(`Only ${remainingSlots} more file(s) can be added. Maximum of 4 files allowed.`);
    }

    if (filesToAdd.length > 0) {
      const newFiles = filesToAdd.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Drag and drop handlers for the input area
  const handleInputDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleInputDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the input container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleInputDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const clearFiles = () => {
    // Clean up object URLs
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setUploadedFiles([]);
  };

  // Clear files when sending message
  const handleSend = () => {
    onSendMessage();
    clearFiles();
  };

  return (
    <div className={`mx-auto transition-all duration-800 ${
      isEmpty && !isTransitioning ? 'max-w-3xl' : 'max-w-4xl'
    }`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* File Preview Area */}
      {uploadedFiles.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="relative"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shadow-sm">
                    <FileText className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="absolute -top-2 -right-2 w-6 h-6 min-w-6 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-600 shadow-sm"
                  onPress={() => removeFile(file.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        className={`bg-white border shadow-sm transition-all duration-800 ${
          isDragOver 
            ? 'border-blue-500 border-2' 
            : 'border-gray-200'
        } ${
          isEmpty && !isTransitioning 
            ? 'rounded-3xl hover:shadow-md' 
            : 'rounded-2xl'
        }`}
        onDragOver={handleInputDragOver}
        onDragLeave={handleInputDragLeave}
        onDrop={handleInputDrop}
      >
        <div className="p-4">
          {/* Text Input - moved to top for more space */}
          <div className="mb-3">
            <Textarea
              ref={textareaRef}
              placeholder="Ask anything"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={isEmpty && !isTransitioning ? 6 : 4}
              variant="flat"
              classNames={{
                base: "w-full",
                input: "text-base resize-none border-0 focus:ring-0 bg-transparent",
                inputWrapper: "border-0 bg-transparent shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent"
              }}
            />
          </div>

          {/* Bottom row with all buttons */}
          <div className="flex items-center justify-between">
            {/* Left side - Tool buttons */}
            <div className="flex items-center">
              {/* Plus Dropdown */}
              <PlusDropdown 
                className={`text-gray-500 hover:text-gray-700 transition-all duration-800 ${
                  isEmpty && !isTransitioning ? 'mr-3' : 'mr-2'
                }`}
                isEmpty={isEmpty}
                isTransitioning={isTransitioning}
                onFileUpload={triggerFileInput}
              />

              {/* Search Toggle Button - only show when search is enabled */}
              {isSearchEnabled && (
                <Button
                  variant="light"
                  size="sm"
                  className={`text-gray-900 hover:text-gray-900 bg-brand/20 hover:bg-brand/30 transition-all duration-800 ${
                    isEmpty && !isTransitioning ? 'mr-3' : 'mr-2'
                  }`}
                  onPress={() => onSearchToggle(false)}
                  title="Web search enabled - click to disable"
                  startContent={<Globe className="w-4 h-4" />}
                  endContent={<X className="w-3 h-3 opacity-60" />}
                >
                  <span className="text-sm">Search</span>
                </Button>
              )}

              {/* Image Toggle Button - only show when image is enabled */}
              {isImageEnabled && (
                <Button
                  variant="light"
                  size="sm"
                  className={`text-gray-900 hover:text-gray-900 bg-brand/20 hover:bg-brand/30 transition-all duration-800 ${
                    isEmpty && !isTransitioning ? 'mr-3' : 'mr-2'
                  }`}
                  onPress={() => onImageToggle(false)}
                  title="Image generation enabled - click to disable"
                  startContent={<Image className="w-4 h-4" />}
                  endContent={<X className="w-3 h-3 opacity-60" />}
                >
                  <span className="text-sm">Image</span>
                </Button>
              )}

              {/* Tools Dropdown */}
              <ToolsDropdown 
                className="mx-2 text-gray-500 hover:text-gray-700"
                customTools={customTools}
                onToolsUpdate={onToolsUpdate}
                userChats={userChats}
                onBusinessToolsUpdate={onBusinessToolsUpdate}
                onSearchToggle={onSearchToggle}
                isSearchEnabled={isSearchEnabled}
                onImageToggle={onImageToggle}
                isImageEnabled={isImageEnabled}
              />
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center">
              {/* Voice Button */}
              <Button
                isIconOnly
                variant="light"
                className="mr-2 text-gray-500 hover:text-gray-700"
                size="sm"
              >
                <Mic className="w-5 h-5" />
              </Button>

              {/* Send Button */}
              <Button
                isIconOnly
                color="primary"
                className="bg-brand hover:bg-brand-dark text-gray-900"
                size="sm"
                onPress={handleSend}
                isDisabled={!inputValue.trim() || isLoading}
                isLoading={isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-3">
        <p className="text-xs text-gray-500">
          OliviaAI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
