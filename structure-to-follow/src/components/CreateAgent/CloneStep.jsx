import { useState, useRef, useEffect, useContext } from "react";
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner
} from "@heroui/react";
import { aiGoals } from "../playground/utils/configData";
import { Upload, Users, MessageSquare, Calendar, Copy } from "lucide-react";
import { chatService } from "../../api/services/chat.service";
import { UserDataContext } from "../../context/UserDataContext";

export default function CloneStep({ wizardData, updateWizardData }) {
  const [selectedAgentData, setSelectedAgentData] = useState({})
  const [cloneData, setCloneData] = useState(wizardData.cloneData || {
    sourceAgentId: "",
    name: "",
    goal: "",
    goalType: "",
    image: null,
  });

  // Reference to the file input element
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload the file to a server
      // For this demo, we'll create a local URL for the image
      const imageUrl = URL.createObjectURL(file);
      handleInputChange("image", imageUrl);
    }
  };

  // Trigger file input click when the upload button is clicked
  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (field, value) => {
    const updatedData = { ...cloneData, [field]: value };
    setCloneData(updatedData);
    updateWizardData({ cloneData: updatedData });
  };

  // Get user data from context
  const { userData } = useContext(UserDataContext);

  // State for storing chat agents from API
  const [chatAgents, setChatAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Fetch chat agents when component mounts
  useEffect(() => {
    const fetchAgents = async () => {
      if (!userData?.client_id) return;

      setIsLoading(true);
      setLoadError("");

      try {
        const chatData = await chatService.fetchChatIds(userData.client_id);

        if (chatData?.chat_ids) {
          // Transform chat_ids into the format expected by the component
          const transformedAgents = chatData.chat_ids.map(chat => ({
            id: chat.chat_id,
            user_id: chat.client_id,
            clientId: chat.client_id,
            name: chat.chat_config?.global_?.businessDetails?.chatConfig?.botName ||
              chat.ai_config?.bot_config?.bot_name ||
              "Unnamed Agent",
            description: chat.ai_config?.bot_config?.bot_role || "No description",
            status: "active", // Assuming all fetched chats are active
            type: chat.extra_info?.bot_goal?.name?.toLowerCase() || "customer-support",
            originalData: chat // Store the original chat data for use in cloning
          }));

          setChatAgents(transformedAgents);
        }
      } catch (error) {
        console.error("Error fetching chat agents:", error);
        setLoadError("Failed to load agents. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [userData?.client_id]);

  const handleAgentSelect = (agentId) => {
    const selected = chatAgents.find(agent => agent.id === agentId);
    if (selected) {
      //console.log("Agent selected", selected);
      setSelectedAgentData(selected);

      // Get the original chat data
      const chatData = selected.originalData;

      // Extract AI config and chat config
      const aiConfig = chatData.ai_config || {};
      const chatConfig = chatData.chat_config || {};

      // Determine the goal type based on the bot goal name
      let goalType = "customer-support";
      const botGoalName = chatData.extra_info?.bot_goal?.name?.toLowerCase() || "";

      if (botGoalName.includes("lead")) {
        goalType = "lead-generation";
      } else if (botGoalName.includes("appointment") || botGoalName.includes("book")) {
        goalType = "appointment-setter";
      }

      // Update all fields at once to ensure consistency
      const updatedData = {
        ...cloneData,
        sourceAgentId: agentId,
        name: `Copy of ${selected.name}`,
        goal: selected.description || "",
        goalType: goalType,
        // Store the original data for use in the handleFinish method
        originalData: chatData
      };

      setCloneData(updatedData);
      updateWizardData({ cloneData: updatedData });

      //console.log("Updated cloneData:", updatedData);
    }
  };

  // Fix dropdown z-index by targeting the portal wrapper
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Target HeroUI dropdown portal wrapper directly */
      div[style*="position: absolute"][style*="z-index"] {
        z-index: 2147483647 !important;
      }
      
      /* More specific targeting for dropdowns */
      div[style*="position: absolute"][data-slot="base"][role="dialog"] {
        z-index: 2147483647 !important;
      }
      
      /* Target the parent wrapper */
      div[style*="position: absolute"] > div[style*="opacity"][style*="transform"] {
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);


  return (
    <div className="space-y-4 px-1">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Agent to Clone <span className="text-red-500">*</span>
        </label>
        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
              className="w-full justify-between"
              endContent={<span className="text-small">▼</span>}
            >
              {selectedAgentData.id ? (
                <div className="flex items-center">
                  <Copy className="w-4 h-4 mr-2 text-gray-500" />
                  <span>{selectedAgentData.name}</span>
                </div>
              ) : (
                "Select an agent to clone"
              )}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Available Agents"
            selectionMode="single"
            selectedKeys={selectedAgentData.id ? [selectedAgentData.id] : []}
            onSelectionChange={(keys) => {
              //console.log("Selection changed, keys:", keys);
              const selectedId = Array.from(keys)[0];
              //console.log("Selected ID:", selectedId);
              if (selectedId) {
                handleAgentSelect(selectedId);
              }
            }}
          >
            {isLoading ? (
              <DropdownItem key="loading" textValue="Loading..." isDisabled>
                <div className="flex items-center justify-center py-2">
                  <Spinner size="sm" className="mr-2" />
                  <span>Loading agents...</span>
                </div>
              </DropdownItem>
            ) : loadError ? (
              <DropdownItem key="error" textValue="Error" isDisabled>
                <div className="text-danger text-center py-2">
                  {loadError}
                </div>
              </DropdownItem>
            ) : chatAgents.length === 0 ? (
              <DropdownItem key="no-agents" textValue="No agents found" isDisabled>
                <div className="text-center py-2">
                  No agents found. Create one first.
                </div>
              </DropdownItem>
            ) : (
              chatAgents.map((agent) => (
                <DropdownItem key={agent.id} textValue={agent.name}>
                  <div className="flex flex-col">
                    <span>{agent.name}</span>
                    <span className="text-xs text-gray-500">{agent.description}</span>
                  </div>
                </DropdownItem>
              ))
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      {selectedAgentData.id && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Agent Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter name for the cloned agent"
              variant="bordered"
              value={cloneData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Goal <span className="text-red-500">*</span>
            </label>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="w-full justify-between"
                  endContent={<span className="text-small">▼</span>}
                >
                  {cloneData.goalType ? (
                    <div className="flex items-center">
                      {cloneData.goalType === "customer-support" && <MessageSquare className="w-4 h-4 mr-2" />}
                      {cloneData.goalType === "lead-generation" && <Users className="w-4 h-4 mr-2" />}
                      {cloneData.goalType === "appointment-setter" && <Calendar className="w-4 h-4 mr-2" />}
                      <span>
                        {cloneData.goalType === "customer-support" && "Customer Support"}
                        {cloneData.goalType === "lead-generation" && "Lead Generation"}
                        {cloneData.goalType === "appointment-setter" && "Appointment Setter"}
                      </span>
                    </div>
                  ) : (
                    "Select agent goal"
                  )}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Agent Goals"
                selectionMode="single"
                selectedKeys={cloneData.goalType ? [cloneData.goalType] : []}
                onSelectionChange={(keys) => {
                  const selectedGoal = Array.from(keys)[0];
                  if (selectedGoal) {
                    handleInputChange("goalType", selectedGoal);
                  }
                }}
              >
                <DropdownItem key="customer-support" textValue="Customer Support">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    <span>Customer Support</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="lead-generation" textValue="Lead Generation">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Lead Generation</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="appointment-setter" textValue="Appointment Setter">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Appointment Setter</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              rows={3}
              placeholder="Describe what this agent should accomplish"
              value={cloneData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Image <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Upload a profile picture for your agent</p>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200"
              >
                {cloneData.image ? (
                  <img
                    src={cloneData.image}
                    alt="Agent"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-xs">No image</div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="bordered"
                  className="h-10"
                  startContent={<Upload className="w-4 h-4 text-gray-500" />}
                  onPress={handleImageUploadClick}
                >
                  Upload Image
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: Square image, at least 200x200px
            </p>
          </div>
        </>
      )}
    </div>
  );
}
