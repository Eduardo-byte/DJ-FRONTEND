import React, { useState, useContext } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerBody, 
  DrawerFooter,
  Tabs,
  Tab,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip
} from '@heroui/react';
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  Code, 
  CheckCircle, 
  XCircle, 
  Play,
  Bot,
  Settings
} from 'lucide-react';
import { UserDataContext } from '../../context/UserDataContext';

const CustomToolsDrawer = ({ 
  isOpen, 
  onClose, 
  customTools = [], 
  onToolsUpdate,
  userChats = [],
  onBusinessToolsUpdate,
  isPremium = false 
}) => {
  const [activeTab, setActiveTab] = useState('available');
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
  const [endpointValidation, setEndpointValidation] = useState(null);
  const [validationResponse, setValidationResponse] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [testValues, setTestValues] = useState({ params: {}, body: {} });
  
  // Business tools state
  const [enabledBusinessTools, setEnabledBusinessTools] = useState(new Set());

  const { loggedInUser } = useContext(UserDataContext);

  // Extract business tools from user chats
  const getBusinessTools = () => {
    if (!userChats || userChats.length === 0) return [];
    
    const businessTools = [];
    
    userChats.forEach(chat => {
      if (chat.custom_tools && Array.isArray(chat.custom_tools)) {
        chat.custom_tools.forEach(tool => {
          businessTools.push({
            ...tool,
            agentName: chat.ai_config?.bot_config.bot_name || `Agent ${chat.chat_id}`,
            agentId: chat.chat_id,
            uniqueId: `${chat.chat_id}_${tool.tool_name}` // Unique identifier for toggle state
          });
        });
      }
    });
    
    return businessTools;
  };

  const businessTools = getBusinessTools();

  // Handle business tool toggle
  const handleBusinessToolToggle = (toolUniqueId, enabled) => {
    setEnabledBusinessTools(prev => {
      const newSet = new Set(prev);
      if (enabled) {
        newSet.add(toolUniqueId);
      } else {
        newSet.delete(toolUniqueId);
      }
      
      // Get the enabled business tools and call the callback
      if (onBusinessToolsUpdate) {
        const enabledTools = businessTools.filter(tool => newSet.has(tool.uniqueId));
        onBusinessToolsUpdate(enabledTools);
      }
      
      return newSet;
    });
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
    setEndpointValidation(null);
    setValidationResponse(null);
    setValidationError(null);
    setTestValues({ params: {}, body: {} });
  };

  const openToolForm = (tool = null) => {
    if (tool) {
      setEditingTool(tool);
      setToolForm(tool);
    } else {
      resetToolForm();
    }
    setActiveTab('create');
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

  const saveTool = () => {
    if (!toolForm.tool_name || !toolForm.description || !toolForm.payload.url) {
      return;
    }

    const newTools = customTools || [];
    if (editingTool) {
      const index = newTools.findIndex(t => t.tool_name === editingTool.tool_name);
      if (index >= 0) {
        newTools[index] = toolForm;
      }
    } else {
      newTools.push(toolForm);
    }

    onToolsUpdate(newTools);
    resetToolForm();
    setActiveTab('available');
  };

  const deleteTool = (toolName) => {
    const newTools = (customTools || []).filter(t => t.tool_name !== toolName);
    onToolsUpdate(newTools);
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
              case 'number': paramValue = '123'; break;
              case 'boolean': paramValue = 'true'; break;
              default: paramValue = 'test'; break;
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
        const bodyObject = {};
        toolForm.payload.body.forEach(field => {
          const userValue = testValues.body[field.name];
          let fieldValue;
          
          if (userValue !== undefined && userValue !== '') {
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
                  fieldValue = userValue;
                }
                break;
              default: 
                fieldValue = userValue;
                break;
            }
          } else {
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
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="4xl"
    >
      <DrawerContent>
        <DrawerHeader className="border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Wrench className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Custom Tools</h3>
              <p className="text-sm text-gray-500">
                Manage your custom API integrations
              </p>
            </div>
          </div>
        </DrawerHeader>

        <DrawerBody className="py-6">
          <Tabs
            aria-label="Custom Tools Options"
            variant="underlined"
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            className="w-full"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-200",
              cursor: "w-full bg-brand",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-gray-900"
            }}
          >
            <Tab
              key="available"
              title={
                <div className="flex items-center gap-2">
                  <Settings size={18} />
                  <span>Available Tools</span>
                </div>
              }
            >
              <div className="mt-6 space-y-4">
                {customTools && customTools.length > 0 ? (
                  customTools.map((tool, index) => (
                    <div key={index} className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="relative">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                              <Code className="w-4 h-4 text-purple-600" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-start gap-2 mb-1">
                              <h4 className="text-base font-semibold text-gray-900 truncate">{tool.tool_name}</h4>
                              <p className="text-sm italic text-gray-600/80 line-clamp-2">({tool.description})</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`${getMethodBadgeColor(tool.payload.method)} px-2 py-1 rounded text-xs font-medium`}>
                                {tool.payload.method}
                              </span>
                              <span className="text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded truncate max-w-xs">
                                {tool.payload.url}
                              </span>
                              {tool.payload.params.length > 0 && (
                                <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs">
                                  {tool.payload.params.length} param{tool.payload.params.length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {Object.keys(tool.payload.headers).length > 0 && (
                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">
                                  {Object.keys(tool.payload.headers).length} header{Object.keys(tool.payload.headers).length !== 1 ? 's' : ''}
                                </span>
                              )}
                              {tool.payload.body && tool.payload.body.length > 0 && (
                                <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs">
                                  {tool.payload.body.length} body field{tool.payload.body.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onPress={() => openToolForm(tool)}
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
                  <div className="text-center py-12 text-gray-500">
                    <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No custom tools configured</p>
                    <p className="text-sm mb-4">Create your first custom API integration</p>
                    {isPremium ? (
                      <Button
                        className="bg-brand text-gray-900"
                        startContent={<Plus size={16} />}
                        onPress={() => openToolForm()}
                      >
                        Add Tool
                      </Button>
                    ) : (
                      <p className="text-xs text-red-500">Upgrade to Pro to create custom tools</p>
                    )}
                  </div>
                )}

                {customTools && customTools.length > 0 && isPremium && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      className="bg-brand text-gray-900 w-full"
                      startContent={<Plus size={16} />}
                      onPress={() => openToolForm()}
                    >
                      Add New Tool
                    </Button>
                  </div>
                )}

                {/* Business Tools Section */}
                {businessTools.length > 0 && (
                  <div className={`${customTools && customTools.length > 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-800">Business Tools</h3>
                      <span className="text-xs text-gray-500">From your agents</span>
                    </div>
                    <div className="space-y-2">
                      {businessTools.map((tool, index) => (
                        <div key={tool.uniqueId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{tool.tool_name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Agent {tool.agentName} • {tool.description}
                            </p>
                          </div>
                          <Switch
                            size="sm"
                            isSelected={enabledBusinessTools.has(tool.uniqueId)}
                            onValueChange={(checked) => handleBusinessToolToggle(tool.uniqueId, checked)}
                            aria-label={`Toggle ${tool.tool_name}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state when no tools at all */}
                {(!customTools || customTools.length === 0) && businessTools.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No tools available</p>
                    <p className="text-sm mb-4">Create custom tools or add tools to your agents</p>
                    {isPremium ? (
                      <Button
                        className="bg-brand text-gray-900"
                        startContent={<Plus size={16} />}
                        onPress={() => openToolForm()}
                      >
                        Create Tool
                      </Button>
                    ) : (
                      <p className="text-xs text-red-500">Upgrade to Pro to create custom tools</p>
                    )}
                  </div>
                )}
              </div>
            </Tab>

            <Tab
              key="create"
              title={
                <div className="flex items-center gap-2">
                  <Plus size={18} />
                  <span>Create Tool</span>
                </div>
              }
            >
              <div className="mt-6 space-y-6">
                {!isPremium ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
                      <p className="text-yellow-800 font-medium">Premium Feature</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        Upgrade to Pro to create custom tools and API integrations
                      </p>
                    </div>
                    <Button className="bg-brand text-gray-900">
                      Upgrade to Pro
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {editingTool ? "Edit Tool" : "Create New Tool"}
                      </h4>
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
                      <h5 className="text-base font-medium text-gray-800">API Configuration</h5>

                      <div className="grid grid-cols-2 gap-4">
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
                        >
                          <SelectItem key="GET">GET</SelectItem>
                          <SelectItem key="POST">POST</SelectItem>
                          <SelectItem key="PUT">PUT</SelectItem>
                          <SelectItem key="PATCH">PATCH</SelectItem>
                          <SelectItem key="DELETE">DELETE</SelectItem>
                        </Select>

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
                          <h6 className="text-sm font-medium text-gray-700">Headers</h6>
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
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Parameters</h6>
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
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Request Body Fields</h6>
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

                      {/* Test Endpoint */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-sm font-medium text-gray-700">Test Endpoint</h6>
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
                                <summary className="font-medium">View Response Data</summary>
                                <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto max-h-32">
                                  {validationResponse.data}
                                </pre>
                              </details>
                            </div>
                          </div>
                        )}

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
                                <summary className="font-medium">View Error Details</summary>
                                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-32">
                                  {validationError.message}
                                </pre>
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

                      {/* Save/Cancel Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="light"
                          onPress={() => {
                            resetToolForm();
                            setActiveTab('available');
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-brand text-gray-900 flex-1"
                          onPress={saveTool}
                          isDisabled={!toolForm.tool_name || !toolForm.description || !toolForm.payload.url}
                        >
                          {editingTool ? "Update Tool" : "Save Tool"}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Tab>
          </Tabs>
        </DrawerBody>

        <DrawerFooter className="border-t border-gray-100">
          <Button variant="light" onPress={onClose} className="w-full">
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomToolsDrawer;
