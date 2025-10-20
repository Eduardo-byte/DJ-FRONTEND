import React, { useContext, useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import {
  Bot,
  MessageSquare,
  Users,
  Clock,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
  Info,
  BarChart3,
  Zap,
  UserPlus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Antenna,
} from "lucide-react";
import Joyride from "react-joyride";
import { agentsModalSteps } from "../Demo/Agents/agentModalOpen.demo";
import { UserDataContext } from "../context/UserDataContext";
import useTourController from "../Demo/utils/useTourController";
import MyCustomTooltip from "../Demo/CustomTooltip/MyCustomTooltip";

const AgentQuickView = ({ isOpen, onClose, agent, navigate, onDeleteClick }) => {
  const { userData, loggedInUser } = useContext(UserDataContext);
  const { runTour, handleJoyrideCallback } = useTourController("viewAgentModal", loggedInUser);

  // console.log(agent);
  if (!agent) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case "customer-support":
        return <MessageSquare className="w-5 h-5" />;
      case "lead-gen":
        return <Users className="w-5 h-5" />;
      case "sales":
        return <Zap className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  // Define which extension IDs correspond to which channel names
  const knownExtensions = [
    { id: "3c375262-ff82-45b5-b72b-ec05c215e36f", channel: "Telegram" },
    { id: "9e9de118-8aa5-408a-960c-74074c66cd8e", channel: "Facebook" },
    { id: "c32aeec7-50d7-4469-99a5-4235870d16a7", channel: "Instagram" },
    { id: "a2a83703-8c62-4216-b94d-9ecfdfc32438", channel: "Whatsapp" },
    // { id: "38b88988-58ce-4f49-b2ca-412bd8fa4b0f", channel: "Chat Widget" },
  ];

  // Compute which channels are “ready to connect”
  const readyChannels =
    agent.extensions
      ?.filter((ext) =>
        knownExtensions.some((ke) => ke.id === ext.extension_id && ext.is_connected)
      )
      .map((ext) => {
        const match = knownExtensions.find((ke) => ke.id === ext.extension_id);
        return match?.channel;
      })
      .filter((channel) => {
        // Exclude if *any* integration exists for that channel, regardless of its status
        return !agent.integrations?.some(
          (i) => i.integration_type?.[0]?.type === channel.toLowerCase()
        );
      }) || [];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" isDismissable={true}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-brand/10">
                    {getTypeIcon(agent.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-500">{agent.description}</p>
                  </div>
                </div>
              </ModalHeader>

              <ModalBody>
                <div className="space-y-6 detail">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-gray-100">
                        {agent.status === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <Chip
                          className={`${agent.status === true ? "bg-green-500" : "bg-gray-500"
                            } text-white mt-1`}
                          size="sm"
                        >
                          {agent.status === true ? "Live" : "Draft"}
                        </Chip>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Calendar className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Last Updated
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(agent.lastUpdated)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Agent Type */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Info className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Agent Type
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {agent.type.replace(/-/g, " ")}
                      </p>
                    </div>
                  </div>

                  <Divider />

                  {/* Channels */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Antenna className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        Channels
                      </p>

                      {agent.status ? (
                        <>
                          {/* 1. Show all ACTIVE integrations as Chips */}
                          {agent.integrations &&
                            agent.integrations.filter((i) => i.status).length > 0 ? (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-2">
                                Connected to:
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {agent.integrations
                                  .filter((integration) => integration.status)
                                  .map((integration) => {
                                    const rawType =
                                      integration.integration_type?.[0]?.type ||
                                      "unknown";
                                    const displayName = rawType
                                      .split("-")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ");
                                    return (
                                      <Chip
                                        key={integration.integration_id}
                                        size="sm"
                                        className="bg-green-100 text-green-800"
                                      // color="success"
                                      >
                                        {displayName}
                                      </Chip>
                                    );
                                  })}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-600 mt-1">
                              No channels connected
                            </p>
                          )}

                          {/* 2. If there are connected extensions but no corresponding integration yet, show “Ready to connect” */}
                          {readyChannels.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                              Ready to connect: {readyChannels.join(", ")}
                            </p>
                          )}

                          {/* 3. Link to edit channels */}
                          <p className="text-sm mt-2">
                            To edit your {agent.name} channels, click{" "}
                            <span
                              onClick={() =>
                                navigate(`/playground/${agent.id}`)
                              }
                              className="font-bold text-brand-dark cursor-pointer"
                            >
                              here
                            </span>{" "}
                            and go to the Channels tab.
                          </p>
                        </>
                      ) : (
                        // When agent is draft
                        <p className="text-sm text-gray-600 mt-1">
                          Click{" "}
                          <span
                            onClick={() => navigate(`/playground/${agent.id}`)}
                            className="font-bold text-brand-dark cursor-pointer"
                          >
                            here
                          </span>{" "}
                          to deploy your agent in order to connect to any channel.
                        </p>
                      )}
                    </div>
                  </div>

                  <Divider />

                  {/* Metrics */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                      <h4 className="text-md font-medium text-gray-800">
                        Performance Metrics
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-blue-100">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Total Conversations
                          </p>
                          <div className="flex items-center gap-1">
                            <p className="text-lg font-semibold text-gray-900">
                              {agent.metrics.totalConversations ||
                                agent.metrics.conversations ||
                                "0"}
                            </p>
                            {parseInt(
                              agent.metrics.totalConversations ||
                              agent.metrics.conversations ||
                              "0"
                            ) > 0 && (
                                <ExternalLink
                                  className="w-4 h-4 text-brand cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                    navigate(`/conversations?agt=${agent.id}`);
                                  }}
                                />
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-purple-100">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Engaged Conversations
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {agent.metrics.engagedConversations || "0"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-amber-100">
                          <UserPlus className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Total Leads
                          </p>
                          <div className="flex items-center gap-1">
                            <p className="text-lg font-semibold text-gray-900">
                              {agent.metrics.totalLeads || "0"}
                            </p>
                            {parseInt(agent.metrics.totalLeads || "0") > 0 && (
                              <ExternalLink
                                className="w-4 h-4 text-brand cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onClose();
                                  navigate(`/leads?agt=${agent.id}`);
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Engagement Rate
                          </p>
                          <div className="flex items-center gap-1">
                            <p className="text-lg font-semibold text-gray-900">
                              {agent.metrics.engagementRate || "0%"}
                            </p>
                            <ExternalLink
                              className="w-4 h-4 text-brand cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                                navigate("/");
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider />
                </div>
              </ModalBody>

              <ModalFooter className="w-full flex justify-between">
                <Button
                  size="lg"
                  variant="bordered"
                  color="danger"
                  onPress={() => {
                    onClose();
                    onDeleteClick(agent);
                  }}
                  startContent={<Trash2 className="w-4 h-4" />}
                >
                  Delete Agent
                </Button>

                <Button
                  size="lg"
                  className="bg-gradient-to-tr from-brand to-brand-secondary text-gray-900 edit"
                  onPress={() => {
                    onClose();
                    navigate(`/playground/${agent.id}`);
                  }}
                >
                  Edit Agent
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AgentQuickView;
