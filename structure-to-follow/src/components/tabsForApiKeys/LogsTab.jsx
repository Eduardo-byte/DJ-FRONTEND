import { useState, useEffect, useContext } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner
} from "@heroui/react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Globe,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { UserDataContext } from '../../context/UserDataContext';
import { logsAndUsageApiKeysService } from '../../api/services/logsAndUsageApiKeys.service';

const LogsTab = () => {
  const { userData } = useContext(UserDataContext);
  
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [endpointFilter, setEndpointFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [logDetailLoading, setLogDetailLoading] = useState(false);

  // Common API endpoints based on scopes
  const commonEndpoints = [
    '/opportunities',
    '/messages', 
    '/ai-agent',
    '/metrics',
    '/ai',
    '/scraper',
    '/scraped-content'
  ];
  
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();

  const handleModalClose = () => {
    onDetailModalClose();
    setSelectedLog(null);
    setLogDetailLoading(false);
  };
  
  const logsPerPage = 20;

  // Get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate = now;

    switch (dateFilter) {
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999); // End of day
        } else {
          // Default to last 7 days if custom dates not set
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  // Load logs when component mounts or filters change
  useEffect(() => {
    if (userData?.client_id) {
      loadLogs();
    }
  }, [userData?.client_id, currentPage, dateFilter, customStartDate, customEndDate]);

  const loadLogs = async () => {
    if (!userData?.client_id) return;
    
    setIsLoading(true);
    try {
      const dateRange = getDateRange();
      const params = {
        page: currentPage,
        limit: logsPerPage,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      // Use date range endpoint if available, otherwise use simple endpoint
      let response;
      try {
        response = await logsAndUsageApiKeysService.getLogsByDateRange(userData.client_id, params);
      } catch (error) {
        // Fallback to simple endpoint if date range endpoint doesn't exist
        console.warn('Date range endpoint not available, using simple endpoint');
        response = await logsAndUsageApiKeysService.getLogsByClientSimple(userData.client_id, {
          page: currentPage,
          limit: logsPerPage,
        });
      }
      
      if (response) {
        setLogs(response.data || response || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        }
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Failed to load API logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if a status code is successful
  const isSuccessfulStatus = (statusCode) => {
    const status = parseInt(statusCode);
    // 2xx Success codes and 3xx Redirection codes (including 304 Not Modified)
    return (status >= 200 && status < 400);
  };

  // Helper function to check if a status code is an error
  const isErrorStatus = (statusCode) => {
    const status = parseInt(statusCode);
    // 4xx Client errors and 5xx Server errors
    return (status >= 400);
  };

  // Filter logs based on current filters and search query
  const getFilteredLogs = () => {
    let filtered = [...logs];

    // First, only include logs for allowed endpoints
    filtered = filtered.filter(log => {
      if (!log.endpoint) return false;
      const endpoint = log.endpoint.split('?')[0]; // Remove query parameters
      return commonEndpoints.some(allowedEndpoint => 
        endpoint.includes(allowedEndpoint)
      );
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        (log.endpoint && log.endpoint.toLowerCase().includes(query)) ||
        (log.method && log.method.toLowerCase().includes(query)) ||
        (log.ip_address && log.ip_address.toLowerCase().includes(query)) ||
        (log.status_code && log.status_code.toString().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter === 'successful') {
      filtered = filtered.filter(log => isSuccessfulStatus(log.status_code));
    } else if (statusFilter === 'errors') {
      filtered = filtered.filter(log => isErrorStatus(log.status_code));
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(log => log.method === methodFilter);
    }

    // Apply endpoint filter
    if (endpointFilter !== 'all') {
      filtered = filtered.filter(log => 
        log.endpoint && log.endpoint.toLowerCase().includes(endpointFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSearch = () => {
    // Search is now handled by getFilteredLogs() function
    // This will trigger a re-render with filtered data
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadLogs();
  };

  const openLogDetail = async (log) => {
    setSelectedLog(log); // Set the basic log data first
    onDetailModalOpen();
    setLogDetailLoading(true);
    
    try {
      // Fetch the full log details including body and response
      const fullLogData = await logsAndUsageApiKeysService.getLogById(log.id);
      if (fullLogData) {
        setSelectedLog(fullLogData.data || fullLogData);
      }
    } catch (error) {
      console.error('Error loading log details:', error);
      toast.error('Failed to load log details');
    } finally {
      setLogDetailLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusChip = (statusCode) => {
    const status = parseInt(statusCode);
    
    if (isSuccessfulStatus(status)) {
      return (
        <Chip color="success" variant="flat" size="sm">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status}
        </Chip>
      );
    } else if (isErrorStatus(status)) {
      return (
        <Chip color="danger" variant="flat" size="sm">
          <AlertCircle className="w-3 h-3 mr-1" />
          {status}
        </Chip>
      );
    } else {
      // 1xx Informational responses
      return (
        <Chip color="primary" variant="flat" size="sm">
          <Clock className="w-3 h-3 mr-1" />
          {status}
        </Chip>
      );
    }
  };

  const getMethodChip = (method) => {
    const colors = {
      GET: 'primary',
      POST: 'success',
      PUT: 'warning',
      DELETE: 'danger',
      PATCH: 'secondary'
    };
    
    return (
      <Chip color={colors[method] || 'default'} variant="flat" size="sm">
        {method}
      </Chip>
    );
  };

  const exportLogs = async () => {
    try {
      // You could implement CSV export here
      toast.success('Export feature coming soon!');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading API logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Logs</h2>
          <p className="text-gray-600 mt-1">View and analyze your API request logs</p>
        </div>
          <div className="flex items-center gap-2">
            <Button
              variant="light"
              className="text-brand hover:bg-brand/10"
              startContent={<RefreshCw className="w-4 h-4" />}
              onPress={handleRefresh}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              variant="light"
              className="text-brand hover:bg-brand/10"
              startContent={<Download className="w-4 h-4" />}
              onPress={exportLogs}
              size="sm"
            >
              Export
            </Button>
          </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border-1 border-gray-200" shadow="none">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Input
              placeholder="Search logs..."
              startContent={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              variant="bordered"
            />
            
            <Select
              placeholder="All Endpoints"
              selectedKeys={[endpointFilter]}
              onSelectionChange={(keys) => setEndpointFilter(Array.from(keys)[0])}
              variant="bordered"
              startContent={<Filter className="w-4 h-4" />}
            >
              <SelectItem key="all">All Endpoints</SelectItem>
              {commonEndpoints.map((endpoint) => (
                <SelectItem key={endpoint}>{endpoint}</SelectItem>
              ))}
            </Select>
            
            <Select
              placeholder="Status"
              selectedKeys={[statusFilter]}
              onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0])}
              variant="bordered"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="successful">Successful (2xx, 3xx)</SelectItem>
              <SelectItem key="errors">Errors (4xx, 5xx)</SelectItem>
            </Select>
            
            <Select
              placeholder="Method"
              selectedKeys={[methodFilter]}
              onSelectionChange={(keys) => setMethodFilter(Array.from(keys)[0])}
              variant="bordered"
            >
              <SelectItem key="all">All Methods</SelectItem>
              <SelectItem key="GET">GET</SelectItem>
              <SelectItem key="POST">POST</SelectItem>
              <SelectItem key="PUT">PUT</SelectItem>
              <SelectItem key="DELETE">DELETE</SelectItem>
              <SelectItem key="PATCH">PATCH</SelectItem>
            </Select>
            
            <Select
              placeholder="Last 7 days"
              selectedKeys={[dateFilter]}
              onSelectionChange={(keys) => setDateFilter(Array.from(keys)[0])}
              variant="bordered"
              startContent={<Calendar className="w-4 h-4" />}
            >
              <SelectItem key="7">Last 7 days</SelectItem>
              <SelectItem key="30">Last 30 days</SelectItem>
              <SelectItem key="90">Last 90 days</SelectItem>
              <SelectItem key="custom">Custom range</SelectItem>
            </Select>
            
            <Button
              className="bg-brand text-gray-900 font-medium hover:bg-brand/90"
              startContent={<Filter className="w-4 h-4" />}
              onPress={handleSearch}
            >
              Search
            </Button>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Start Date"
                placeholder="Select start date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                variant="bordered"
              />
              <Input
                type="date"
                label="End Date"
                placeholder="Select end date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                variant="bordered"
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-3 border-1 border-gray-200" shadow="none">
          <CardBody className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Activity className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-lg font-bold text-gray-900">{getFilteredLogs().length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="p-3 border-1 border-gray-200" shadow="none">
          <CardBody className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Successful (2xx, 3xx)</p>
                <p className="text-lg font-bold text-gray-900">
                  {getFilteredLogs().filter(log => isSuccessfulStatus(log.status_code)).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="p-3 border-1 border-gray-200" shadow="none">
          <CardBody className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Errors (4xx, 5xx)</p>
                <p className="text-lg font-bold text-gray-900">
                  {getFilteredLogs().filter(log => isErrorStatus(log.status_code)).length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card className="p-3 border-1 border-gray-200" shadow="none">
          <CardBody className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10">
                <Globe className="w-4 h-4 text-brand" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique IPs</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Set(getFilteredLogs().map(log => log.ip_address)).size}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border-1 border-gray-200" shadow="none">
        <CardHeader>
          <h3 className="text-lg font-semibold">Request Logs</h3>
        </CardHeader>
        <CardBody className="p-0">
          {getFilteredLogs().length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Logs Found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || methodFilter !== 'all' || endpointFilter !== 'all' || dateFilter !== '7' || (dateFilter === 'custom' && (customStartDate || customEndDate))
                  ? 'No logs match your current filters'
                  : 'No API requests have been logged yet'
                }
              </p>
            </div>
          ) : (
            <Table aria-label="API logs table">
              <TableHeader>
                <TableColumn>TIMESTAMP</TableColumn>
                <TableColumn>METHOD</TableColumn>
                <TableColumn>ENDPOINT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>IP ADDRESS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {getFilteredLogs().map((log, index) => (
                  <TableRow key={log.id || index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMethodChip(log.method)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={log.endpoint}>
                        <code className="text-sm">{log.endpoint}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(log.status_code)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono">{log.ip_address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-brand hover:bg-brand/10"
                        onPress={() => openLogDetail(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Pagination - only show if no filters are applied */}
      {totalPages > 1 && !searchQuery && statusFilter === 'all' && methodFilter === 'all' && endpointFilter === 'all' && dateFilter === '7' && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            classNames={{
              cursor: "bg-brand text-gray-900",
            }}
          />
        </div>
      )}

      {/* Log Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={handleModalClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            API Request Details
          </ModalHeader>
          <ModalBody>
            {selectedLog && (
              <div className="space-y-6">
                {/* Request Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Request Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Timestamp</p>
                      <p className="font-mono text-sm">{formatDate(selectedLog.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Method</p>
                      <div className="mt-1">{getMethodChip(selectedLog.method)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status Code</p>
                      <div className="mt-1">{getStatusChip(selectedLog.status_code)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">IP Address</p>
                      <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                    </div>
                  </div>
                </div>

                {/* Endpoint */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Endpoint</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <code className="text-sm break-all">{selectedLog.endpoint}</code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="ml-2"
                      onPress={() => {
                        navigator.clipboard.writeText(selectedLog.endpoint);
                        toast.success('Endpoint copied to clipboard');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Request Body */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                    {logDetailLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Spinner size="sm" />
                        <span className="ml-2 text-sm text-gray-600">Loading request details...</span>
                      </div>
                    ) : selectedLog.body ? (
                      <pre className="text-xs">
                        {typeof selectedLog.body === 'string' 
                          ? selectedLog.body 
                          : JSON.stringify(selectedLog.body, null, 2)
                        }
                      </pre>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No request body</p>
                    )}
                  </div>
                </div>

                {/* Response */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                    {logDetailLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Spinner size="sm" />
                        <span className="ml-2 text-sm text-gray-600">Loading response details...</span>
                      </div>
                    ) : selectedLog.response ? (
                      <pre className="text-xs">
                        {typeof selectedLog.response === 'string' 
                          ? selectedLog.response 
                          : JSON.stringify(selectedLog.response, null, 2)
                        }
                      </pre>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No response data</p>
                    )}
                  </div>
                </div>

                {/* User Agent */}
                {selectedLog.user_agent && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">User Agent</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <code className="text-xs break-all">{selectedLog.user_agent}</code>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              className="bg-brand text-gray-900 font-medium hover:bg-brand/90"
              onPress={handleModalClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default LogsTab;
