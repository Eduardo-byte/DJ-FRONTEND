import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import DeployAgentModal from "../../components/DeployAgentModal";
import {
  ChevronDown,
  Search,
  Globe,
  Bot,
  CircleAlert,
  CirclePlay,
  Power
} from "lucide-react";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import { chatService, integrationService } from "../../api";
import SetToDraftModal from "../SetToDraftModal";


const PlaygroundHeader = ({
  selectedAgent,
  setSelectedAgent,
  filteredAgents,
  searchQuery,
  setSearchQuery,
  handleSelectAgent,
  setChatType,
  chatType,
  handleApplyChanges
}) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Local state for button label, default to "Deploy"
  const [buttonLabel, setButtonLabel] = useState("Deploy");

  const [isDraftOpen, setIsDraftOpen] = useState(false);

  const { userData, loggedInUser } = useContext(UserDataContext);
  // Update button label whenever selectedAgent (or its status) changes
  useEffect(() => {
    if (selectedAgent) {
      setButtonLabel(selectedAgent.originalData.status === true ? "Save Changes" : "Deploy");
    }
  }, [selectedAgent]);

  const handleSetToDraftClick = (agent) => {
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
        setSelectedAgent({
          ...selectedAgent,
          originalData: {
            ...selectedAgent.originalData,
            status: false,            // flip the nested status to false
          },
          status: false
        });
        // alert(`Agent "${agent.name}" set to draft mode.`);
        // Update the agent in the state
      } else {
        toast.warning("Failed to set agent to draft mode. Please try again.");
      }
    } catch (error) {
      console.error("Error setting agent to draft:", error);
      toast.warning("An error occurred while setting the agent to draft mode. Please try again.");
    }

    closeDraftModal();
  };

  //here when deploying on Playground
  const handleDeploy = (agent, channel) => {
    // In a real app, this would deploy the agent configuration
    if (selectedAgent && selectedAgent.status) {
      handleApplyChanges(false);
    } else if (selectedAgent && selectedAgent.status == false) {
      handleApplyChanges(true);
      setButtonLabel("Save Changes")
    }
    // console.log("filteredAgents: ", filteredAgents)
    // alert(`Agent "${agent.name}" deployed to ${channel} successfully!`);
    toast.success(`Agent "${agent.name}" deployed to ${channel} successfully!`)
  };


  return (
    <div className="z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-col justify-start w-full">

        <Breadcrumbs className="mb-2">
          <BreadcrumbItem className="cursor-pointer" onPress={() => { navigate('/agents') }}>Agents</BreadcrumbItem>
          <BreadcrumbItem className="font-bold">{selectedAgent?.name} </BreadcrumbItem>
        </Breadcrumbs>
        <div className="w-full flex flex-col">
          <div className="w-full">
            {selectedAgent?.originalData?.status ? (
              null
            ) : (
              <div className="w-full flex justify-start items-center gap-2 bg-warning-300/10 p-2 text-warning-600 rounded-xl">
                <CircleAlert />
                <div className="w-full flex justify-between items-center">
                  <div>
                    <p className=" text-sm">
                      Your agent <strong>{selectedAgent?.name}</strong> is still in Draft, <strong>click the deploy button</strong> and follow the steps
                    </p>
                    <p className="text-sm mt-1">
                      Configure and test your Agent and deploy it when ready
                    </p>
                  </div>
                  {/* <div>
                    <Button size="sm" color="warning" className="cursor-pointer flex justify-center items-center gap-1"><CirclePlay size={16} /> Watch Tutorial</Button>
                  </div> */}
                </div>
              </div>
            )}
          </div>


          <div className="w-full flex justify-between items-center my-2">
            <div className="w-full flex flex-col justify-start">
              <div className="flex justify-start items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{selectedAgent?.name}</h1>
                <div className="flex justify-start items-center gap-1">
                  {selectedAgent?.originalData?.status ? (
                    <>
                      <div className="w-3 h-3 bg-brand rounded-full" />
                      <p className="text-sm opacity-75">Live</p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      <p className="text-sm opacity-75">Draft</p>
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm  opacity-80 mt-1">Teach your {selectedAgent?.name} agent everything about your business!</p>
            </div>
            <div className="flex justify-end gap-4">
              {selectedAgent?.originalData?.status &&
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:items-center w-full sm:w-auto">
                  <Button onPress={() => handleSetToDraftClick(selectedAgent)} size="sm" color="default" className="cursor-pointer bg-opacity-75 flex justify-center items-center gap-1"><Power size={16} /> Set to Draft</Button>
                </div>
              }

              {/* NOTE: THIS IS THE SAVE CHANGES OR DEPLOY */}
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:items-center w-full sm:w-auto">
                {loggedInUser.role == "God Mode" &&
                  <Autocomplete
                    aria-label="Select agent"
                    className="w-full"
                    defaultItems={filteredAgents.map(agent => ({
                      label: agent.name,
                      key: agent.id,
                      description: agent.description
                    }))}
                    placeholder="Search agents"
                    startContent={<Bot className="w-4 h-4 text-gray-400" />}
                    variant="bordered"
                    size="sm"
                    selectedKey={selectedAgent ? selectedAgent.id : ""}
                    onSelectionChange={(key) => {
                      const selected = filteredAgents.find(agent => agent.id === key);
                      if (selected) {
                        handleSelectAgent(selected);
                        navigate(`/playground/${selected.id}`);
                      }
                    }}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.key} textValue={item.label}>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-xs text-gray-500 truncate">{item.description}</span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                }
                <Button
                  className="bg-brand text-gray-900 w-full "
                  startContent={<Globe className="w-4 h-4" />}
                  size="sm"
                  // when the deploy modal is complete uncomment the bellow here
                  //here
                  onPress={selectedAgent && selectedAgent.originalData.status === true ? () => handleApplyChanges(false) : onOpen}
                  // onPress={onOpen}
                  isDisabled={!selectedAgent}
                  aria-label="Deploy agent"
                >
                  {buttonLabel}
                  {/* {selectedAgent && selectedAgent.status === true ? "Save Changes" : "Deploy"} */}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Deploy Agent Modal */}
      <DeployAgentModal
        isOpen={isOpen}
        onClose={onClose}
        agent={selectedAgent}
        setChatType={setChatType}
        chatType={chatType}
        onDeploy={handleDeploy}
      />

      <SetToDraftModal
        isOpen={isDraftOpen}
        onClose={closeDraftModal}
        agent={selectedAgent}
        onSetToDraft={handleSetToDraft}
      />
    </div>
  );
};

export default PlaygroundHeader;
