import { useState, useEffect, useContext } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  CheckboxGroup,
  Divider,
  Tooltip,
  useDisclosure
} from "@heroui/react";
import {
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Calendar,
  Shield,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Lock,
  Zap,
  Star,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { UserDataContext } from '../../context/UserDataContext';
import { apiKeyService } from '../../api';
import { API_KEY_SCOPES, SCOPE_GROUPS } from '../../api/types/apikey.types';
import {
  getGroupKey,
  isGroupFullySelected,
  createWildcardScope,
  normalizeScopes,
  expandScopesForUI,
  handleIndividualScopeChange,
  getScopeLabel,
  convertApiScopesToUI,
  formatDate,
  isExpired
} from '../../utils/apikeys.utils';

export default function ApiKeysTab() {
  const { userData } = useContext(UserDataContext);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [selectedKey, setSelectedKey] = useState(null);
  //
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isDeactivateOpen, onOpen: onDeactivateOpen, onClose: onDeactivateClose } = useDisclosure();
  const { isOpen: isActivateOpen, onOpen: onActivateOpen, onClose: onActivateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // Form states
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [selectedScopes, setSelectedScopes] = useState([]);
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form states
  const [editKeyName, setEditKeyName] = useState('');
  const [editKeyDescription, setEditKeyDescription] = useState('');
  const [editSelectedScopes, setEditSelectedScopes] = useState([]);
  const [editExpirationDate, setEditExpirationDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Load API keys on component mount
  useEffect(() => {
    if (userData?.client_id) {
      loadApiKeys();
    }
  }, [userData]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeyService.fetchAllApiKeys(userData.client_id);
      console.log("apikeys:", response);
      // The response should contain api_keys array
      const apiKeys = response?.data?.api_keys || [];
      // Convert API scopes to UI format for proper display
      const apiKeysWithUIScopes = apiKeys.map(key => ({
        ...key,
        scopes: convertApiScopesToUI(key.scopes || [])
      }));
      setApiKeys(apiKeysWithUIScopes);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (selectedScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }

    try {
      setSubmitting(true);
      // Normalize scopes before sending to API
      const normalizedScopes = normalizeScopes(selectedScopes);
      const keyData = {
        email: userData.contact_email,
        name: newKeyName.trim(),
        description: newKeyDescription.trim() || null,
        scopes: normalizedScopes,
        expires_at: expirationDate || null
      };

      const response = await apiKeyService.generateApiKey(keyData);
      console.log("response:", response);
      if (response) {
        // Convert API scopes to UI format and add the new key to the list
        const newKeyWithUIScopes = {
          ...response.data,
          scopes: convertApiScopesToUI(response.data.scopes || [])
        };
        setApiKeys(prev => [...prev, newKeyWithUIScopes]);
        toast.success('API key created successfully');
        resetForm();
        onCreateClose();
      } else {
        toast.error('Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!selectedKey) return;

    try {
      setSubmitting(true);
      const success = await apiKeyService.deleteApiKey(selectedKey.id, true); // Hard delete
      if (success) {
        setApiKeys(prev => prev.filter(key => key.id !== selectedKey.id));
        toast.success('API key permanently deleted');
        onDeleteClose();
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setSubmitting(false);
      setSelectedKey(null);
    }
  };

  const handleDeactivateApiKey = async () => {
    if (!selectedKey) return;

    try {
      setSubmitting(true);
      const success = await apiKeyService.deleteApiKey(selectedKey.id, false); // Soft delete (deactivate)
      if (success) {
        setApiKeys(prev => prev.map(key =>
          key.id === selectedKey.id ? { ...key, is_active: false } : key
        ));
        toast.success('API key deactivated successfully');
        onDeactivateClose();
      } else {
        toast.error('Failed to deactivate API key');
      }
    } catch (error) {
      console.error('Error deactivating API key:', error);
      toast.error('Failed to deactivate API key');
    } finally {
      setSubmitting(false);
      setSelectedKey(null);
    }
  };

  const handleActivateApiKey = async () => {
    if (!selectedKey) return;

    try {
      setSubmitting(true);
      const updateData = {
        is_active: true
      };

      const updatedKey = await apiKeyService.updateApiKey(selectedKey.id, updateData);
      if (updatedKey) {
        setApiKeys(prev => prev.map(key =>
          key.id === selectedKey.id ? { ...key, is_active: true } : key
        ));
        toast.success('API key activated successfully');
        onActivateClose();
      } else {
        toast.error('Failed to activate API key');
      }
    } catch (error) {
      console.error('Error activating API key:', error);
      toast.error('Failed to activate API key');
    } finally {
      setSubmitting(false);
      setSelectedKey(null);
    }
  };

  const openViewModal = (apiKey) => {
    setSelectedKey(apiKey);
    onViewOpen();
  };

  const openEditModal = (apiKey) => {
    setSelectedKey(apiKey);
    setEditKeyName(apiKey.name || '');
    setEditKeyDescription(apiKey.description || '');
    // Handle both old format (array of strings) and new format (mixed array with wildcards)
    const scopes = apiKey.scopes || [];
    // Convert string wildcards from API to object format for UI consistency
    const convertedScopes = convertApiScopesToUI(scopes);
    setEditSelectedScopes(convertedScopes);
    setEditExpirationDate(apiKey.expires_at ? apiKey.expires_at.split('T')[0] : '');
    setEditIsActive(apiKey.is_active);
    onEditOpen();
  };

  const handleUpdateApiKey = async () => {
    if (!selectedKey) return;

    if (!editKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (editSelectedScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }

    try {
      setSubmitting(true);
      // Normalize scopes before sending to API
      const normalizedScopes = normalizeScopes(editSelectedScopes);
      const updateData = {
        name: editKeyName.trim(),
        description: editKeyDescription.trim() || null,
        scopes: normalizedScopes,
        is_active: editIsActive,
        expires_at: editExpirationDate || null
      };

      const updatedKey = await apiKeyService.updateApiKey(selectedKey.id, updateData);
      if (updatedKey) {
        // Safer approach: just update the fields we know we changed
        // and convert normalized scopes back to UI format
        const uiScopes = convertApiScopesToUI(normalizedScopes);
        
        setApiKeys(prev => prev.map(key =>
          key.id === selectedKey.id ? {
            ...key,
            name: updateData.name,
            description: updateData.description,
            scopes: uiScopes,
            is_active: updateData.is_active,
            expires_at: updateData.expires_at,
            updated_at: new Date().toISOString() // Update timestamp
          } : key
        ));
        toast.success('API key updated successfully');
        onEditClose();
      } else {
        toast.error('Failed to update API key');
      }
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error('Failed to update API key');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const resetForm = () => {
    setNewKeyName('');
    setNewKeyDescription('');
    setSelectedScopes([]);
    setExpirationDate('');
  };

  const resetEditForm = () => {
    setEditKeyName('');
    setEditKeyDescription('');
    setEditSelectedScopes([]);
    setEditExpirationDate('');
    setEditIsActive(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-brand/0 rounded-2xl"></div>
        <div className="relative p-8 rounded-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand/10 ring-4 ring-brand/5">
                <Key className="w-6 h-6 text-gray-900" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    API Keys
                  </h1>
                  <Chip
                    size="sm"
                    className="bg-brand/10 text-brand border-brand/20"
                    startContent={<Sparkles className="w-3 h-3" />}
                  >
                    Secure Access
                  </Chip>
                </div>
                <p className="text-gray-600 text-base max-w-2xl">
                  Generate and manage secure API keys for programmatic access to your Olivia Network resources.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="light"
                    size="sm"
                    className="text-brand hover:bg-brand/10 font-medium"
                    startContent={<BookOpen className="w-4 h-4" />}
                    onPress={() => window.open('https://docs.olivianetwork.ai', '_blank')}
                  >
                    View Documentation
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>Enterprise-grade security</span>
                  </div>
                </div>
              </div>
            </div>
            {apiKeys.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-brand text-gray-900 font-semibold px-6 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  startContent={<Plus className="w-5 h-5" />}
                  onPress={onCreateOpen}
                >
                  Generate New API Key
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {apiKeys.length === 0 ? (
        <div className="relative">
          <div className="absolute inset-0 bg-brand/0 rounded-2xl"></div>
          <div className="relative flex flex-col items-center justify-center py-16 px-8 rounded-2xl">
            <div className="relative mb-6">
              <div className="p-4 rounded-2xl bg-brand/10 ring-8 ring-brand/5">
                <Key className="w-12 h-12 text-brand" />
              </div>
              <div className="absolute -top-2 -right-2 p-1 rounded-full bg-brand">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get Started?</h3>
            <p className="text-gray-600 text-center max-w-lg mb-8 leading-relaxed">
              Create your first API key to unlock programmatic access to your Olivia Network resources.
              Secure, scalable, and ready for production.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-brand/10">
                <Shield className="w-5 h-5 text-brand" />
                <span className="text-sm font-medium text-gray-700">Secure Access</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-brand/10">
                <Zap className="w-5 h-5 text-brand" />
                <span className="text-sm font-medium text-gray-700">Fast Integration</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-brand/10">
                <CheckCircle2 className="w-5 h-5 text-brand" />
                <span className="text-sm font-medium text-gray-700">Easy Management</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-brand text-gray-900 font-semibold px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                startContent={<Plus className="w-5 h-5" />}
                onPress={onCreateOpen}
              >
                Generate Your First API Key
              </Button>
              <Button
                variant="light"
                className="text-brand border-brand/20 hover:bg-brand/5 font-medium px-6 py-3 h-auto"
                startContent={<BookOpen className="w-5 h-5" />}
                onPress={() => window.open('https://docs.olivianetwork.ai', '_blank')}
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="relative group">
              <div className="absolute inset-0 bg-brand/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Card
                shadow="none"
                className="relative border border-gray-200 hover:border-brand/40 transition-all duration-300 rounded-2xl overflow-hidden group-hover:shadow-lg"
              >
                <CardBody className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      {/* Header with name and status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-brand/10">
                            <Key className="w-5 h-5 text-brand" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{apiKey.name}</h3>
                            <p className="text-sm text-gray-500">Created {formatDate(apiKey.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Chip
                            size="sm"
                            className={`${apiKey.is_active
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            startContent={
                              <div className={`w-2 h-2 rounded-full ${apiKey.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                            }
                          >
                            {apiKey.is_active ? "Active" : "Inactive"}
                          </Chip>
                          {apiKey.expires_at && (
                            <Chip
                              size="sm"
                              className={`${isExpired(apiKey.expires_at)
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                                }`}
                              startContent={<Calendar className="w-3 h-3" />}
                            >
                              {isExpired(apiKey.expires_at) ? "Expired" : `Expires ${formatDate(apiKey.expires_at)}`}
                            </Chip>
                          )}
                        </div>
                      </div>

                      {/* API Key display */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between gap-3">
                          <code className="flex-1 text-sm font-mono text-gray-700 bg-white px-3 py-2 rounded-lg border">
                            {visibleKeys.has(apiKey.id) ? (apiKey.key_value || apiKey.key || `${apiKey.key_prefix}${'•'.repeat(32)}`) : `${apiKey.key_prefix}${'•'.repeat(32)}`}
                          </code>
                          <div className="flex gap-1">
                            <Tooltip content={visibleKeys.has(apiKey.id) ? "Hide key" : "Show key"}>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="hover:bg-brand/10"
                                onPress={() => toggleKeyVisibility(apiKey.id)}
                              >
                                {visibleKeys.has(apiKey.id) ?
                                  <EyeOff className="w-4 h-4 text-gray-600" /> :
                                  <Eye className="w-4 h-4 text-gray-600" />
                                }
                              </Button>
                            </Tooltip>
                            <Tooltip content="Copy to clipboard">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="hover:bg-brand/10"
                                onPress={() => copyToClipboard(apiKey.key_value || `${apiKey.key_prefix}${'•'.repeat(32)}`)}
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </Button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>

                      {/* Scopes */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-brand" />
                          <span className="text-sm font-medium text-gray-700">
                            Scopes ({apiKey.scopes?.length || 0})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(apiKey.scopes || []).slice(0, 4).map((scope, index) => {
                            const scopeKey = typeof scope === 'object' ? JSON.stringify(scope) : scope;
                            return (
                              <Chip
                                key={`${scopeKey}-${index}`}
                                size="sm"
                                className="bg-brand/10 text-brand border-brand/20"
                              >
                                {getScopeLabel(scope)}
                              </Chip>
                            );
                          })}
                          {(apiKey.scopes || []).length > 4 && (
                            <Chip
                              size="sm"
                              className="bg-gray-100 text-gray-600"
                            >
                              +{(apiKey.scopes || []).length - 4} more
                            </Chip>
                          )}
                        </div>
                      </div>

                      {/* Usage info */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {apiKey.last_used_at ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span>Last used {formatDate(apiKey.last_used_at)}</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span>Never used</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Tooltip content="View API Key Details">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="hover:bg-blue-50 hover:text-blue-600"
                          onPress={() => openViewModal(apiKey)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Edit API Key">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="hover:bg-green-50 hover:text-green-600"
                          onPress={() => openEditModal(apiKey)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      {apiKey.is_active ? (
                        <Tooltip content="Deactivate API Key">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="hover:bg-orange-50 hover:text-orange-600"
                            onPress={() => {
                              setSelectedKey(apiKey);
                              onDeactivateOpen();
                            }}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Activate API Key">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="hover:bg-green-50 hover:text-green-600"
                            onPress={() => {
                              setSelectedKey(apiKey);
                              onActivateOpen();
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Delete API Key">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="hover:bg-red-50 hover:text-red-600"
                          onPress={() => {
                            setSelectedKey(apiKey);
                            onDeleteOpen();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Create API Key Modal */}
      <Modal scrollBehavior="inside" size="5xl" isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalContent>
          <ModalHeader>Generate New API Key</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="API Key Name"
                placeholder="Enter a descriptive name for this API key"
                value={newKeyName}
                onValueChange={setNewKeyName}
                isRequired
              />

              <Input
                label="Description (Optional)"
                placeholder="Enter a description for this API key"
                value={newKeyDescription}
                onValueChange={setNewKeyDescription}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Scopes
                </label>
                <div className="space-y-4">
                  <CheckboxGroup
                    value={expandScopesForUI(selectedScopes)}
                    onValueChange={(newScopes) => {
                      // Handle checkbox group changes
                      const currentExpandedScopes = expandScopesForUI(selectedScopes);
                      const addedScopes = newScopes.filter(scope => !currentExpandedScopes.includes(scope));
                      const removedScopes = currentExpandedScopes.filter(scope => !newScopes.includes(scope));
                      
                      let updatedScopes = [...selectedScopes];
                      
                      // Handle removed scopes
                      removedScopes.forEach(scope => {
                        handleIndividualScopeChange(scope, false, updatedScopes, (newScopes) => {
                          updatedScopes = newScopes(updatedScopes);
                        });
                      });
                      
                      // Handle added scopes
                      addedScopes.forEach(scope => {
                        handleIndividualScopeChange(scope, true, updatedScopes, (newScopes) => {
                          updatedScopes = newScopes(updatedScopes);
                        });
                      });
                      
                      setSelectedScopes(updatedScopes);
                    }}
                  >
                    {Object.entries(SCOPE_GROUPS).filter(([groupKey]) => groupKey !== 'WEBHOOKS').map(([groupKey, group]) => (
                      <div key={groupKey} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand"></div>
                              {group.label}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-xs text-brand hover:bg-brand/10"
                            onPress={() => {
                              const groupScopes = group.scopes;
                              const isFullySelected = isGroupFullySelected(selectedScopes, groupScopes);
                              
                              if (isFullySelected) {
                                // Deselect all in this group (remove wildcard or individual scopes)
                                setSelectedScopes(prev => {
                                  const filtered = prev.filter(scope => {
                                    // Remove wildcard for this group (object format)
                                    if (typeof scope === 'object' && scope !== null) {
                                      const [key, value] = Object.entries(scope)[0];
                                      return !(value === '*' && groupScopes.some(s => s.startsWith(key)));
                                    }
                                    // Remove wildcard for this group (string format)
                                    if (typeof scope === 'string' && scope.includes(':*')) {
                                      const [resource] = scope.split(':');
                                      return !groupScopes.some(s => s.startsWith(resource));
                                    }
                                    // Remove individual scopes for this group
                                    return !groupScopes.includes(scope);
                                  });
                                  return filtered;
                                });
                              } else {
                                // Select all in this group (create wildcard)
                                setSelectedScopes(prev => {
                                  // Remove any existing individual scopes for this group
                                  const filtered = prev.filter(scope => {
                                    if (typeof scope === 'object') return true; // Keep other wildcards
                                    return !groupScopes.includes(scope); // Remove individual scopes for this group
                                  });
                                  // Add wildcard for this group
                                  return [...filtered, createWildcardScope(groupKey)];
                                });
                              }
                            }}
                          >
                            {isGroupFullySelected(selectedScopes, group.scopes) ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {group.scopes.map((scope) => (
                            <Checkbox
                              key={scope}
                              value={scope}
                              size="sm"
                              classNames={{
                                base: "max-w-full",
                                label: "text-sm text-gray-700"
                              }}
                            >
                              {getScopeLabel(scope)}
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CheckboxGroup>

                  {selectedScopes.length > 0 && (
                    <div className="mt-4 p-3 bg-brand/10 rounded-lg border border-brand/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-brand" />
                        <span className="text-sm font-medium text-gray-900">
                          Selected Scopes ({selectedScopes.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedScopes.map((scope, index) => {
                          const scopeKey = typeof scope === 'object' ? JSON.stringify(scope) : scope;
                          return (
                            <Chip
                              key={`${scopeKey}-${index}`}
                              size="sm"
                              variant="flat"
                              className="bg-brand/20 text-gray-900"
                              onClose={() => {
                                if (typeof scope === 'object' && scope !== null) {
                                  // Remove wildcard
                                  setSelectedScopes(prev => prev.filter((s, i) => i !== index));
                                } else {
                                  // Remove individual scope
                                  setSelectedScopes(prev => prev.filter(s => s !== scope));
                                }
                              }}
                            >
                              {getScopeLabel(scope)}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Input
                type="date"
                label="Expiration Date (Optional)"
                placeholder="Select expiration date"
                value={expirationDate}
                onValueChange={setExpirationDate}
                description="Leave empty for no expiration"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onCreateClose}>
              Cancel
            </Button>
            <Button
              className="bg-brand text-gray-900"
              onPress={handleCreateApiKey}
              isLoading={submitting}
            >
              Generate API Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit API Key Modal */}
      <Modal scrollBehavior="inside" size="5xl" isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          <ModalHeader>Edit API Key</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="API Key Name"
                placeholder="Enter a descriptive name for this API key"
                value={editKeyName}
                onValueChange={setEditKeyName}
                isRequired
              />

              <Input
                label="Description (Optional)"
                placeholder="Enter a description for this API key"
                value={editKeyDescription}
                onValueChange={setEditKeyDescription}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Scopes
                </label>
                <div className="space-y-4">
                  <CheckboxGroup
                    value={expandScopesForUI(editSelectedScopes)}
                    onValueChange={(newScopes) => {
                      // Handle checkbox group changes
                      const currentExpandedScopes = expandScopesForUI(editSelectedScopes);
                      const addedScopes = newScopes.filter(scope => !currentExpandedScopes.includes(scope));
                      const removedScopes = currentExpandedScopes.filter(scope => !newScopes.includes(scope));
                      
                      let updatedScopes = [...editSelectedScopes];
                      
                      // Handle removed scopes
                      removedScopes.forEach(scope => {
                        handleIndividualScopeChange(scope, false, updatedScopes, (newScopes) => {
                          updatedScopes = newScopes(updatedScopes);
                        });
                      });
                      
                      // Handle added scopes
                      addedScopes.forEach(scope => {
                        handleIndividualScopeChange(scope, true, updatedScopes, (newScopes) => {
                          updatedScopes = newScopes(updatedScopes);
                        });
                      });
                      
                      setEditSelectedScopes(updatedScopes);
                    }}
                  >
                    {Object.entries(SCOPE_GROUPS).filter(([groupKey]) => groupKey !== 'WEBHOOKS').map(([groupKey, group]) => (
                      <div key={groupKey} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-brand"></div>
                              {group.label}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="light"
                            className="text-xs text-brand hover:bg-brand/10"
                            onPress={() => {
                              const groupScopes = group.scopes;
                              const isFullySelected = isGroupFullySelected(editSelectedScopes, groupScopes);
                              
                              if (isFullySelected) {
                                // Deselect all in this group (remove wildcard or individual scopes)
                                setEditSelectedScopes(prev => {
                                  const filtered = prev.filter(scope => {
                                    // Remove wildcard for this group (object format)
                                    if (typeof scope === 'object' && scope !== null) {
                                      const [key, value] = Object.entries(scope)[0];
                                      return !(value === '*' && groupScopes.some(s => s.startsWith(key)));
                                    }
                                    // Remove wildcard for this group (string format)
                                    if (typeof scope === 'string' && scope.includes(':*')) {
                                      const [resource] = scope.split(':');
                                      return !groupScopes.some(s => s.startsWith(resource));
                                    }
                                    // Remove individual scopes for this group
                                    return !groupScopes.includes(scope);
                                  });
                                  return filtered;
                                });
                              } else {
                                // Select all in this group (create wildcard)
                                setEditSelectedScopes(prev => {
                                  // Remove any existing individual scopes for this group
                                  const filtered = prev.filter(scope => {
                                    if (typeof scope === 'object') return true; // Keep other wildcards
                                    return !groupScopes.includes(scope); // Remove individual scopes for this group
                                  });
                                  // Add wildcard for this group
                                  return [...filtered, createWildcardScope(groupKey)];
                                });
                              }
                            }}
                          >
                            {isGroupFullySelected(editSelectedScopes, group.scopes) ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {group.scopes.map((scope) => (
                            <Checkbox
                              key={scope}
                              value={scope}
                              size="sm"
                              classNames={{
                                base: "max-w-full",
                                label: "text-sm text-gray-700"
                              }}
                            >
                              {getScopeLabel(scope)}
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CheckboxGroup>

                  {editSelectedScopes.length > 0 && (
                    <div className="mt-4 p-3 bg-brand/10 rounded-lg border border-brand/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-brand" />
                        <span className="text-sm font-medium text-gray-900">
                          Selected Scopes ({editSelectedScopes.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {editSelectedScopes.map((scope, index) => {
                          const scopeKey = typeof scope === 'object' ? JSON.stringify(scope) : scope;
                          return (
                            <Chip
                              key={`${scopeKey}-${index}`}
                              size="sm"
                              variant="flat"
                              className="bg-brand/20 text-gray-900"
                              onClose={() => {
                                if (typeof scope === 'object' && scope !== null) {
                                  // Remove wildcard
                                  setEditSelectedScopes(prev => prev.filter((s, i) => i !== index));
                                } else {
                                  // Remove individual scope
                                  setEditSelectedScopes(prev => prev.filter(s => s !== scope));
                                }
                              }}
                            >
                              {getScopeLabel(scope)}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Input
                  type="date"
                  label="Expiration Date (Optional)"
                  placeholder="Select expiration date"
                  value={editExpirationDate}
                  onValueChange={setEditExpirationDate}
                  description="Leave empty for no expiration"
                  className="flex-1"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    isSelected={editIsActive}
                    onValueChange={setEditIsActive}
                    size="sm"
                  >
                    <span className="text-sm text-gray-700">Active</span>
                  </Checkbox>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onEditClose}>
              Cancel
            </Button>
            <Button
              className="bg-brand text-gray-900"
              onPress={handleUpdateApiKey}
              isLoading={submitting}
            >
              Update API Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View API Key Modal */}
      <Modal scrollBehavior="inside" size="3xl" isOpen={isViewOpen} onClose={onViewClose}>
        <ModalContent>
          <ModalHeader>API Key Details</ModalHeader>
          <ModalBody>
            {selectedKey && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedKey.name}</p>
                  </div>
                  {selectedKey.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900">{selectedKey.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${selectedKey.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                        <span className={`text-sm font-medium ${selectedKey.is_active ? "text-green-700" : "text-gray-600"}`}>
                          {selectedKey.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedKey.created_at)}</p>
                    </div>
                  </div>
                  {selectedKey.expires_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expires</label>
                      <p className={`text-sm ${isExpired(selectedKey.expires_at) ? "text-red-600" : "text-gray-900"}`}>
                        {isExpired(selectedKey.expires_at) ? "Expired" : formatDate(selectedKey.expires_at)}
                      </p>
                    </div>
                  )}
                </div>

                {/* API Key Display */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">API Key</label>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <code className="text-sm font-mono text-gray-700 break-all">
                      {selectedKey.key_value || `${selectedKey.key_prefix}${'•'.repeat(32)}`}
                    </code>
                  </div>
                </div>

                {/* Scopes */}
                <div>
                  <label className="text-sm font-medium text-gray-500 mb-2 block">
                    Scopes ({(selectedKey.scopes || []).length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(selectedKey.scopes || []).map((scope, index) => {
                      const scopeKey = typeof scope === 'object' ? JSON.stringify(scope) : scope;
                      return (
                        <Chip
                          key={`${scopeKey}-${index}`}
                          size="sm"
                          className="bg-brand/10 text-brand border-brand/20"
                        >
                          {getScopeLabel(scope)}
                        </Chip>
                      );
                    })}
                  </div>
                </div>

                {/* Usage Info */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Used</label>
                  <p className="text-sm text-gray-900">
                    {selectedKey.last_used_at ? formatDate(selectedKey.last_used_at) : 'Never used'}
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onViewClose}>
              Close
            </Button>
            <Button
              className="bg-brand text-gray-900"
              onPress={() => {
                onViewClose();
                openEditModal(selectedKey);
              }}
            >
              Edit API Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal scrollBehavior="inside" size="3xl" isOpen={isDeactivateOpen} onClose={onDeactivateClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-warning" />
            Deactivate API Key
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to deactivate the API key "{selectedKey?.name}"?
              This will disable the key and prevent it from being used, but it can be reactivated later.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeactivateClose}>
              Cancel
            </Button>
            <Button
              color="warning"
              onPress={handleDeactivateApiKey}
              isLoading={submitting}
            >
              Deactivate API Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Activate Confirmation Modal */}
      <Modal scrollBehavior="inside" size="3xl" isOpen={isActivateOpen} onClose={onActivateClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Activate API Key
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to activate the API key "{selectedKey?.name}"?
              This will enable the key and allow it to be used for API requests.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onActivateClose}>
              Cancel
            </Button>
            <Button
              color="success"
              onPress={handleActivateApiKey}
              isLoading={submitting}
            >
              Activate API Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal scrollBehavior="inside" size="5xl" isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            Delete API Key
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to <strong>permanently delete</strong> the API key "{selectedKey?.name}"?
              This action cannot be undone and will immediately revoke access for any applications using this key.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              <strong>Note:</strong> If you just want to temporarily disable the key, use the "Deactivate" option instead.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteApiKey}
              isLoading={submitting}
            >
              Permanently Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
}