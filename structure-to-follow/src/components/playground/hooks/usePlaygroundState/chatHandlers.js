import { chatService } from "../../../../api/services/chat.service";

export const useChatHandlers = (chatMessages, setChatMessages, userInput, setUserInput, setIsTyping, responseDelay) => {
  // Handle sending a message in the chat widget
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Store the current input before clearing it
    const currentInput = userInput;

    // Add user message to chat
    const userMessage = { role: 'user', content: currentInput };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);

    // Clear input and show typing indicator
    setUserInput("");
    setIsTyping(true);

    try {
      // Get the agent ID from the URL
      const pathname = window.location.pathname;
      const match = pathname.match(/\/playground\/([^\/]+)/);
      const chatId = match && match[1] ? match[1] : null;

      if (!chatId) {
        console.error("No chat ID available. Using simulated response.");
        // Add delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, responseDelay * 1000));

        // Add simulated response
        setChatMessages([...updatedMessages, {
          role: "assistant",
          content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration."
        }]);
        setIsTyping(false);
        return;
      }

      // Format chat history for the API
      const chatHistory = chatService.formatChatHistory(chatMessages);

      //console.log(`Sending message to API with chat ID: ${chatId}`);

      // Add delay if specified
      if (responseDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, responseDelay * 1000));
      }

      // Send message to API
      try {
        const response = await chatService.sendMessage(chatId, currentInput, chatHistory);

        // Handle the API response
        if (response && response.response) {
          // Add the actual API response to the chat
          setChatMessages([...updatedMessages, {
            role: 'assistant',
            content: response.response
          }]);
        } else {
          // Show a simulated response if the API is not available or configured
          setChatMessages([...updatedMessages, {
            role: 'assistant',
            content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration..."
          }]);
        }
      } catch (error) {
        console.error("Error in chat:", error);
        setChatMessages([...updatedMessages, {
          role: 'assistant',
          content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration..."
        }]);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      // Fallback to simulated response
      setChatMessages([...updatedMessages, {
        role: "assistant",
        content: "This is a simulated response. In the actual widget, the AI would respond based on your configuration."
      }]);
    } finally {
      // Always turn off typing indicator when done
      setIsTyping(false);
    }
  };

  return {
    handleSendMessage
  };
};
