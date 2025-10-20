import React, { useContext, useEffect, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Input,
  Switch,
  Slider,
  Avatar,
  Autocomplete,
  AutocompleteItem,
  Image,
  Divider,
  Select,
  SelectItem,
} from "@heroui/react";
import { MessageSquare, Palette, Link, Globe, Trash2 } from "lucide-react";
import { aiModels, aiModelsV2, aiGoals } from "../utils/configData";
import { countries } from "../../../utils/countryData";
import { UserDataContext } from "../../../context/UserDataContext";

import Joyride from 'react-joyride';
import useTourController from "../../../Demo/utils/useTourController";
import MyCustomTooltip from "../../../Demo/CustomTooltip/MyCustomTooltip";
import { aiConfigurationSteps } from "../../../Demo/Playground/aiConfiguration.demo";
import { chatService } from "../../../api";


const AIConfiguration = ({
  selectedModel,
  setSelectedModel,
  selectedModelV2,
  setSelectedModelV2,
  selectedGoal,
  setSelectedGoal,
  brandColor,
  setBrandColor,
  showLeadForm,
  setShowLeadForm,
  responseDelay,
  setResponseDelay,
  webhook,
  setWebhook,
  calendarLink,
  setCalendarLink,
  countryCode,
  setCountryCode,
  onDeleteAgent,
}) => {
  // Find the selected country object
  const selectedCountry = countries.find(country => country.code === countryCode) || countries.find(country => country.code === "GB");
  const { userData, loggedInUser } = useContext(UserDataContext);
  const [aiVersion, setAiVersion] = useState(null);
  const [selectedModelName, setSelectedModelName] = useState(null);
  const [chatId, setChatId] = useState(null)
  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("aiConfiguration", loggedInUser);

  useEffect(() => {
    // Extract agent ID from URL
    const pathname = window.location.pathname;
    const match = pathname.match(/\/playground\/([^\/]+)/);
    if (match && match[1]) {
      setChatId(match[1]);
    }
  }, []);


  // Fetch chat data and ai_version when chatId changes
  useEffect(() => {
    const fetchChatData = async () => {
      if (chatId) {
        try {
          const chatData = await chatService.fetchChatbyId(chatId);
          if (chatData && chatData.ai_version) {
            setAiVersion(chatData.ai_version);
            setSelectedModelName(chatData.model_names_v2)
            //console.log('AI Version:', chatData.ai_version);
          }
        } catch (error) {
          console.error('Error fetching chat data:', error);
        }
      }
    };

    fetchChatData();
  }, [chatId]);

  return (
    <>
      {/* Joyride component at the top level */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={aiConfigurationSteps}
        run={runTour}
        scrollOffset={300}
        continuous={true}
        showSkipButton={true}
        tooltipComponent={MyCustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 999,
          },
        }}
      />
      <Accordion
        aria-label="AI Configuration"
        variant="bordered"
        className="bg-white border border-gray-100 configuration-welcome"
        defaultExpandedKeys={["1"]}
      >
        <AccordionItem
          key="1"
          aria-label="AI Configuration"
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <MessageSquare className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-lg font-semibold text-gray-900">AI Configuration</span>
            </div>
          }
          subtitle="Select AI model, agent goal, brand color, and other settings"
        >
          <div className="px-4 py-2 space-y-4">

            {
              userData.account_type == "advanced" || userData.account_type == "enterprise" || loggedInUser.role == "God Mode" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Your AI Model</label>
                  <Autocomplete
                    aria-label="AI Model Selection"
                    defaultItems={aiVersion !== "v2" ? aiModels : aiModelsV2}
                    selectedKey={aiVersion !== "v2" ? selectedModel : selectedModelV2}
                    onSelectionChange={(modelKey) => {
                      if (modelKey) {
                        //console.log("Model changed to:", modelKey);
                        aiVersion !== "v2" ? setSelectedModel(modelKey.toString()) : setSelectedModelV2(modelKey.toString());
                      }
                    }}
                    placeholder="Search for an AI model..."
                    className="w-full"
                    defaultFilter={(textValue, inputValue) => {
                      const modelName = textValue.toLowerCase();
                      const searchValue = inputValue.toLowerCase();
                      return modelName.includes(searchValue);
                    }}
                  >
                    {(model) => (
                      <AutocompleteItem
                        key={model.key}
                        className="gap-2"
                        textValue={model.name}
                      >
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              ) : (null)
            }


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent goal</label>
              <Autocomplete
                aria-label="Agent Goal Selection"
                defaultItems={aiGoals}
                selectedKey={selectedGoal}
                onSelectionChange={(goalKey) => {
                  if (goalKey) {
                    const newGoal = goalKey.toString();
                    // console.log("Goal changed to:", newGoal);
                    // console.log("Previous goal:", selectedGoal);

                    // Mark that the goal has been manually changed
                    if (selectedGoal !== newGoal && window.playgroundState?.selectedAgent) {
                      window.playgroundState.selectedAgent.goalManuallyChanged = true;
                    }

                    setSelectedGoal(newGoal);
                  }
                }}
                placeholder="Search for an agent goal..."
                className="w-full"
                defaultFilter={(textValue, inputValue) => {
                  const goalName = textValue.toLowerCase();
                  const searchValue = inputValue.toLowerCase();
                  return goalName.includes(searchValue);
                }}
              >
                {(goal) => (
                  <AutocompleteItem
                    key={goal.key}
                    className="gap-2"
                    textValue={goal.name}
                  >
                    <div className="flex items-center gap-2">
                      <span>{goal.name}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select your brand color</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-md cursor-pointer border border-gray-200"
                  style={{ backgroundColor: brandColor }}
                  onClick={() => document.getElementById('color-picker').click()}
                  aria-label="Color picker preview"
                />
                <input
                  id="color-picker"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="hidden"
                  aria-label="Select brand color"
                />
                <Input
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#CCFC01"
                  size="sm"
                  startContent={<Palette className="w-4 h-4 text-gray-400" />}
                  aria-label="Brand color hex code"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Lead capture form</label>
                <Switch
                  isSelected={showLeadForm}
                  onChange={(e) => setShowLeadForm(e.target.checked)}
                  size="sm"
                  aria-label="Toggle lead capture form"
                  aria-labelledby="Toggle lead capture form"
                />
              </div>
              <p className="text-xs text-gray-500">Show or hide the form from your chat widget!</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delay Your Agent Response</label>
              <p className="text-xs text-gray-500 mb-2">You can delay your agent response below</p>
              <div className="space-y-2">
                <Slider
                  size="sm"
                  step={1}
                  maxValue={10}
                  minValue={0}
                  value={responseDelay}
                  onChange={(value) => setResponseDelay(value)}
                  className="max-w-md"
                  aria-label="Response delay in seconds"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Instant Reply</span>
                  <span>{responseDelay}/sec</span>
                </div>
              </div>
            </div>

            {/* {
              loggedInUser.role == "God Mode" || loggedInUser.account_type == "pro" || loggedInUser.account_type == "enterprise" ? ( */}
            <div>
              {
                loggedInUser.role == "God Mode" || loggedInUser.account_type == "pro" || loggedInUser.account_type == "enterprise" ? (
                  null
                ) : <label className="block text-sm font-medium mb-1 text-[#5aba4f]">Upgrade your plan to Pro to unlock this feature</label>
              }
              < label className="block text-sm font-medium text-gray-700 mb-1">Set Webhook (Optional on Pro plan)</label>
              <p className="text-xs text-gray-500 mb-2">Send raw messages to your CRM via Webhook.</p>
              <Input
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                isDisabled={loggedInUser.role == "God Mode" || loggedInUser.account_type == "pro" || loggedInUser.account_type == "enterprise" ? false : true} placeholder="https://example-webhook.com"
                size="sm"
                startContent={<Link className="w-4 h-4 text-gray-400" />}
                aria-label="Webhook URL"
              />
            </div>

            {
              aiVersion == "v2" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agent Language/Region</label>
                  <p className="text-xs text-gray-500 mb-2">Set the primary language and region for your agent.</p>
                  <Autocomplete
                    aria-label="Agent Language/Region"
                    defaultItems={countries}
                    selectedKey={countryCode}
                    onSelectionChange={(code) => {
                      if (code) {
                        setCountryCode(code.toString());
                      }
                    }}
                    placeholder="Search for a country..."
                    className="w-full"
                    defaultFilter={(textValue, inputValue) => {
                      const countryName = textValue.toLowerCase();
                      const countryCode = textValue.split('(')[1]?.toLowerCase() || '';
                      const searchValue = inputValue.toLowerCase();
                      return countryName.includes(searchValue) ||
                        countryCode.includes(searchValue);
                    }}
                    startContent={
                      selectedCountry ? (
                        <img
                          src={selectedCountry.flagUrl}
                          alt={selectedCountry.name}
                          className="w-5 h-auto mr-2"
                        />
                      ) : null
                    }
                  >
                    {(country) => (
                      <AutocompleteItem
                        key={country.code}
                        className="gap-2"
                        textValue={`${country.name} (${country.code})`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={country.flagUrl}
                            alt={country.name}
                            className="w-5 h-auto"
                          />
                          <span>{country.name}</span>
                          <span className="text-gray-400">({country.code})</span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                </div>
              ) : null
            }

            {/* Calendar Link section - only shown for appointment-setter goal */}
            {selectedGoal === "appointment-setter" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Calendar Link</label>
                <p className="text-xs text-gray-500 mb-2">Add your calendar link for appointment scheduling.</p>
                <Input
                  value={calendarLink}
                  onChange={(e) => setCalendarLink(e.target.value)}
                  placeholder="https://calendly.com/your-link"
                  size="sm"
                  startContent={<Link className="w-4 h-4 text-gray-400" />}
                  aria-label="Calendar Link URL"
                />
              </div>
            )}

            {/* Delete Agent Section */}
            {onDeleteAgent && (
              <>
                <Divider className="my-4" />
                <div>
                  <h3 className="text-sm font-medium text-danger mb-2">Danger Zone</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Permanently delete this agent and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    color="danger"
                    variant="bordered"
                    startContent={<Trash2 className="w-4 h-4" />}
                    onPress={onDeleteAgent}
                    className="w-full sm:w-auto"
                  >
                    Delete Agent
                  </Button>
                </div>
              </>
            )}
          </div>
        </AccordionItem>
      </Accordion >
    </>
  );
};

export default AIConfiguration;
