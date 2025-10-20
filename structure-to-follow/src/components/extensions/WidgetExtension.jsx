import { useState, useRef, useEffect, useContext } from "react";
import {
  Button,
  Tooltip,
  Tabs,
  Tab,
  Select,
  SelectItem
} from "@heroui/react";
import {
  Code2,
  Copy,
  Bot,
  Check,
  Globe,
  ArrowRight,
} from "lucide-react";
// import { agents } from "../../components/playground/utils/mockData";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import { chatService } from "../../api/services/chat.service";

export default function WidgetExtension({ onAgentSelect }) {
  const [selectedTab, setSelectedTab] = useState("html");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const embedCodeRef = useRef(null);
  const { userData } = useContext(UserDataContext);
  const currentUserId = userData?.client_id;
  // ----------------------------
  // Fetch Data on Mount
  // ----------------------------
  useEffect(() => {
    //console.log("Current User ID:", currentUserId);
    if (!currentUserId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        //console.log("Fetching chats...");
        const chats = await chatService.fetchChatIds(currentUserId);
        //console.log("Fetched chats:", chats);

        const newChatDetails = chats.chat_ids.map((chat) => ({
          value: chat.chat_id,
          id: chat.chat_id,
          user_id: chat.chat_id, // this is the  chat_id
          clientId: chat.client_id,
          name: chat.ai_config.bot_config.bot_name,
          type: chat.ai_config.bot_config.bot_role,
        }));
        //console.log("newChatDetails:", newChatDetails);
        setAgents(newChatDetails);
      } catch (error) {
        console.error("Error fetching leads/messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  // Set default selected agent when agents load
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      const defaultAgent = agents[0];
      setSelectedAgent(defaultAgent);
      if (onAgentSelect) onAgentSelect(defaultAgent);
    }
  }, [agents, selectedAgent, onAgentSelect]);

  // Scroll to embed code when an agent is selected
  useEffect(() => {
    if (selectedAgent && embedCodeRef.current) {
      setTimeout(() => {
        embedCodeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [selectedAgent]);

  // Get embed code for selected agent
  const getEmbedCode = (agent) => {
    if (userData.client_migration == "v1") {
      return `<script 
      type="module" 
      src="https://clarity-ai.onrender.com/static/js/chat-widget-life.js?clientId=${agent.clientId}&chatId=${agent.user_id}"></script>`;
    } else if (userData.client_migration == "v2") {
      return `<script 
      type="module"
      src="https://chat.olivianetwork.ai/static/js/chat-widget-life.js?clientId=${agent.clientId}&chatId=${agent.user_id}"></script>`;
    }
    //     return `<script
    //   type="module"
    //   src="https://clarity-ai.onrender.com/static/js/chat-widget-life.js?clientId=${agent.clientId}&chatId=${agent.user_id}"
    // ></script>`;
  };

  // Handle copy code to clipboard
  const handleCopyCode = async () => {
    if (!selectedAgent) return;

    try {
      await navigator.clipboard.writeText(getEmbedCode(selectedAgent));
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  return (
    agents ? (
      <div className="space-y-6">
        <div className="space-y-6">
          {/* Agent Selection Dropdown */}
          <div className="space-y-4">
            {agents.length > 1 ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-brand/10">
                    <Bot className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Select an Agent</h3>
                    <p className="text-sm text-gray-500">Choose the agent you want to embed</p>
                  </div>
                </div>
                <Select
                  label="Select Agent"
                  placeholder="Choose an agent"
                  className="w-full"
                  defaultSelectedKeys={agents.length > 0 ? [agents[0].id] : []}
                  onChange={(e) => {
                    const agent = agents.find(a => a.id === e.target.value);
                    setSelectedAgent(agent);
                    if (onAgentSelect) {
                      onAgentSelect(agent);
                    }
                  }}
                >
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </Select>
              </>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Bot className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{agents[0]?.name}</h3>
                  <p className="text-sm text-gray-500">Your agent available</p>
                </div>
              </div>
            )}
          </div>

          {/* Installation Instructions */}
          {selectedAgent && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-brand/10">
                  <Code2 className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="font-medium text-gray-900">Installation Instructions</h3>
              </div>

              <Tabs
                aria-label="Installation methods"
                classNames={{
                  tabList: "gap-4 p-0",
                  cursor: "bg-brand",
                  tab: "max-w-fit px-0 h-10",
                  tabContent: "group-data-[selected=true]:text-gray-900 px-2"
                }}
                variant="underlined"
                size="sm"
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
              >
                <Tab key="html" title="HTML" className="p-0">
                  <div className="pt-4 space-y-4">
                    <ol className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">1</div>
                        <div>
                          <p>Copy the generated embed code below</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">2</div>
                        <div>
                          <p>Paste the code into your website's HTML <span className="font-semibold">inside the {"<head>"} tag</span></p>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 font-mono text-xs text-gray-600 overflow-x-auto">
                            <div>{"<!DOCTYPE html>"}</div>
                            <div>{"<html>"}</div>
                            <div className="pl-2">{"<head>"}</div>
                            <div className="pl-4 text-brand font-semibold">{"<!-- Paste the embed code here -->"}</div>
                            <div className="pl-2">{"</head>"}</div>
                            <div className="pl-2">{"<body>"}</div>
                            <div className="pl-4">{"<!-- Your website content -->"}</div>
                            <div className="pl-2">{"</body>"}</div>
                            <div>{"</html>"}</div>
                          </div>
                        </div>
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-brand/10 rounded-lg">
                      <p className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="font-semibold shrink-0">Note:</span>
                        <span>Adding the script to the head section ensures optimal loading and performance of your chat widget.</span>
                      </p>
                    </div>
                  </div>
                </Tab>
                <Tab key="wordpress" title="WordPress" className="p-0">
                  <div className="pt-4 space-y-4">
                    <div className="space-y-3 text-sm text-gray-600">
                      <h4 className="font-medium text-gray-900">Method 1: Theme Editor</h4>
                      <ol className="space-y-3">
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">1</div>
                          <div>
                            <p>Log in to your <span className="font-semibold">WordPress admin panel</span></p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">2</div>
                          <div>
                            <p>Go to <span className="font-semibold">Appearance → Theme Editor</span></p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">3</div>
                          <div>
                            <p>Select your active theme's <span className="font-semibold">header.php</span> file</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">4</div>
                          <div>
                            <p>Locate the <span className="font-semibold">{"<head>"}</span> section and paste the embed code just before the closing <span className="font-semibold">{"</head>"}</span> tag</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">5</div>
                          <div>
                            <p>Click <span className="font-semibold">"Update File"</span> to save changes</p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      <h4 className="font-medium text-gray-900">Method 2: Plugin (Recommended)</h4>
                      <ol className="space-y-3">
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">1</div>
                          <div>
                            <p>Install and activate the <span className="font-semibold cursor-pointer text-brand underline" onClick={() => window.open("https://en-gb.wordpress.org/plugins/header-and-footer-scripts/", "_blank")}>"Header and Footer Scripts"</span> plugin</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">2</div>
                          <div>
                            <p>Go to <span className="font-semibold">Settings → Header and Footer Scripts</span></p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">3</div>
                          <div>
                            <p>Paste the embed code in the <span className="font-semibold">"Scripts in Header"</span> section</p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">4</div>
                          <div>
                            <p>Click <span className="font-semibold">"Save Settings"</span> to apply changes</p>
                          </div>
                        </li>
                      </ol>
                    </div>

                    <div className="mt-4 p-3 bg-brand/10 rounded-lg">
                      <p className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="font-semibold shrink-0">Pro tip:</span>
                        <span>The plugin method is safer and won't be affected by theme updates.</span>
                      </p>
                    </div>
                  </div>
                </Tab>
                <Tab key="shopify" title="Shopify" className="p-0">
                  <div className="pt-4 space-y-4">
                    <ol className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">1</div>
                        <div>
                          <p>Log in to your <span className="font-semibold">Shopify admin panel</span></p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">2</div>
                        <div>
                          <p>Go to <span className="font-semibold">Online Store → Themes</span></p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">3</div>
                        <div>
                          <p>Click <span className="font-semibold">"Actions" → "Edit code"</span> on your active theme</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">4</div>
                        <div>
                          <p>Open the <span className="font-semibold">theme.liquid</span> file</p>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100 font-mono text-xs text-gray-600 overflow-x-auto">
                            <div className="pl-2">{"<head>"}</div>
                            <div className="pl-4 text-brand font-semibold">{"<!-- Paste the embed code here -->"}</div>
                            <div className="pl-2">{"</head>"}</div>
                          </div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">5</div>
                        <div>
                          <p>Click <span className="font-semibold">"Save"</span> to apply changes</p>
                        </div>
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-brand/10 rounded-lg">
                      <p className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="font-semibold shrink-0">Important:</span>
                        <span>Test the chat widget in your theme preview before saving to ensure it works correctly with your store design.</span>
                      </p>
                    </div>
                  </div>
                </Tab>
                <Tab key="gtm" title="Google Tag Manager" className="p-0">
                  <div className="pt-4 space-y-4">
                    <ol className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">1</div>
                        <div>
                          <p>Log in to <span className="font-semibold">Google Tag Manager</span></p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">2</div>
                        <div>
                          <p>Create a new <span className="font-semibold">Custom HTML tag</span></p>
                          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMuNSA0QzEzLjUgMy43MjM4NiAxMy4yNzYxIDMuNSAxMyAzLjVIMTFDMTAuNzIzOSAzLjUgMTAuNSAzLjcyMzg2IDEwLjUgNFYxMC41SDRDMy43MjM4NiAxMC41IDMuNSAxMC43MjM5IDMuNSAxMVYxM0MzLjUgMTMuMjc2MSAzLjcyMzg2IDEzLjUgNCAxMy41SDEwLjVWMjBDMTAuNSAyMC4yNzYxIDEwLjcyMzkgMjAuNSAxMSAyMC41SDEzQzEzLjI3NjEgMjAuNSAxMy41IDIwLjI3NjEgMTMuNSAyMFYxMy41SDIwQzIwLjI3NjEgMTMuNSAyMC41IDEzLjI3NjEgMjAuNSAxM1YxMUMyMC41IDEwLjcyMzkgMjAuMjc2MSAxMC41IDIwIDEwLjVIMTMuNVY0WiIgZmlsbD0iI0NDRkMwMSIvPjwvc3ZnPg==" alt="Add Custom HTML Tag" className="mt-2 h-6 w-6" />
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">3</div>
                        <div>
                          <p>Paste the embed code into the HTML field</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">4</div>
                        <div>
                          <p>Under <span className="font-semibold">Advanced Settings</span>, set <span className="font-semibold">Tag firing options → Tag placement</span> to <span className="font-semibold">"Top of page in HEAD"</span></p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">5</div>
                        <div>
                          <p>Set the trigger to <span className="font-semibold">"All Pages"</span> (or your preferred trigger)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">6</div>
                        <div>
                          <p>Save and <span className="font-semibold">publish</span> your container</p>
                        </div>
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-brand/10 rounded-lg">
                      <p className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="font-semibold shrink-0">Pro tip:</span>
                        <span>Use GTM's Preview mode to test the chat widget before publishing. This allows you to verify the integration without affecting your live site.</span>
                      </p>
                    </div>
                  </div>
                </Tab>
              </Tabs>

              {/* Video Section */}
              <div className="mt-6">
                <div className="rounded-lg border border-gray-100 overflow-hidden bg-gray-50 h-[180px] relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="p-3 rounded-full bg-brand/10 mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 8L16 12L10 16V8Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Installation Guide</p>
                    <p className="text-xs text-gray-500 text-center max-w-[80%]">Watch how to add the chat widget to your website</p>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="bg-brand text-gray-900"
                        variant="flat"
                      >
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embed Code Section */}
              <div ref={embedCodeRef} className="bg-white border border-gray-100 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-brand/10">
                      <Globe className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedAgent.name}</h3>
                      <p className="text-xs text-gray-500">Embed Code</p>
                    </div>
                  </div>
                  <Tooltip content={copied ? "Copied!" : "Copy code"}>
                    <Button
                      className="bg-brand text-gray-900 min-w-[40px] sm:min-w-[70px]"
                      size="sm"
                      startContent={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      onClick={handleCopyCode}
                    >
                      <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                    </Button>
                  </Tooltip>
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <pre className="text-brand text-xs sm:text-sm font-mono whitespace-pre-wrap break-all">
                    {getEmbedCode(selectedAgent)}
                  </pre>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Your chat widget will appear in the bottom-right corner of your website
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ) : (
      null
    )
  );
}
