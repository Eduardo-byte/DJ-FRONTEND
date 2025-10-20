import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionItem, Button, Switch, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { Wrench, Search, Plus, Edit, Trash2, Code, CheckCircle, XCircle, Play, Copy } from "lucide-react";
import { chatService } from "../../../api/services/chat.service.js";
import { setValueAtPath } from "../../../utils/chatUtils.js";
import { UserDataContext } from "../../../context/UserDataContext.jsx";
import ImageSupportConfig from './ImageSupportConfig.jsx';

const AgentTools = ({
  setSelectedAgent,
  selectedAgent,
  webSearchEnabled,
  setWebSearchEnabled,
  customTools,
  setCustomTools,
  customToolsInstructions,
  setCustomToolsInstructions
}) => {
  // Additional instructions state
  const [agentInstructions, setAgentInstructions] = useState("");
  // Get chat ID from URL parameters
  const [chatId, setChatId] = useState(null);
  
  useEffect(() => {
    // Extract agent ID from URL
    const pathname = window.location.pathname;
    const match = pathname.match(/\/playground\/([^\/]+)/);
    if (match && match[1]) {
      setChatId(match[1]);
    }
  }, []);
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolForm, setToolForm] = useState({
    tool_name: "",
    description: "",
    payload: {
      url: "",
      method: "GET",
      headers: {},
      params: [],
      body: []
    }
  });
  const [newHeader, setNewHeader] = useState({ key: "", value: "" });
  const [newParam, setNewParam] = useState({ type: "string", name: "", description: "", required: true });
  const [newBodyField, setNewBodyField] = useState({ type: "string", name: "", description: "", required: true });
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false);
  const [endpointValidation, setEndpointValidation] = useState(null); // null, 'success', 'error'
  const [validationResponse, setValidationResponse] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [testValues, setTestValues] = useState({ params: {}, body: {} });
  const [copySuccess, setCopySuccess] = useState({ success: false, error: false });
  const [imageSupportConfig, setImageSupportConfig] = useState({
    enabled: false,
    config: null
  });
  const { loggedInUser, userData } = useContext(UserDataContext);
  const navigate = useNavigate();
  const isPremium = loggedInUser.account_type !== "basic" && loggedInUser.account_type !== "free";

  // Load current agent data when component mounts or chatId changes
  useEffect(() => {
    const loadAgentData = async () => {
      if (!chatId) {
        return;
      }

      try {
        const agentData = await chatService.fetchChatbyId(chatId);
        if (agentData) {
          // Set web search enabled state
          if (agentData.web_search_tool !== undefined) {
            setWebSearchEnabled(agentData.web_search_tool);
          }

          // Set custom tools state
          if (agentData.custom_tools) {
            setCustomTools(agentData.custom_tools);
          }

          //here set the custom_tool_instructions
          if (agentData.custom_tool_instructions) {
            setCustomToolsInstructions(agentData.custom_tool_instructions);
          }

          //console.log("Agent tools data loaded successfully");
        }
      } catch (error) {
        console.error("Error loading agent tools data:", error);
      }
    };

    loadAgentData();
  }, [chatId, setWebSearchEnabled, setCustomTools]);

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

  // Update agent configuration in database
  const updateAgentTools = async (webSearchTool, customToolsData) => {
    if (!chatId) {
      console.error("No chat_id found in URL");
      return;
    }

    try {
      const updateData = {
        web_search_tool: webSearchTool,
        custom_tools: customToolsData,
        custom_tool_instructions: customToolsInstructions
      };

      const result = await chatService.updateAgent(chatId, updateData);
      if (result) {
        let updatedOriginalData = selectedAgent.originalData;
        updatedOriginalData = setValueAtPath(updatedOriginalData, "web_search_tool", webSearchTool);
        updatedOriginalData = setValueAtPath(updatedOriginalData, "custom_tools", customToolsData);
        updatedOriginalData = setValueAtPath(updatedOriginalData, "custom_tool_instructions", customToolsInstructions);
        setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
        //console.log("Agent tools updated successfully");
      } else {
        console.error("Failed to update agent tools");
      }
    } catch (error) {
      console.error("Error updating agent tools:", error);
    }
  };

  // Handle web search toggle change
  const handleWebSearchToggle = async (checked) => {
    setWebSearchEnabled(checked);
    await updateAgentTools(checked, customTools);
  };

  // Helper functions
  const resetToolForm = () => {
    setToolForm({
      tool_name: "",
      description: "",
      payload: {
        url: "",
        method: "GET",
        headers: {},
        params: [],
        body: []
      }
    });
    setEditingTool(null);
    // Reset image configuration
    setImageSupportConfig({
      enabled: false,
      config: null
    });
  };

  const openToolModal = (tool = null) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm(tool);
      // Load image configuration if it exists
      if (tool.imageSupport) {
        setImageSupportConfig(tool.imageSupport);
      } else {
        setImageSupportConfig({
          enabled: false,
          config: null
        });
      }
    } else {
      resetToolForm();
    }
    setIsToolModalOpen(true);
  };

  const closeToolModal = () => {
    setIsToolModalOpen(false);
    resetToolForm();
  };

  const addHeader = () => {
    if (newHeader.key && newHeader.value) {
      setToolForm(prev => ({
        ...prev,
        payload: {
          ...prev.payload,
          headers: {
            ...prev.payload.headers,
            [newHeader.key]: newHeader.value
          }
        }
      }));
      setNewHeader({ key: "", value: "" });
    }
  };

  const removeHeader = (key) => {
    setToolForm(prev => {
      const newHeaders = { ...prev.payload.headers };
      delete newHeaders[key];
      return {
        ...prev,
        payload: {
          ...prev.payload,
          headers: newHeaders
        }
      };
    });
  };

  const addParam = () => {
    if (newParam.name && newParam.description) {
      setToolForm(prev => ({
        ...prev,
        payload: {
          ...prev.payload,
          params: [...prev.payload.params, { ...newParam }]
        }
      }));
      setNewParam({ type: "string", name: "", description: "", required: true });
    }
  };

  const removeParam = (index) => {
    setToolForm(prev => ({
      ...prev,
      payload: {
        ...prev.payload,
        params: prev.payload.params.filter((_, i) => i !== index)
      }
    }));
  };

  const addBodyField = () => {
    if (newBodyField.name && newBodyField.description) {
      setToolForm(prev => ({
        ...prev,
        payload: {
          ...prev.payload,
          body: [...prev.payload.body, { ...newBodyField }]
        }
      }));
      setNewBodyField({ type: "string", name: "", description: "", required: true });
    }
  };

  const removeBodyField = (index) => {
    setToolForm(prev => ({
      ...prev,
      payload: {
        ...prev.payload,
        body: prev.payload.body.filter((_, i) => i !== index)
      }
    }));
  };

  const saveTool = async () => {
    if (!toolForm.tool_name || !toolForm.description || !toolForm.payload.url) {
      return;
    }

    // Create tool with image configuration
    const toolWithImageConfig = {
      ...toolForm,
      imageSupport: imageSupportConfig
    };

    const newTools = customTools || [];
    if (editingTool) {
      const index = newTools.findIndex(t => t.tool_name === editingTool.tool_name);
      if (index >= 0) {
        newTools[index] = toolWithImageConfig;
      }
    } else {
      newTools.push(toolWithImageConfig);
    }

    setCustomTools(newTools);
    await updateAgentTools(webSearchEnabled, newTools);
    closeToolModal();
  };

  const deleteTool = async (toolName) => {
    const newTools = (customTools || []).filter(t => t.tool_name !== toolName);
    setCustomTools(newTools);
    await updateAgentTools(webSearchEnabled, newTools);
  };

  // Get method badge color based on HTTP method
  const getMethodBadgeColor = (method) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-500';
      case 'POST':
        return 'bg-green-500/10 text-green-500';
      case 'PUT':
        return 'bg-orange-500/10 text-orange-500';
      case 'PATCH':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'DELETE':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Copy response data to clipboard
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopySuccess(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Test endpoint validation
  const testEndpoint = async () => {
    if (!toolForm.payload.url) return;

    setIsTestingEndpoint(true);
    setEndpointValidation(null);
    setValidationResponse(null);
    setValidationError(null);

    try {
      // Build the test URL with user-provided parameter values
      let testUrl = toolForm.payload.url;
      if (toolForm.payload.params.length > 0 && toolForm.payload.method === "GET") {
        const urlParams = toolForm.payload.params.map(param => {
          const userValue = testValues.params[param.name];
          let paramValue;

          if (userValue !== undefined && userValue !== '') {
            paramValue = userValue;
          } else {
            // Fallback to sample values if user didn't provide any
            switch (param.type) {
              case 'number': paramValue = '0'; break;
              case 'boolean': paramValue = 'true'; break;
              default: paramValue = ''; break;
            }
          }
          return `${param.name}=${encodeURIComponent(paramValue)}`;
        }).join('&');
        testUrl += `?${urlParams}`;
      }

      // Prepare request options
      const requestOptions = {
        method: toolForm.payload.method,
        headers: {
          'Content-Type': 'application/json',
          ...toolForm.payload.headers
        }
      };

      // Add body for POST/PUT/PATCH requests
      if ((toolForm.payload.method === "POST" || toolForm.payload.method === "PUT" || toolForm.payload.method === "PATCH") && toolForm.payload.body && toolForm.payload.body.length > 0) {
        // Convert body fields array to JSON object using user-provided values
        const bodyObject = {};
        toolForm.payload.body.forEach(field => {
          const userValue = testValues.body[field.name];
          let fieldValue;

          if (userValue !== undefined && userValue !== '') {
            // Use user-provided value
            switch (field.type) {
              case 'number':
                fieldValue = parseFloat(userValue) || 0;
                break;
              case 'boolean':
                fieldValue = userValue === 'true';
                break;
              case 'object':
              case 'array':
                try {
                  fieldValue = JSON.parse(userValue);
                } catch {
                  fieldValue = userValue; // Keep as string if JSON parsing fails
                }
                break;
              default:
                fieldValue = userValue;
                break;
            }
          } else {
            // Fallback to sample values if user didn't provide any
            switch (field.type) {
              case 'number': fieldValue = 123; break;
              case 'boolean': fieldValue = true; break;
              case 'object': fieldValue = {}; break;
              case 'array': fieldValue = []; break;
              default: fieldValue = 'test'; break;
            }
          }
          bodyObject[field.name] = fieldValue;
        });
        requestOptions.body = JSON.stringify(bodyObject);
      }

      // Make the API call
      const response = await fetch(testUrl, requestOptions);
      const responseData = await response.text();

      if (response.ok) {
        setEndpointValidation('success');
        setValidationResponse({
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
      } else {
        setEndpointValidation('error');
        setValidationError({
          status: response.status,
          statusText: response.statusText,
          message: responseData
        });
      }
    } catch (error) {
      setEndpointValidation('error');
      setValidationError({
        status: 'Network Error',
        statusText: 'Failed to connect',
        message: error.message
      });
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  return (
    <Accordion
      variant="bordered"
      className="bg-white border border-gray-100"
      defaultExpandedKeys={["1"]}
    >
      <AccordionItem
        key="1"
        aria-label="Agent Tools"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand/10">
              <Wrench className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Agent Tools</span>
          </div>
        }
        subtitle="Configure tools and integrations for your agent"
      >
        <div className="px-4 py-2 space-y-4">
          {/* Agent Tools Title, Description, and Instructions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tool Instructions <span className=" italic text-xs text-black/40">(Optional)</span></h3>
            <p className="text-sm text-gray-600 mb-3">
              Provide instructions or context to help the AI agent make better decisions when selecting and using custom tools.
            </p>
            <Textarea
              label="Tool Instructions"
              placeholder="Describe how the AI agent should choose and use the custom tools. For example: 'Use the CRM tool for all contact lookups, prefer the analytics tool for reporting, only use the email tool for urgent notifications, etc.'"
              value={typeof customToolsInstructions !== "undefined" ? customToolsInstructions : ""}
              onChange={e => setCustomToolsInstructions(e.target.value)}
              minRows={3}
              maxRows={6}
              className="mt-2"
            />
          </div>
          {/* Web Search Tool */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold text-gray-800">Available Tools</h3>
            </div>
            {/* Web Search Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Web Search</h4>
                    <p className="text-xs text-gray-500">
                      Allow your agent to search the web for real-time information
                    </p>
                    {!isPremium &&
                      <span className="text-xs text-red-500">Upgrade your account to pro to unlock full potential</span>
                    }
                  </div>
                </div>
                {/* <Switch
                  isSelected={webSearchEnabled}
                  onChange={(e) => handleWebSearchToggle(e.target.checked)}
                  size="sm"
                  aria-label="Toggle web search"
                /> */}
                {isPremium ? (
                  <Switch
                    isSelected={webSearchEnabled}
                    onChange={(e) => handleWebSearchToggle(e.target.checked)}
                    size="sm"
                    aria-label="Toggle web search"
                  />
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="bg-brand text-gray-900"
                      onPress={() => navigate("/profile")}
                    >
                      Upgrade to Pro
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Custom Tools Section */}
          <div className="bg-white rounded-lg border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-800">Custom Tools</h3>
              </div>
              {/* <Button
                size="sm"
                className="bg-brand text-gray-900"
                startContent={<Plus size={14} />}
                onPress={() => openToolModal()}
              >
                Add Tool
              </Button> */}
              {isPremium ? (
                <Button
                  size="sm"
                  className="bg-brand text-gray-900"
                  startContent={<Plus size={14} />}
                  onPress={() => openToolModal()}
                >
                  Add Tool
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="bg-brand text-gray-900"
                    onPress={() => navigate("/profile")}
                  >
                    Upgrade to Pro
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Create custom API integrations for your agent to call external services
            </p>
            {!isPremium &&
              <span className="text-xs text-red-500">Upgrade your account to pro to unlock full potential</span>
            }
            {/* Custom Tools List */}
            <div className="space-y-3">
              {customTools && customTools.length > 0 ? (
                customTools.map((tool, index) => (
                  <div key={index} className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Icon with method badge */}
                        <div className="relative">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                            <Code className="w-4 h-4 text-purple-600" />
                          </div>
                        </div>

                        {/* Tool info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-start gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate">{tool.tool_name}</h4>
                            <p className="text-sm italic text-gray-600/80 line-clamp-2">({tool.description})</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`${getMethodBadgeColor(tool.payload.method)} px-2 py-1 rounded text-xs font-medium`}>
                              {tool.payload.method}
                            </span>
                            <span className="text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded  truncate max-w-xs">
                              {tool.payload.url}
                            </span>
                            {tool.payload.params.length > 0 && (
                              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded  text-xs">
                                {tool.payload.params.length} param{tool.payload.params.length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {Object.keys(tool.payload.headers).length > 0 && (
                              <span className="text-green-600 bg-green-50 px-2 py-1 rounded  text-xs">
                                {Object.keys(tool.payload.headers).length} header{Object.keys(tool.payload.headers).length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {tool.payload.body && tool.payload.body.length > 0 && (
                              <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded  text-xs">
                                {tool.payload.body.length} body field{tool.payload.body.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => openToolModal(tool)}
                          className="hover:bg-gray-100"
                        >
                          <Edit size={16} className="text-gray-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => deleteTool(tool.tool_name)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No custom tools configured</p>
                  <p className="text-xs">Add your first custom API integration</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Tool Modal */}
        <Modal
          isOpen={isToolModalOpen}
          onClose={closeToolModal}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader>
              {editingTool ? "Edit Custom Tool" : "Add Custom Tool"}
            </ModalHeader>
            <ModalBody className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <Input
                  label="Tool Name"
                  placeholder="e.g., Search X (Twitter)"
                  value={toolForm.tool_name}
                  onChange={(e) => setToolForm(prev => ({ ...prev, tool_name: e.target.value }))}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe what this tool does"
                  value={toolForm.description}
                  onChange={(e) => setToolForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* API Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-800">API Configuration</h4>

                {/* HTTP Method */}
                <div>
                  <Select
                    label="HTTP Method"
                    selectedKeys={[toolForm.payload.method]}
                    onSelectionChange={(keys) => {
                      const method = Array.from(keys)[0];
                      setToolForm(prev => ({
                        ...prev,
                        payload: { ...prev.payload, method }
                      }));
                    }}
                    className="max-w-xs"
                  >
                    <SelectItem key="GET">GET</SelectItem>
                    <SelectItem key="POST">POST</SelectItem>
                    <SelectItem key="PUT">PUT</SelectItem>
                    <SelectItem key="PATCH">PATCH</SelectItem>
                    <SelectItem key="DELETE">DELETE</SelectItem>
                  </Select>
                </div>

                {/* Base URL */}
                <div>
                  <Input
                    label="Base URL"
                    placeholder="https://api.example.com/endpoint"
                    value={toolForm.payload.url}
                    onChange={(e) => setToolForm(prev => ({
                      ...prev,
                      payload: { ...prev.payload, url: e.target.value }
                    }))}
                  />
                </div>

                {/* URL Preview */}
                {toolForm.payload.params.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                    <p className="text-xs font-medium text-blue-800 mb-1">URL Preview:</p>
                    <code className="text-xs text-blue-700 break-all">
                      <span className="font-medium">{toolForm.payload.method}</span>{" "}
                      <span>{toolForm.payload.url}</span>
                      <span className="text-orange-600">
                        ?{toolForm.payload.params.map((param, index) =>
                          `${param.name}={${param.name}}`
                        ).join('&')}
                      </span>
                    </code>
                  </div>
                )}

                {/* Headers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-700">Headers</h5>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    🔒 All API keys and sensitive headers are encrypted and stored securely
                  </p>
                  <div className="space-y-2">
                    {Object.entries(toolForm.payload.headers).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Input size="sm" value={key} isReadOnly aria-label="Header key" />
                        <Input size="sm" value={value} isReadOnly aria-label="Header value" />
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => removeHeader(key)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        size="sm"
                        placeholder="Header key"
                        value={newHeader.key}
                        onChange={(e) => setNewHeader(prev => ({ ...prev, key: e.target.value }))}
                        aria-label="New header key"
                      />
                      <Input
                        size="sm"
                        placeholder="Header value"
                        value={newHeader.value}
                        onChange={(e) => setNewHeader(prev => ({ ...prev, value: e.target.value }))}
                        aria-label="New header value"
                      />
                      <Button
                        size="sm"
                        variant="light"
                        onPress={addHeader}
                        isDisabled={!newHeader.key || !newHeader.value}
                      >
                        <Plus size={12} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Parameters</h5>
                  <div className="space-y-2">
                    {toolForm.payload.params.map((param, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="text-xs font-medium">{param.name} ({param.type})</div>
                          <div className="text-xs text-gray-500">{param.description}</div>
                          {param.required && <Chip size="sm" color="warning" variant="flat">Required</Chip>}
                        </div>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          onPress={() => removeParam(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-2">
                        <Select
                          size="sm"
                          selectedKeys={[newParam.type]}
                          onSelectionChange={(keys) => {
                            const type = Array.from(keys)[0];
                            setNewParam(prev => ({ ...prev, type }));
                          }}
                          aria-label="Parameter type"
                        >
                          <SelectItem key="string">String</SelectItem>
                          <SelectItem key="number">Number</SelectItem>
                          <SelectItem key="boolean">Boolean</SelectItem>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          size="sm"
                          placeholder="Parameter name"
                          value={newParam.name}
                          onChange={(e) => setNewParam(prev => ({ ...prev, name: e.target.value }))}
                          aria-label="Parameter name"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          size="sm"
                          placeholder="Description"
                          value={newParam.description}
                          onChange={(e) => setNewParam(prev => ({ ...prev, description: e.target.value }))}
                          aria-label="Parameter description"
                        />
                      </div>
                      <div className="col-span-1">
                        <Switch
                          size="sm"
                          isSelected={newParam.required}
                          onValueChange={(checked) => setNewParam(prev => ({ ...prev, required: checked }))}
                          aria-label="Parameter required"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={addParam}
                          isDisabled={!newParam.name || !newParam.description}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Body Fields - only show for POST, PUT, PATCH methods */}
                {(toolForm.payload.method === "POST" || toolForm.payload.method === "PUT" || toolForm.payload.method === "PATCH") && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Request Body Fields</h5>
                    <div className="space-y-2">
                      {toolForm.payload.body.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="text-xs font-medium">{field.name} ({field.type})</div>
                            <div className="text-xs text-gray-500">{field.description}</div>
                            {field.required && <Chip size="sm" color="warning" variant="flat">Required</Chip>}
                          </div>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            isIconOnly
                            onPress={() => removeBodyField(index)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      ))}
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2">
                          <Select
                            size="sm"
                            selectedKeys={[newBodyField.type]}
                            onSelectionChange={(keys) => {
                              const type = Array.from(keys)[0];
                              setNewBodyField(prev => ({ ...prev, type }));
                            }}
                            aria-label="Body field type"
                          >
                            <SelectItem key="string">String</SelectItem>
                            <SelectItem key="number">Number</SelectItem>
                            <SelectItem key="boolean">Boolean</SelectItem>
                            <SelectItem key="object">Object</SelectItem>
                            <SelectItem key="array">Array</SelectItem>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            size="sm"
                            placeholder="Field name"
                            value={newBodyField.name}
                            onChange={(e) => setNewBodyField(prev => ({ ...prev, name: e.target.value }))}
                            aria-label="Body field name"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            size="sm"
                            placeholder="Description"
                            value={newBodyField.description}
                            onChange={(e) => setNewBodyField(prev => ({ ...prev, description: e.target.value }))}
                            aria-label="Body field description"
                          />
                        </div>
                        <div className="col-span-1">
                          <Switch
                            size="sm"
                            isSelected={newBodyField.required}
                            onValueChange={(checked) => setNewBodyField(prev => ({ ...prev, required: checked }))}
                            aria-label="Body field required"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={addBodyField}
                            isDisabled={!newBodyField.name || !newBodyField.description}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Test Endpoint Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-gray-700">Test Endpoint</h5>
                    <Button
                      size="sm"
                      variant="bordered"
                      startContent={<Play size={14} />}
                      onPress={testEndpoint}
                      isLoading={isTestingEndpoint}
                      isDisabled={!toolForm.payload.url || isTestingEndpoint}
                    >
                      {isTestingEndpoint ? "Testing..." : "Test Endpoint"}
                    </Button>
                  </div>

                  {/* Test Parameter Values */}
                  {toolForm.payload.params.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-xs font-medium text-gray-600 mb-2">Parameter Values for Testing</h6>
                      <div className="space-y-2">
                        {toolForm.payload.params.map((param, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-24">
                              <span className="text-xs text-gray-500">{param.name}</span>
                              {param.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <Input
                              size="sm"
                              placeholder={`Enter ${param.type} value`}
                              value={testValues.params[param.name] || ''}
                              onChange={(e) => setTestValues(prev => ({
                                ...prev,
                                params: { ...prev.params, [param.name]: e.target.value }
                              }))}
                              type={param.type === 'number' ? 'number' : 'text'}
                              className="flex-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Test Body Field Values */}
                  {(toolForm.payload.method === "POST" || toolForm.payload.method === "PUT" || toolForm.payload.method === "PATCH") && toolForm.payload.body.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-xs font-medium text-gray-600 mb-2">Body Field Values for Testing</h6>
                      <div className="space-y-2">
                        {toolForm.payload.body.map((field, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-24">
                              <span className="text-xs text-gray-500">{field.name}</span>
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            {field.type === 'boolean' ? (
                              <Select
                                size="sm"
                                selectedKeys={[testValues.body[field.name] || 'true']}
                                onSelectionChange={(keys) => {
                                  const value = Array.from(keys)[0];
                                  setTestValues(prev => ({
                                    ...prev,
                                    body: { ...prev.body, [field.name]: value }
                                  }));
                                }}
                                className="flex-1"
                              >
                                <SelectItem key="true">true</SelectItem>
                                <SelectItem key="false">false</SelectItem>
                              </Select>
                            ) : field.type === 'object' || field.type === 'array' ? (
                              <Textarea
                                size="sm"
                                placeholder={field.type === 'object' ? '{"key": "value"}' : '["item1", "item2"]'}
                                value={testValues.body[field.name] || ''}
                                onChange={(e) => setTestValues(prev => ({
                                  ...prev,
                                  body: { ...prev.body, [field.name]: e.target.value }
                                }))}
                                minRows={2}
                                maxRows={4}
                                className="flex-1"
                              />
                            ) : (
                              <Input
                                size="sm"
                                placeholder={`Enter ${field.type} value`}
                                value={testValues.body[field.name] || ''}
                                onChange={(e) => setTestValues(prev => ({
                                  ...prev,
                                  body: { ...prev.body, [field.name]: e.target.value }
                                }))}
                                type={field.type === 'number' ? 'number' : 'text'}
                                className="flex-1"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Results */}
                  {endpointValidation === 'success' && validationResponse && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Endpoint Valid - Status {validationResponse.status}
                        </span>
                      </div>
                      <div className="text-xs text-green-700">
                        <p className="mb-1">Response: {validationResponse.statusText}</p>
                        <details className="cursor-pointer">
                          <summary className="font-medium flex items-center justify-between">
                            <span>View Response Data</span>
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              className="hover:bg-green-200"
                              onPress={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const textToCopy = (() => {
                                  try {
                                    const parsed = JSON.parse(validationResponse.data);
                                    return JSON.stringify(parsed, null, 2);
                                  } catch {
                                    return validationResponse.data;
                                  }
                                })();
                                copyToClipboard(textToCopy, 'success');
                              }}
                            >
                              <Copy size={12} className={copySuccess.success ? 'text-green-800' : 'text-green-600'} />
                            </Button>
                          </summary>
                          <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-y-auto block max-h-32 whitespace-pre-wrap break-words">
                            {(() => {
                              try {
                                // Try to parse and format JSON
                                const parsed = JSON.parse(validationResponse.data);
                                return JSON.stringify(parsed, null, 2);
                              } catch {
                                // If not valid JSON, return as is
                                return validationResponse.data;
                              }
                            })()}
                          </pre>
                          {copySuccess.success && (
                            <p className="text-xs text-green-800 mt-1 font-medium">✓ Copied to clipboard!</p>
                          )}
                        </details>
                      </div>
                    </div>
                  )}

                  {/* Image Handling Configuration - Only show on successful validation */}
                  <ImageSupportConfig
                    isVisible={endpointValidation === 'success'}
                    initialConfig={imageSupportConfig}
                    onConfigChange={setImageSupportConfig}
                    validationResponse={validationResponse}
                  />

                  {endpointValidation === 'error' && validationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Endpoint Error - {validationError.status}
                        </span>
                      </div>
                      <div className="text-xs text-red-700">
                        <p className="mb-1">{validationError.statusText}</p>
                        <details className="cursor-pointer">
                          <summary className="font-medium flex items-center justify-between">
                            <span>View Error Details</span>
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              className="hover:bg-red-200"
                              onPress={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const textToCopy = (() => {
                                  try {
                                    const parsed = JSON.parse(validationError.message);
                                    return JSON.stringify(parsed, null, 2);
                                  } catch {
                                    return validationError.message;
                                  }
                                })();
                                copyToClipboard(textToCopy, 'error');
                              }}
                            >
                              <Copy size={12} className={copySuccess.error ? 'text-red-800' : 'text-red-600'} />
                            </Button>
                          </summary>
                          <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-y-auto block max-h-32 whitespace-pre-wrap break-words">
                            {(() => {
                              try {
                                // Try to parse and format JSON error
                                const parsed = JSON.parse(validationError.message);
                                return JSON.stringify(parsed, null, 2);
                              } catch {
                                // If not valid JSON, return as is
                                return validationError.message;
                              }
                            })()}
                          </pre>
                          {copySuccess.error && (
                            <p className="text-xs text-red-800 mt-1 font-medium">✓ Copied to clipboard!</p>
                          )}
                        </details>
                      </div>
                    </div>
                  )}

                  {!endpointValidation && (
                    <p className="text-xs text-gray-500">
                      Test your endpoint to validate it works before adding the tool
                    </p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={closeToolModal}>
                Cancel
              </Button>
              <Button
                className="bg-brand text-gray-900"
                onPress={saveTool}
                isDisabled={!toolForm.tool_name || !toolForm.description || !toolForm.payload.url || endpointValidation !== 'success'}
              >
                {editingTool ? "Update Tool" : "Add Tool"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </AccordionItem>
    </Accordion >
  );
};

export default AgentTools;
