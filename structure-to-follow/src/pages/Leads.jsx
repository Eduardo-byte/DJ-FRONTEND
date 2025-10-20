import React, { useState, useEffect, useMemo, useContext } from "react";
import EditLeadModal from "../components/leads/EditLeadModal";
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Avatar,
  Tooltip,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Pagination,
  Autocomplete,
  AutocompleteItem,
  ScrollShadow,
  Skeleton,
} from "@heroui/react";
import {
  Search,
  Filter,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Send,
  Globe,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Download,
  Eye,
  Edit3,
  Trash,
  ArrowDown,
  ArrowUp,
  Bot,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";
import { today, getLocalTimeZone } from "@internationalized/date";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import DateRangePicker from "../components/datePicker/dateRangePicker";
import { UserDataContext } from "../context/UserDataContext";
import DraggableTabsContainer from "../components/Tabs/DraggableComponent";
import CustomTabs from "../components/Tabs/CustomTabs";
import HiddenScrollbarOnScroll from "../components/Tabs/HiddenScrollbarOnScroll";
import { channels, getChannelColor, getChannelIcon, getStatusColor, leadStatuses, sortOptions } from "../utils/globalFunctions";
import ReactSelect, { components } from 'react-select';
import DeleteLeadModal from "../components/leads/DeleteLeadModal";
import { conversationService } from "../api/services/conversations.service";
import { userService } from "../api/services/users.service";
import { chatService } from "../api/services/chat.service";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import Joyride from 'react-joyride';
import useTourController from '../Demo/utils/useTourController';
import { leadsSteps } from '../Demo/Leads/leads.demo';
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip';

// =============================================================================
// Main Leads Component
// =============================================================================
export default function Leads() {
  // ----------------------------
  // Data & UI State Variables
  // ----------------------------
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed userChatMapping - using lead.chat_id directly for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // FIXED: We'll update sort logic to rely on "updated_at" instead of "lastContact"
  const [sortBy, setSortBy] = useState("newest");
  const [dateRangeValue, setDateRangeValue] = useState({
    start: today(getLocalTimeZone()).subtract({ years: 2 }),
    end: today(getLocalTimeZone()),
  });
  // FIXED: We'll handle "select all" across the filtered data
  const [selectedKeys, setSelectedKeys] = useState(new Set());

  // FIXED: We'll add state & logic for pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // For the lead details modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadMessages, setLeadMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // For the edit lead modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);

  // for  the delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // For chat dropdown
  const [chatDetails, setChatDetails] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  // Getting the URL parameter "agt"
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlAgt = queryParams.get("agt");
  // ----------------------------
  // User & API Variables
  // ----------------------------
  const { userData, loggedInUser } = useContext(UserDataContext);
  const currentUserId = userData?.client_id;

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("leads", loggedInUser);

  // ----------------------------
  // Fetch Data on Mount
  // ----------------------------
  useEffect(() => {
    // console.log("Current User ID:", currentUserId);
    if (!currentUserId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        //console.log("Fetching users...");
        const users = await userService.fetchAllUsers(currentUserId);
        //console.log("Fetched users:", users);

        // Fetch available chats for the dropdown
        const chatIds = await chatService.fetchChatIds(currentUserId);
        if (chatIds && chatIds.chat_ids && users) {
          // Get unique chat_ids from leads that actually have data
          const leadsWithChatIds = users.filter(lead => lead.chat_id);
          const uniqueChatIdsWithLeads = [...new Set(leadsWithChatIds.map(lead => lead.chat_id))];
          
          // Only show chats that have leads
          const chatsWithLeads = chatIds.chat_ids.filter(chat => 
            uniqueChatIdsWithLeads.includes(chat.chat_id)
          );
          
          const newChatDetails = chatsWithLeads.map((chat) => ({
            value: chat.chat_id,
            label: chat?.chat_config?.global_?.businessDetails?.businessInfo.businessName || "Default Company",
            botName: chat?.ai_config?.bot_config?.bot_name || "BotName"
          }));
          
          // Set the default selected chat if available
          if (urlAgt && uniqueChatIdsWithLeads.includes(urlAgt)) {
            setSelectedChatId(urlAgt);
          } else if (newChatDetails.length > 0) {
            // Default to the first chat that has leads
            setSelectedChatId(newChatDetails[0].value);
          } else {
            setSelectedChatId(null);
          }
          setChatDetails(newChatDetails);
        }

        // No need to load messages - leads already have chat_id field!
        
        setLeads(users || []);
        // console.log("users: ", users);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUserId, showSuccessMessage, isEditModalOpen, isDeleteModalOpen, leadToDelete]);

  // ----------------------------
  // Apply Filters & Sorting
  // ----------------------------
  useEffect(() => {
    // console.log("Applying filters. Original leads:", leads);
    let tempLeads = [...leads];

    // Search filter (name, email, company)
    if (searchQuery.trim() !== "") {
      // console.log("Filtering by search query:", searchQuery);
      tempLeads = tempLeads.filter((lead) => {
        const dataString = `${lead.first_name || ""} ${lead.last_name || ""} ${lead.email || ""} ${lead.company || ""}`.toLowerCase();
        return dataString.includes(searchQuery.toLowerCase());
      });
      // console.log("After search filter:", tempLeads);
    }

    // Channel filter: if lead.channel is missing, default to "website"
    if (selectedChannel !== "all") {
      // console.log("Filtering by channel:", selectedChannel);
      tempLeads = tempLeads.filter(
        (lead) => (lead.channel || "website") === selectedChannel
      );
      // console.log("After channel filter:", tempLeads);
    }

    // Status filter: if lead.status is missing, default to "new"
    if (selectedStatus !== "all") {
      // console.log("Filtering by status:", selectedStatus);
      tempLeads = tempLeads.filter(
        (lead) => (lead.status || "new") === selectedStatus
      );
      // console.log("After status filter:", tempLeads);
    }

    // Chat filtering: filter leads based on selectedChatId using lead.chat_id
    if (selectedChatId) {
      tempLeads = tempLeads.filter(lead => lead.chat_id === selectedChatId);
    }

    // 5. Sort by newest/oldest/etc.
    // console.log("Sorting leads by:", sortBy);
    tempLeads.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.updated_at) - new Date(b.updated_at);
        case 'unread':
          return b.unread - a.unread;
        case 'name':
          return (a.first_name || '').localeCompare(b.first_name || '');
        default: // newest
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });
    // console.log("Final filtered leads:", tempLeads);

    setFilteredLeads(tempLeads);
    setPage(1); // Reset pagination on filter change
    setSelectedKeys(new Set());
  }, [leads, searchQuery, selectedChannel, selectedStatus, sortBy, selectedChatId]);

  // ----------------------------
  // Pagination Calculations - FIXED
  // ----------------------------
  const totalPages = useMemo(() => {
    // console.log("Calculating total pages. Filtered leads length:", filteredLeads.length, "Rows per page:", rowsPerPage);
    return Math.ceil(filteredLeads.length / rowsPerPage);
  }, [filteredLeads, rowsPerPage]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    // console.log("Paginating items. Page:", page, "Rows per page:", rowsPerPage, "Total filtered leads:", filteredLeads.length);
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, filteredLeads]);

  // ----------------------------
  // Export Functionality with messages (fetched individually)
  // ----------------------------
  const [exportLoading, setExportLoading] = useState(false);

  // Helper function to sanitize phone numbers for export
  const sanitizePhoneNumber = (phoneNumber) => {
    // Handle undefined, null, or empty values
    if (!phoneNumber || phoneNumber === 'undefined' || phoneNumber === 'null') {
      return "N/A";
    }
    
    // Clean up the phone number (remove extra spaces, ensure it's a string)
    const cleanPhone = String(phoneNumber).trim();
    
    // If it's still empty after trimming, return N/A
    if (cleanPhone === "") {
      return "N/A";
    }
    
    // Return the cleaned phone number
    return cleanPhone;
  };

  const handleExportSelected = async () => {
    //console.log("Exporting selected leads. Selected keys:", selectedKeys);
    if (selectedKeys.size === 0) {
      toast.warning("No leads selected for export.");
      return;
    }

    const leadsToExport =
      selectedKeys.size === filteredLeads.length
        ? filteredLeads
        : filteredLeads.filter((lead) => selectedKeys.has(lead.user_id));

    //console.log("Leads to export:", leadsToExport);
    
    setExportLoading(true);
    toast.loading("Exporting leads and messages...", { id: "export-toast" });

    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Lead ID,Name,Email Address,Phone Number,Status,Channel,Conversations\r\n";

      // Fetch messages for each lead individually
      for (const lead of leadsToExport) {
        try {
          const leadMessages = await conversationService.fetchAllMessagesByUserId(lead.user_id);
          
          // Format conversations for CSV
          let conversations = "";
          if (leadMessages && leadMessages.length > 0) {
            conversations = leadMessages
              .map((message) => {
                // If message.content is an object containing "messages", flatten it
                if (typeof message.content === "object" && message.content.messages) {
                  return message.content.messages
                    .map((m) => `${m.message_type}: ${m.content}`)
                    .join(" | ");
                } else {
                  // Otherwise, just convert to string
                  return `${message.message_type}: ${String(message.content)}`;
                }
              })
              .join(" || ");
          }

          const row = `"${lead.user_id}","${lead.first_name} ${lead.last_name}","${lead.email}","${sanitizePhoneNumber(lead.phone_number)}","${lead.status || 'new'}","${lead.channel || 'website'}","${conversations.replace(/"/g, '""')}"`;
          csvContent += row + "\r\n";
        } catch (error) {
          console.error(`Error fetching messages for lead ${lead.user_id}:`, error);
          // Still export the lead without messages if there's an error
          const row = `"${lead.user_id}","${lead.first_name} ${lead.last_name}","${lead.email}","${sanitizePhoneNumber(lead.phone_number)}","${lead.status || 'new'}","${lead.channel || 'website'}","Error loading messages"`;
          csvContent += row + "\r\n";
        }
      }

      // console.log("CSV Content:", csvContent);

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "selected_leads_with_conversations.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export completed successfully!", { id: "export-toast" });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.", { id: "export-toast" });
    } finally {
      setExportLoading(false);
    }
  };

  // ----------------------------
  // Delete multiple leads
  // ----------------------------
  const handleDeleteSelected = () => {
    // Filter the leads that are selected using the user_id in selectedKeys.
    const leadsToDelete = filteredLeads.filter((lead) =>
      selectedKeys.has(lead.user_id)
    );
    setLeadToDelete(leadsToDelete);
    setIsDeleteModalOpen(true);
  };


  // ----------------------------
  // Helper Functions for Table Cells
  // ----------------------------
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateString));
  };

  // For the chat dropdown
  const handleChatSelect = (selectedOption) => {
    if (selectedOption) {
      setSelectedChatId(selectedOption.value);
    } else {
      setSelectedChatId(null);
    }
    // Filtering will happen automatically via useEffect when selectedChatId changes
    // Uses lead.chat_id field directly - no message loading needed!
  };

  // For the edit lead modal
  const handleEditClick = (lead) => {
    // console.log("handleEditClick called with lead:", lead);
    setLeadToEdit(lead);
    setIsEditModalOpen(true);
  };

  // Log state changes for debugging
  // useEffect(() => {
  //   console.log("isEditModalOpen changed to:", isEditModalOpen);
  // }, [isEditModalOpen]);

  // useEffect(() => {
  //   console.log("leadToEdit changed to:", leadToEdit);
  // }, [leadToEdit]);

  // ----------------------------
  // Table Columns (New Design)
  // ----------------------------
  const columns = [
    {
      key: "name",
      label: "NAME",
      renderCell: (lead) => (
        <div className="flex items-center gap-3">
          <Avatar src={lead.avatar || lead.avatar_img} size="sm" />
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900">{lead.first_name}</p>
            <p className="text-xs text-gray-500">{lead.last_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "CONTACT",
      renderCell: (lead) => (

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-gray-400" />
            {/* <span className="text-xs text-gray-600">{lead.email}</span> */}
            {lead.channel !== "facebook"
              && lead.channel !== "instagram"
              && lead.channel !== "telegram"
              && lead.channel !== "whatsapp"
              ? (
                <span className="text-xs text-gray-600">{lead.email}</span>
              ) : (
                <span className="text-xs text-gray-600">{/* hidden on those platforms */}</span>
              )}

          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600">{sanitizePhoneNumber(lead.phone_number)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      label: "SOURCE",
      renderCell: (lead) => {
        const channel = channels.find((c) => c.id === (lead.channel || "website"));
        const ChannelIcon = channel?.icon || MessageSquare;
        const channelColor = channel?.color || '#CCFC01';
        const channelName = channel?.name;
        return (
          <div className="flex items-center gap-2 source">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `#CCFC0120` }}>
              <ChannelIcon className="w-4 h-4 text-black" style={{ color: channelColor }} />
            </div>
            <span className="text-sm text-gray-900">{channelName}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "STATUS",
      renderCell: (lead) => (
        <Chip className={`${getStatusColor(leadStatuses, lead.status)} text-white status`} size="sm">
          {leadStatuses.find((s) => s.key === (lead.status || "new"))?.name}
        </Chip>
      ),
    },
    {
      key: "lastContact",
      label: "LAST CONTACT",
      renderCell: (lead) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDate(lead.updated_at)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      renderCell: (lead) => (
        <div className="flex items-center gap-2 actions">
          <Tooltip content="View Details">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={async () => {
                setSelectedLead(lead);
                setLoadingMessages(true);
                onOpen();
                
                // Fetch messages for this specific lead
                try {
                  const messages = await conversationService.fetchAllMessagesByUserId(lead.user_id);
                  setLeadMessages(messages || []);
                } catch (error) {
                  console.error("Error fetching lead messages:", error);
                  setLeadMessages([]);
                } finally {
                  setLoadingMessages(false);
                }
              }}
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          </Tooltip>
          <Tooltip content="Edit Lead">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => handleEditClick(lead)}
            >
              <Edit3 className="w-4 h-4 text-gray-600" />
            </Button>
          </Tooltip>
          {/* <Tooltip content="Delete Lead">
            <Button isIconOnly variant="light" size="sm">
              <Trash className="w-4 h-4 text-danger-500" />
            </Button>
          </Tooltip> */}
          <Tooltip content="Delete Lead">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => {
                setLeadToDelete(lead);
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash className="w-4 h-4 text-danger-500" />
            </Button>
          </Tooltip>

        </div>
      ),
    },
  ];


  // Mock conversation sentiment data
  const mockSentimentData = [
    { date: "2024-01-01", sentiment: 0.8, messages: 5 },
    { date: "2024-01-02", sentiment: 0.6, messages: 3 },
    { date: "2024-01-03", sentiment: 0.2, messages: 4 },
    { date: "2024-01-04", sentiment: 0.9, messages: 6 },
    { date: "2024-01-05", sentiment: 0.5, messages: 2 },
  ];

  const renderSentimentChart = () => {
    if (!selectedLead) return null;

    return (
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockSentimentData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f1f1"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #f1f1f1",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#CCFC01"
              strokeWidth={2}
              dot={{ fill: "#CCFC01", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // ----------------------------
  // Render Modal Content (Keep Metrics + Append Conversation)
  // ----------------------------
  const renderModalContent = () => {
    if (!selectedLead) return null;
    //console.log("Rendering modal content for lead:", selectedLead);
    // Note: leadMessages is now loaded on-demand when opening the modal
    // console.log("Lead messages:", leadMessages);

    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedLead.first_name} {selectedLead.last_name}
          </h3>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            {/* Lead Info & Metrics */}
            <div className="flex items-start gap-4">
              <Avatar src={selectedLead.avatar || selectedLead.avatar_img} className="w-16 h-16" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">
                  {selectedLead.first_name} {selectedLead.last_name}
                </h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    {selectedLead.email && selectedLead.channel !== "facebook" &&
                      selectedLead.channel !== "instagram" &&
                      selectedLead.channel !== "telegram" &&
                      selectedLead.channel !== "whatsapp" ? (
                      <Mail className="w-4 h-4 text-gray-400" />
                    ) : (
                      null
                    )}
                    <span className="text-sm text-gray-600">
                      {(
                        selectedLead.channel !== "facebook" &&
                        selectedLead.channel !== "instagram" &&
                        selectedLead.channel !== "telegram" &&
                        selectedLead.channel !== "whatsapp"
                      ) && selectedLead.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedLead.phone_number && sanitizePhoneNumber(selectedLead.phone_number) !== "N/A" ? (
                      <Phone className="w-4 h-4 text-gray-400" />
                    ) : (
                      null
                    )}
                    <span className="text-sm text-gray-600">
                      {sanitizePhoneNumber(selectedLead.phone_number)}
                    </span>
                  </div>
                </div>
              </div>
              <Chip className={`${getStatusColor(leadStatuses, selectedLead.status)} text-white`}>
                {
                  leadStatuses.find((s) => s.key === (selectedLead.status || "new"))
                    ?.name
                }
              </Chip>
            </div>

            {/* Sentiment Analysis (Example Chart) */}
            {/* <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-4">
                Conversation Sentiment
              </h5>
              {renderSentimentChart()}
            </div> */}

            {/* Conversation History with separate bubbles */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-4">
                <p>{leadMessages.length == 1 ? "Conversation History " : ""}</p>
                <p className="mt-2">{leadMessages.length > 1 ? `Total conversations: ${leadMessages.length}` : ""} </p>
              </h5>
              {/* <div className="space-y-4 max-h-[300px] overflow-auto border-t pt-2"> */}
              <HiddenScrollbarOnScroll className="space-y-4 max-h-[300px] border-t pt-2">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading messages...</span>
                  </div>
                ) : leadMessages.length > 0 ? (
                  (<CustomTabs leadMessages={leadMessages} selectedLead={selectedLead} />)
                ) : (
                  <p className="text-sm text-gray-500">
                    No conversation history found.
                  </p>
                )}
              </HiddenScrollbarOnScroll>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="w-full justify-end">
          <Button variant="light" onPress={() => {
            onClose();
            // Reset modal state when closing
            setLeadMessages([]);
            setSelectedLead(null);
          }}>
            Close
          </Button>
          {/* <Button className="bg-brand text-gray-900" onPress={onClose}>
            Take Action
          </Button> */}
        </ModalFooter>
      </>
    );
  };

  // =============================================================================
  // Helper Function: Filter Leads by Date Range (using old logic)
  // =============================================================================
  const filterLeadsByDateRange = (leads, messages, startDate, endDate) => {
    // console.log("filterLeadsByDateRange called with:", {
    //   leadsLength: leads.length,
    //   startDate,
    //   endDate,
    // });
    // Old logic: set both start and end to midnight
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const filtered = leads.filter((lead) =>
      messages.some((message) => {
        const messageDate = new Date(message.created_at);
        messageDate.setHours(0, 0, 0, 0);
        return message.user_id === lead.user_id && messageDate >= startDate && messageDate <= endDate;
      })
    );
    //console.log("filterLeadsByDateRange returning leads length:", filtered.length);
    return filtered;
  };

  // ----------------------------
  // Render the Component
  // ----------------------------
  return (
    <div className="space-y-8 w-full">
      {/* Joyride component at the top level */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={leadsSteps}
        run={runTour && paginatedItems.length > 0}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="welcome">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your sales pipeline</p>
        </div>
        <div className="flex items-center gap-4">
          {chatDetails && chatDetails.length > 0 && (
            <div className="min-w-[250px]">
              <Autocomplete
                aria-label="Leads"
                className="w-full"
                defaultItems={chatDetails.map(chat => ({
                  label: chat.label,
                  key: chat.value,
                  description: chat.botName,
                }))}
                placeholder="select agent"
                startContent={<Bot className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="sm"
                selectedKey={selectedChatId}
                onSelectionChange={(key) => {
                  const selected = chatDetails.find(chat => chat.value === key);
                  handleChatSelect(selected);
                }}
              >
                {(item) => (
                  <AutocompleteItem key={item.key} textValue={item.description}>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-gray-500 truncate">{item.description}</span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-gray-900">{filteredLeads.length} Leads</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-lg space-y-2">
        <div className="flex flex-col lg:flex-row gap-4 w-full justify-between">
          {/* Left side: Searching */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => {
                //console.log("Search query changed:", e.target.value);
                setSearchQuery(e.target.value);
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              size="sm"
              classNames={{ inputWrapper: "border-gray-100" }}
            />

            <div className="flex flex-col sm:flex-row gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] bg-gray-50 text-gray-600"
                  startContent={<Filter className="w-4 h-4" />}
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {sortOptions.find(opt => opt.key === sortBy)?.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Sort options"
                selectionMode="single"               // <-- make it single select
                disallowEmptySelection              // optionally prevent no selection
                selectedKeys={new Set([sortBy])}    // <-- track your sortBy as a Set
                onSelectionChange={(keys) => {
                  // keys is a Set, so we pull out the first (and only) key
                  const [newKey] = keys;
                  setSortBy(newKey);
                }}
              >
                {sortOptions.map((option) => (
                  <DropdownItem
                    key={option.key} // <-- NextUI uses `key` here to identify each item
                    startContent={<option.icon className="w-4 h-4" />}
                  >
                    {option.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] bg-gray-50 text-gray-600"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {leadStatuses.find(status => status.key === selectedStatus)?.name || "All Statuses"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Status options"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([selectedStatus])}
                onSelectionChange={(keys) => {
                  const [newKey] = keys;
                  //console.log("Setting selected status to:", newKey);
                  setSelectedStatus(newKey);
                }}
              >
                <DropdownItem key="all">All Statuses</DropdownItem>
                {leadStatuses.map((status) => (
                  <DropdownItem
                    key={status.key}
                    startContent={
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(leadStatuses, status.key)}`}></div>
                    }
                  >
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  className="min-w-[140px] bg-gray-50 text-gray-600"
                  endContent={<ChevronDown className="w-4 h-4" />}
                >
                  {channels.find(channel => channel.id === selectedChannel)?.name || "All Channels"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Channel options"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set([selectedChannel])}
                onSelectionChange={(keys) => {
                  const [newKey] = keys;
                  //console.log("Setting selected channel to:", newKey);
                  setSelectedChannel(newKey);
                }}
              >
                <DropdownItem key="all">All Channels</DropdownItem>
                {channels.map((channel) => {
                  const ChannelIcon = channel.icon;
                  return (
                    <DropdownItem
                      key={channel.id}
                      startContent={
                        <div className="p-1 rounded" style={{ backgroundColor: `${getChannelColor([], channel.id)}20` }}>
                          <ChannelIcon className="w-3 h-3" style={{ color: getChannelColor([], channel.id) }} />
                        </div>
                      }
                    >
                      {channel.name}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>

            <div className="min-w-[140px]">
              <DateRangePicker
                value={dateRangeValue}
                onDateChange={(newValue) => {
                  //console.log("Date range changed to:", newValue);
                  setDateRangeValue(newValue);
                }}
                className="text-xs"
              />
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export and Pagination Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-2">
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {selectedKeys.size > 0 && (
            <>
              <Button
                color="danger"
                onPress={handleDeleteSelected}
                isDisabled={selectedKeys.size === 0}
                size="sm"
              >
                Delete Selected ({selectedKeys.size})
              </Button>
            </>
          )}
          {selectedKeys.size > 0 &&
            <Button
              startContent={<Download className="w-4 h-4" />}
              onPress={handleExportSelected}
              isDisabled={selectedKeys.size === 0 || exportLoading}
              isLoading={exportLoading}
              size="sm"
            >
              {exportLoading ? "Exporting..." : `Export Selected (${selectedKeys.size})`}
            </Button>
          }
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table (Using New Design) */}
      <div className="w-full md:overflow-visible overflow-x-auto ">
        <div>
          <Table
            aria-label="Leads table"
            selectionMode="multiple"
            removeWrapper
            selectedKeys={selectedKeys}
            // FIXED: Handle "select all" across entire filtered data
            onSelectionChange={(keys) => {
              //console.log("Selection changed:", keys);
              if (keys === "all") {
                // Select all in the FILTERED data, not just the current page:
                setSelectedKeys(new Set(filteredLeads.map((lead) => lead.user_id)));
              } else if (Array.isArray(keys) && keys.includes("all")) {
                // same logic if "all" is in the array
                setSelectedKeys(new Set(filteredLeads.map((lead) => lead.user_id)));
              } else {
                // Else normal selection
                if (keys instanceof Set) {
                  setSelectedKeys(keys);
                } else {
                  setSelectedKeys(new Set(keys));
                }
              }
            }}
            className="rounded-lg mt-4 w-[320px] md:w-full"
          >
            <TableHeader>
              {columns.map((col) => (
                <TableColumn key={col.key}>{col.label}</TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: rowsPerPage }, (_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-3 w-16 rounded-lg" />
                          <Skeleton className="h-3 w-12 rounded-lg" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3 w-20 rounded-lg" />
                        <Skeleton className="h-3 w-16 rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-3 w-12 rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-sm" />
                        <Skeleton className="h-3 w-20 rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-sm" />
                        <Skeleton className="h-6 w-6 rounded-sm" />
                        <Skeleton className="h-6 w-6 rounded-sm" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Actual lead data
                paginatedItems.map((lead) => (
                  <TableRow key={lead.user_id}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.renderCell(lead)}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
      <div className="w-full flex justify-between items-center">
        {/* FIXED: Pagination */}
        <Pagination
          page={page}
          total={totalPages}
          onChange={(newPage) => setPage(newPage)}
          showControls
          isCompact
          className="self-end md:self-center"
          classNames={{
            cursor: "bg-brand text-black shadow-md"
          }}
        />

        <span className="text-sm text-gray-500 md:ml-4">
          {selectedKeys.size} of {filteredLeads.length} selected
        </span>

      </div>

      {/* Lead Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>{renderModalContent()}</ModalContent>
      </Modal>

      {/* Edit Lead Modal */}
      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setShowSuccessMessage(false)
        }}
        lead={leadToEdit}
        showSuccessMessage={showSuccessMessage}
        setShowSuccessMessage={setShowSuccessMessage}
      />
      <DeleteLeadModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        lead={leadToDelete}
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        setLeadToDelete={setLeadToDelete}
      />

    </div>
  );
}
