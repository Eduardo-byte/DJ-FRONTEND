import { useState, useMemo } from "react";
import {
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
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
  Tooltip,
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
  Settings,
  Trash2,
  Edit3,
  Eye,
  MoreVertical,
  Plus,
  Brain,
  Zap,
  Globe,
} from "lucide-react";

export default function Chatbots() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const chatbotTypes = [
    { key: "all", name: "All Types" },
    { key: "customer-support", name: "Customer Support", icon: MessageSquare },
    { key: "lead-gen", name: "Lead Generation", icon: Users },
    { key: "sales", name: "Sales Assistant", icon: Zap },
    { key: "knowledge-base", name: "Knowledge Base", icon: Brain },
  ];

  const mockChatbots = [
    {
      id: 1,
      name: "Customer Support Bot",
      type: "customer-support",
      description: "24/7 customer service assistant",
      status: "active",
      metrics: {
        conversations: "1,234",
        users: "890",
        responseTime: "1.2s",
        satisfaction: "92%",
      },
      lastUpdated: "2024-02-12T10:30:00",
    },
    {
      id: 2,
      name: "Lead Generation Bot",
      type: "lead-gen",
      description: "Qualifies potential customers",
      status: "active",
      metrics: {
        conversations: "567",
        users: "234",
        responseTime: "1.5s",
        satisfaction: "88%",
      },
      lastUpdated: "2024-02-11T15:45:00",
    },
    {
      id: 3,
      name: "Sales Assistant",
      type: "sales",
      description: "Helps with product recommendations",
      status: "inactive",
      metrics: {
        conversations: "890",
        users: "456",
        responseTime: "1.8s",
        satisfaction: "85%",
      },
      lastUpdated: "2024-02-10T09:15:00",
    },
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

  const columns = [
    {
      key: "name",
      label: "NAME",
      renderCell: (chatbot) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Bot className="w-5 h-5 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-900">{chatbot.name}</p>
            <p className="text-xs text-gray-500">{chatbot.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: "metrics",
      label: "METRICS",
      renderCell: (chatbot) => (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Conversations</p>
              <p className="text-sm font-medium text-gray-900">
                {chatbot.metrics.conversations}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Users</p>
              <p className="text-sm font-medium text-gray-900">
                {chatbot.metrics.users}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "performance",
      label: "PERFORMANCE",
      renderCell: (chatbot) => (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Response Time</p>
              <p className="text-sm font-medium text-gray-900">
                {chatbot.metrics.responseTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Satisfaction</p>
              <p className="text-sm font-medium text-gray-900">
                {chatbot.metrics.satisfaction}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      renderCell: (chatbot) => (
        <Chip
          className={`${
            chatbot.status === "active" ? "bg-green-500" : "bg-gray-500"
          } text-white`}
          size="sm"
        >
          {chatbot.status === "active" ? "Active" : "Inactive"}
        </Chip>
      ),
    },
    {
      key: "lastUpdated",
      label: "LAST UPDATED",
      renderCell: (chatbot) => (
        <span className="text-sm text-gray-600">
          {formatDate(chatbot.lastUpdated)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      renderCell: (chatbot) => (
        <div className="flex items-center gap-2">
          <Tooltip content="View Details">
            <Button isIconOnly variant="light" size="sm">
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          </Tooltip>
          <Tooltip content="Edit Chatbot">
            <Button isIconOnly variant="light" size="sm">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </Button>
          </Tooltip>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light" size="sm">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chatbot actions">
              <DropdownItem startContent={<Settings className="w-4 h-4" />}>
                Configure
              </DropdownItem>
              <DropdownItem startContent={<Globe className="w-4 h-4" />}>
                Deploy
              </DropdownItem>
              <DropdownItem
                startContent={<Trash2 className="w-4 h-4" />}
                className="text-danger"
                color="danger"
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filteredChatbots = useMemo(() => {
    return mockChatbots
      .filter((chatbot) => {
        const matchesType =
          selectedType === "all" || chatbot.type === selectedType;
        const matchesSearch =
          chatbot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chatbot.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
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
  }, [mockChatbots, selectedType, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Chatbots
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your AI-powered chatbot assistants
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg px-4 py-2">
          <span className="text-sm font-medium text-gray-900">
            {filteredChatbots.length} Chatbots
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-100 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search chatbots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            size="sm"
            classNames={{
              inputWrapper: "border-gray-100",
            }}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                className="min-w-[140px] bg-gray-50 text-gray-600"
                startContent={<Filter className="w-4 h-4" />}
                endContent={<ChevronDown className="w-4 h-4" />}
              >
                Sort By
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Sort options"
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) => setSortBy(Array.from(keys)[0])}
            >
              <DropdownItem key="newest">Newest First</DropdownItem>
              <DropdownItem key="oldest">Oldest First</DropdownItem>
              <DropdownItem key="name">Name</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex gap-2 flex-wrap">
          {chatbotTypes.map((type) => (
            <Button
              key={type.key}
              size="sm"
              className={`${
                selectedType === type.key
                  ? "bg-brand text-gray-900"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              } transition-colors duration-250`}
              startContent={type.icon && <type.icon className="w-4 h-4" />}
              onClick={() => setSelectedType(type.key)}
            >
              {type.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Create Chatbot Button */}
      <div className="flex justify-between items-center">
        <Button
          className="bg-brand text-gray-900"
          startContent={<Plus className="w-4 h-4" />}
          onClick={onOpen}
        >
          Create Chatbot
        </Button>
        <span className="text-sm text-gray-500">
          {selectedKeys.size} of {filteredChatbots.length} selected
        </span>
      </div>

      {/* Chatbots Table */}
      <Table
        aria-label="Chatbots table"
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        className="bg-white border border-gray-100 rounded-lg"
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={filteredChatbots}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {columns
                    .find((col) => col.key === columnKey)
                    ?.renderCell(item)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create Chatbot Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  Create New Chatbot
                </h3>
                <p className="text-sm text-gray-500">
                  Configure your AI-powered chatbot assistant
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <Input
                    label="Name"
                    placeholder="Enter chatbot name"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <Input
                    label="Description"
                    placeholder="Enter chatbot description"
                    variant="bordered"
                    labelPlacement="outside"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {chatbotTypes.slice(1).map((type) => (
                        <Button
                          key={type.key}
                          className="justify-start bg-gray-50 text-gray-600 hover:bg-gray-100"
                          startContent={
                            type.icon && <type.icon className="w-4 h-4" />
                          }
                        >
                          {type.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button className="bg-brand text-gray-900" onPress={onClose}>
                  Create Chatbot
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
