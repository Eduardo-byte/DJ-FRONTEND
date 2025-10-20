import { useState, useMemo, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserDataContext";
import { chatService } from "../api/services/chat.service";
import { integrationService } from "../api/services/integration.service";
import { metricsService } from "../api/services/metrics.service";
import { findMatchingGoalKey, normalizeGoalString } from "../utils/formatUtils";
import { aiGoals } from "../components/playground/utils/configData";
import AgentQuickView from "../components/AgentQuickView";
import DeployAgentModal from "../components/DeployAgentModal";
import DeleteAgentModal from "../components/DeleteAgentModal";
import SetToDraftModal from "../components/SetToDraftModal";
import CreateAgentButton from "../components/CreateAgentButton";
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Tooltip,
  Card,
  CardBody
} from "@heroui/react";
import {
  Search,
  Filter,
  ChevronDown,
  Bot,
  MessageSquare,
  Users,
  Clock,
  Activity,
  Power,
  Trash2,
  Edit3,
  Eye,
  MoreVertical,
  Plus,
  Brain,
  Zap,
  Globe,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import Joyride from 'react-joyride';
import useTourController from '../Demo/utils/useTourController';
import { agentsSteps } from '../Demo/Agents/agents.demo';
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip';
import { clientExtensionService } from "../api";

// Helper function to check if user can create more agents based on account type
const canCreateMoreAgents = (accountType, currentAgentCount) => {
  // Always allow creating at least one agent, regardless of account type
  if (currentAgentCount === 0) return true;

  if (!accountType) return false;

  switch (accountType.toLowerCase()) {
    case 'free':
    case 'basic':
      return currentAgentCount < 1;
    case 'pro':
      return currentAgentCount < 5;
    case 'advanced':
    case 'enterprise':
      return true; // Unlimited
    default:
      return false;
  }
};

// Helper function to get the agent limit message based on account type
const getAgentLimitMessage = (accountType) => {
  if (!accountType) return "Upgrade your plan to create agents";

  switch (accountType.toLowerCase()) {
    case 'free':
    case 'basic':
      return "Free/Basic plan limited to 1 agent. Upgrade for more.";
    case 'pro':
      return "Pro plan limited to 5 agents. Upgrade for unlimited agents.";
    case 'advanced':
    case 'enterprise':
      return "You can create unlimited agents with your current plan.";
    default:
      return "Upgrade your plan to create more agents.";
  }
};

export default function Agents() {
  const navigate = useNavigate();
  const { userData, loggedInUser } = useContext(UserDataContext);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [quickViewAgent, setQuickViewAgent] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [deployAgent, setDeployAgent] = useState(null);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [deleteAgent, setDeleteAgent] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [draftAgent, setDraftAgent] = useState(null);
  const [isDraftOpen, setIsDraftOpen] = useState(false);

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("agents", loggedInUser);

  const handleQuickView = (agent) => {
    setQuickViewAgent(agent);
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
  };

  const handleDeployClick = (agent) => {
    setDeployAgent(agent);
    setIsDeployOpen(true);
  };

  const closeDeployModal = () => {
    setIsDeployOpen(false);
  };

  const handleDeploy = (agent, channel) => {
    // In a real app, this would deploy the agent
    toast.success(`Agent "${agent.name}" deployed to ${channel} successfully!`);
  };

  const handleSetToDraftClick = (agent) => {
    setDraftAgent(agent);
    setIsDraftOpen(true);
  };

  const closeDraftModal = () => {
    setIsDraftOpen(false);
  };

  const handleSetToDraft = async (agent) => {
    if (!agent) return;

    try {
      // First, get all integrations for this agent
      const integrations = await integrationService.getIntegrationsByAgentId(agent.id);

      if (integrations && integrations.length > 0) {
        //console.log(`Found ${integrations.length} integrations for agent ${agent.id}`);

        // Update each integration's status to false
        const integrationUpdatePromises = integrations.map(integration => {
          if (integration.integration_type[0].type !== "chat-widget") {
            return integrationService.deleteIntegration(integration.integration_id);
          } else if (integration.integration_type[0].type == "chat-widget") {
            const updateData = { status: false };
            //console.log(`Setting integration ${integration.integration_id} status to false`);
            return integrationService.updateIntegration(integration.integration_id, updateData);
          }
        });

        // Wait for all integration updates to complete
        await Promise.all(integrationUpdatePromises);
        //console.log("All integrations updated to draft status");
      }

      // Then update agent status to false (Draft)
      const updateData = { status: false };
      const result = await chatService.updateAgent(agent.id, updateData);

      if (result) {
        // alert(`Agent "${agent.name}" set to draft mode.`);
        // Update the agent in the state
        setAgents(prevAgents =>
          prevAgents.map(a =>
            a.id === agent.id ? { ...a, status: false } : a
          )
        );
      } else {
        toast.warning("Failed to set agent to draft mode. Please try again.");
      }
    } catch (error) {
      console.error("Error setting agent to draft:", error);
      toast.warning("An error occurred while setting the agent to draft mode. Please try again.");
    }

    closeDraftModal();
  };

  const handleDeleteClick = (agent) => {
    setDeleteAgent(agent);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
  };

  const handleDelete = (agent) => {
    // Update the UI by removing the deleted agent from the state
    setAgents(prevAgents => prevAgents.filter(a => a.id !== agent.id));
    toast.success(`${agent.name} has been successfully deleted.`)
  };

  const agentTypes = [
    { key: "all", name: "All Types" },
    { key: "customer-support", name: "Customer Support", icon: MessageSquare },
    { key: "lead-gen", name: "Lead Generation", icon: Users },
    { key: "sales", name: "Sales Assistant", icon: Zap },
    { key: "knowledge-base", name: "Knowledge Base", icon: Brain },
  ];

  const statusOptions = [
    { key: "all", name: "All Status" },
    { key: true, name: "Live" },
    { key: false, name: "Draft" },
  ];

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  // Fetch agents data when component mounts
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setIsLoading(true);
        const chatData = await chatService.fetchChatIds(userData?.client_id);

        if (chatData?.chat_ids) {
          // Transform chat_ids into the format expected by the components
          const transformedAgents = chatData.chat_ids.map(chat => ({
            id: chat.chat_id,
            user_id: chat.client_id,
            clientId: chat.client_id,
            name: chat.chat_config?.global_?.businessDetails?.chatConfig?.botName ||
              chat.ai_config?.bot_config?.bot_name ||
              "Unnamed Agent",
            description: chat.ai_config?.bot_config?.bot_role || "No description",
            status: chat.status, // Assuming all fetched chats are active
            type: chat.extra_info?.bot_goal?.name ?
              findMatchingGoalKey(chat.extra_info?.bot_goal?.name, aiGoals) || "customer-support" :
              "customer-support",
            metrics: {
              totalConversations: "0",
              engagedConversations: "0",
              totalLeads: "0",
              engagementRate: "0%",
            },
            lastUpdated: chat.updated_at || chat.created_at,
            integrations: [],
            extensions: [],
            // Store the original chat data for use in other components
            originalData: chat
          }));

          // Fetch metrics for each agent
          // const agentsWithMetrics = await Promise.all(
          //   transformedAgents.map(async (agent) => {
          //     try {
          //       const metrics = await metricsService.getChatMetricsByChatId(agent.id);
          //       if (metrics) {
          //         return {
          //           ...agent,
          //           metrics: {
          //             totalConversations: metrics.messageCount.toString(),
          //             engagedConversations: metrics.engagement.engagedConversations.toString(),
          //             totalLeads: metrics.engagement.totalConversations.toString(),
          //             engagementRate: `${metrics.engagement.engagementRate.toFixed(1)}%`,
          //           }
          //         };
          //       }
          //       return agent;
          //     } catch (error) {
          //       console.error(`Error fetching metrics for agent ${agent.id}:`, error);
          //       return agent;
          //     }
          //   })
          // );

          // setAgents(agentsWithMetrics);

          const agentsWithDetails = await Promise.all(
            transformedAgents.map(async (agent) => {
              try {
                // Fetch metrics and integrations in parallel
                const [metrics, integrations, extensions] = await Promise.all([
                  metricsService.getChatMetricsByChatId(agent.id),
                  integrationService.getIntegrationsByAgentId(agent.id),
                  clientExtensionService.getClientExtensionsByClientId(agent.user_id),
                ]);

                // Build new agent object with metrics + integrations
                return {
                  ...agent,
                  metrics: metrics
                    ? {
                      totalConversations: metrics.messageCount.toString(),
                      engagedConversations: metrics.engagement
                        .engagedConversations.toString(),
                      totalLeads: metrics.engagement.totalConversations.toString(),
                      engagementRate: `${metrics.engagement.engagementRate.toFixed(
                        1
                      )}%`,
                    }
                    : agent.metrics,
                  integrations: integrations || [], // attach fetched integrations
                  extensions: extensions || [], // attach fetched integrations
                };
              } catch (error) {
                console.error(
                  `Error fetching details for agent ${agent.id}:`,
                  error
                );
                // If any call fails, just return the agent with its default metrics/integrations
                return agent;
              }
            })
          );

          setAgents(agentsWithDetails);
          // console.log("agentsWithDetails:", agentsWithDetails);

        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we have a user ID
    if (userData?.client_id) {
      fetchAgents();
    } else {
      setIsLoading(false);
    }
  }, [userData?.client_id]);

  const filteredAgents = useMemo(() => {
    return agents
      .filter((agent) => {
        const matchesType =
          selectedType === "all" || agent.type === selectedType;
        const matchesStatus =
          selectedStatus === "all" || agent.status === selectedStatus;
        const matchesSearch =
          agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "oldest":
            return new Date(a.lastUpdated) - new Date(b.lastUpdated);
          case "name":
            return a.name.localeCompare(b.name);
          default: // newest
            return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        }
      });
  }, [agents, selectedType, selectedStatus, searchQuery, sortBy]);

  return (
    <div className="space-y-2 h-full overflow-y-auto">
      {/* Joyride component at the top level */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={agentsSteps}
        run={runTour}
        scrollOffset={300}
        continuous={true}
        showSkipButton={true}
        tooltipComponent={MyCustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      <div className="rounded-lg shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand/10">
              <Bot className="w-5 h-5 text-gray-900" />
            </div>
            <div className="meet">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Agents
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your AI-powered agent assistants
              </p>
            </div>
          </div>
          {canCreateMoreAgents(userData?.account_type, agents.length) ? (
            <div className="create">
              <CreateAgentButton />
            </div>
          ) : (
            <Tooltip content={getAgentLimitMessage(userData?.account_type)}>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                className="bg-gray-300 text-gray-600 cursor-not-allowed create"
                disabled
              >
                Create Agent
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Search and Filters - Only shown when there are more than 2 agents */}
      {agents.length > 2 && (
        <div className="rounded-lg pt-6 pb-3 shadow-none">
          <div className="flex flex-col justify-between items-center sm:flex-row gap-4">
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              size="sm"
              isClearable
              onClear={() => setSearchQuery("")}
              classNames={{
                inputWrapper: "border-gray-200",
                input: "text-sm",
              }}
            />
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] h-[38px] bg-gray-50 text-gray-600"
                  startContent={<Filter className="min-w-3 w-3 max-w-3 min-h-3 h-3 max-h-3" />}
                  endContent={<ChevronDown className="min-w-3 w-3 max-w-3 min-h-3 h-3 max-h-3" />}
                >
                  {agentTypes.find(type => type.key === selectedType)?.name || "All Types"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Agent type options"
                selectionMode="single"
                selectedKeys={new Set([selectedType])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) {
                    setSelectedType(selected);
                  }
                }}
              >
                {agentTypes.map((type) => (
                  <DropdownItem key={type.key} startContent={type.icon && <type.icon className="w-4 h-4" />}>
                    {type.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] h-[38px] bg-gray-50 text-gray-600"
                  startContent={<Filter className="min-w-3 w-3 max-w-3 min-h-3 h-3 max-h-3" />}
                  endContent={<ChevronDown className="min-w-3 w-3 max-w-3 min-h-3 h-3 max-h-3" />}
                >
                  {statusOptions.find(status => status.key === selectedStatus)?.name || "All Status"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Status options"
                selectionMode="single"
                selectedKeys={new Set([selectedStatus])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) {
                    setSelectedStatus(selected);
                  }
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.key}>
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] h-[38px] bg-gray-50 text-gray-600"
                  startContent={<Filter className="min-w-3 w-3 max-w-3 min-h-3 h-3 max-h-3" />}
                  endContent={<ChevronDown className="min-w-3 w-3 max-w-3 min-h-3 h-3 max-h-3" />}
                >
                  Sort By
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                selectionMode="single"
                selectedKeys={new Set([sortBy])}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  if (selected) {
                    setSortBy(selected);
                  }
                }}
              >
                <DropdownItem key="newest">Newest First</DropdownItem>
                <DropdownItem key="oldest">Oldest First</DropdownItem>
                <DropdownItem key="name">Name</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      )}


      {/* Agents Grid */}
      <div className="rounded-lg shadow-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-gray-100 mb-4 animate-pulse">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading agents...</h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Please wait while we retrieve your agents.
            </p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-gray-100 mb-4">
              <Bot className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-sm text-gray-500 text-center max-w-md mb-6">
              {searchQuery || selectedType !== "all" || selectedStatus !== "all"
                ? (
                  <>
                    {searchQuery
                      ? `No agents match your search "${searchQuery}". Try adjusting your filters or search terms.`
                      : "No agents match your current filters. Try adjusting your filter criteria."}
                  </>
                )
                : (
                  <>
                    You don't have any agents yet. Create your first agent to get started.
                  </>
                )
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {(searchQuery || selectedType !== "all" || selectedStatus !== "all") && (
                <Button
                  className="bg-gray-100 text-gray-700"
                  size="sm"
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedStatus("all");
                  }}
                >
                  Reset Filters
                </Button>
              )}
              {canCreateMoreAgents(userData?.account_type, agents.length) ? (
                <CreateAgentButton size="sm" />
              ) : (
                <Tooltip content={getAgentLimitMessage(userData?.account_type)}>
                  <Button
                    color="primary"
                    startContent={<Plus className="w-4 h-4" />}
                    size="sm"
                    className="bg-gray-300 text-gray-600 cursor-not-allowed"
                    disabled
                  >
                    Create Agent
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                shadow="none"
                className="border border-gray-100 hover:border-brand transition-all duration-250"
              >
                <CardBody className="p-4 cursor-pointer track" onClick={() => handleQuickView(agent)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-brand/10 shrink-0">
                        <Bot className="w-5 h-5 text-gray-900" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{agent.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {agent.description}
                        </p>
                      </div>
                    </div>
                    <Chip
                      className={`${agent.status === true
                        ? "bg-green-500"
                        : "bg-gray-500"
                        } text-white shrink-0`}
                      size="sm"
                    >
                      {agent.status === true ? "Live" : "Draft"}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Total Conversations</p>
                        <p className="text-sm font-medium text-gray-900">
                          {agent.metrics.totalConversations}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Engaged Conversations</p>
                        <p className="text-sm font-medium text-gray-900">
                          {agent.metrics.engagedConversations}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Total Leads</p>
                        <p className="text-sm font-medium text-gray-900">
                          {agent.metrics.totalLeads}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Engagement Rate</p>
                        <p className="text-sm font-medium text-gray-900">
                          {agent.metrics.engagementRate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {formatDate(agent.lastUpdated)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Tooltip content="Edit Agent">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => navigate(`/playground/${agent.id}`)}
                        >
                          <Edit3 className="w-4 h-4 text-gray-600" />
                        </Button>
                      </Tooltip>
                      {agent.status === true ? (
                        <Tooltip content="Set to Draft">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => handleSetToDraftClick(agent)}
                          >
                            <Power className="w-4 h-4 text-gray-600" />
                          </Button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Deploy">
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() => handleDeployClick(agent)}
                          >
                            <Globe className="w-4 h-4 text-gray-600" />
                          </Button>
                        </Tooltip>
                      )}
                      <Tooltip content="Delete">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => handleDeleteClick(agent)}
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Agent Quick View */}
      <AgentQuickView
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        agent={quickViewAgent}
        navigate={navigate}
        onDeleteClick={handleDeleteClick}
      />

      {/* Deploy Agent Modal */}
      {/* Here is when deploy on Agents page*/}
      <DeployAgentModal
        isOpen={isDeployOpen}
        onClose={closeDeployModal}
        agent={deployAgent}
        onDeploy={handleDeploy}
        variant="dropdown"
        onDeploySuccess={(agentId) => {
          // Update the agent status in the state
          setAgents(prevAgents =>
            prevAgents.map(a =>
              a.id === agentId ? { ...a, status: true } : a
            )
          );
        }}
      />

      {/* Delete Agent Modal */}
      <DeleteAgentModal
        isOpen={isDeleteOpen}
        onClose={closeDeleteModal}
        agent={deleteAgent}
        onDelete={handleDelete}
      />

      {/* Set to Draft Modal */}
      <SetToDraftModal
        isOpen={isDraftOpen}
        onClose={closeDraftModal}
        agent={draftAgent}
        onSetToDraft={handleSetToDraft}
      />

    </div>
  );
}
