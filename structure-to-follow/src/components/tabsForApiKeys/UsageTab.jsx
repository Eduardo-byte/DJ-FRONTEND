import { useState, useEffect, useContext } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Button,
  Divider,
  Select,
  SelectItem,
  Spinner
} from "@heroui/react";
import {
  Activity,
  TrendingUp,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  Target,
  Infinity,
  RefreshCw,
  Key
} from 'lucide-react';
import { UserDataContext } from '../../context/UserDataContext';
import { apiKeyService } from '../../api';
import { logsAndUsageApiKeysService } from '../../api/services/logsAndUsageApiKeys.service';


const UsageTab = () => {
  const { userData, loggedInUser } = useContext(UserDataContext);
  const [refreshTime, setRefreshTime] = useState(new Date());
  
  // API Key dropdown states
  const [apiKeys, setApiKeys] = useState([]);
  const [selectedApiKey, setSelectedApiKey] = useState('all');
  const [apiKeyUsageStats, setApiKeyUsageStats] = useState(null);
  const [loadingApiKeys, setLoadingApiKeys] = useState(false);
  const [loadingUsageStats, setLoadingUsageStats] = useState(false);

  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (!userData?.api_usage_limit || userData.api_usage_limit === -1) {
      return 0; // Unlimited
    }
    const current = userData?.api_usage_current || 0;
    const limit = userData?.api_usage_limit || 1;
    return Math.min((current / limit) * 100, 100);
  };

  // Get usage status
  const getUsageStatus = () => {
    const percentage = getUsagePercentage();
    if (userData?.api_usage_limit === -1) return 'unlimited';
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    return 'good';
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  // Get billing cycle info
  const getBillingCycleInfo = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      start: startOfMonth.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      end: endOfMonth.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      daysRemaining: Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24))
    };
  };

  // Load API keys on component mount
  useEffect(() => {
    if (userData?.client_id) {
      loadApiKeys();
    }
  }, [userData]);

  // Load usage stats when API key selection changes
  useEffect(() => {
    console.log('API key selection changed to:', selectedApiKey);
    if (selectedApiKey && selectedApiKey !== 'all') {
      loadApiKeyUsageStats(selectedApiKey);
    } else {
      console.log('Resetting API key usage stats');
      setApiKeyUsageStats(null);
    }
  }, [selectedApiKey]);

  const loadApiKeys = async () => {
    try {
      setLoadingApiKeys(true);
      const response = await apiKeyService.fetchAllApiKeys(userData.client_id);
      console.log('API Keys response:', response);
      // Handle different response structures
      const apiKeysData = response?.data?.api_keys || response?.api_keys || response || [];
      console.log('API Keys data:', apiKeysData);
      setApiKeys(apiKeysData);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoadingApiKeys(false);
    }
  };

  const loadApiKeyUsageStats = async (apiKeyId) => {
    try {
      setLoadingUsageStats(true);
      console.log('Loading usage stats for API key:', apiKeyId);
      
      // Try multiple approaches to get usage data
      const [stats, logs] = await Promise.all([
        logsAndUsageApiKeysService.getUsageStats(apiKeyId),
        logsAndUsageApiKeysService.getLogsByApiKey(apiKeyId, { limit: 1000 })
      ]);
      
      console.log('Usage stats response:', stats);
      console.log('Logs response:', logs);
      
      // Extract data from the response structure
      const statsData = stats?.data || stats;
      const logsData = logs?.data || logs;
      
      console.log('Stats data:', statsData);
      console.log('Logs data:', logsData);
      
      // Check if statsData has a statistics property
      const actualStats = statsData?.statistics || statsData;
      console.log('Actual stats:', actualStats);
      console.log('Stats keys:', actualStats ? Object.keys(actualStats) : 'No stats');
      
      // If stats is null or empty, try to calculate from logs
      if (!actualStats || Object.keys(actualStats).length === 0) {
        if (logsData && Array.isArray(logsData)) {
          const totalRequests = logsData.length;
          const successfulRequests = logsData.filter(log => log.status_code < 400).length;
          const failedRequests = totalRequests - successfulRequests;
          const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
          
          const calculatedStats = {
            total_requests: totalRequests,
            successful_requests: successfulRequests,
            failed_requests: failedRequests,
            success_rate: successRate
          };
          
          console.log('Calculated stats from logs:', calculatedStats);
          setApiKeyUsageStats(calculatedStats);
        } else {
          setApiKeyUsageStats(null);
        }
      } else {
        console.log('Using API stats:', actualStats);
        setApiKeyUsageStats(actualStats);
      }
    } catch (error) {
      console.error('Error loading API key usage stats:', error);
      setApiKeyUsageStats(null);
    } finally {
      setLoadingUsageStats(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTime(new Date());
    if (selectedApiKey && selectedApiKey !== 'all') {
      loadApiKeyUsageStats(selectedApiKey);
    }
  };

  // Get current usage data (either overall or per API key)
  const getCurrentUsageData = () => {
    if (selectedApiKey === 'all' || !apiKeyUsageStats) {
      return {
        current: userData?.api_usage_current || 0,
        limit: userData?.api_usage_limit || 0,
        isUnlimited: userData?.api_usage_limit === -1
      };
    }
    
    // Try different possible property names for total requests
    const totalRequests = apiKeyUsageStats?.total_requests ?? 
                         apiKeyUsageStats?.totalRequests ?? 
                         apiKeyUsageStats?.total_calls ??
                         apiKeyUsageStats?.totalCalls ??
                         apiKeyUsageStats?.count ??
                         apiKeyUsageStats?.requests ??
                         0;
    
    return {
      current: totalRequests,
      limit: userData?.api_usage_limit || 0, // API key doesn't have individual limits
      isUnlimited: userData?.api_usage_limit === -1
    };
  };

  const currentUsageData = getCurrentUsageData();
  const usagePercentage = currentUsageData.isUnlimited ? 0 : 
    Math.min((currentUsageData.current / currentUsageData.limit) * 100, 100);
  const usageStatus = getUsageStatus();
  const billingCycle = getBillingCycleInfo();
  const isUnlimited = currentUsageData.isUnlimited;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Usage</h2>
          <p className="text-gray-600 mt-1">Monitor your API consumption and limits</p>
        </div>
        <div className="flex items-center gap-3">
          {/* API Key Dropdown */}
          <div className="min-w-[200px]">
            <Select
              label="Filter by API Key"
              placeholder="Select API Key"
              selectedKeys={[selectedApiKey]}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0];
                console.log('Dropdown selection changed:', selectedKey);
                setSelectedApiKey(selectedKey);
              }}
              startContent={<Key className="w-4 h-4" />}
              size="sm"
              variant="bordered"
              isLoading={loadingApiKeys}
            >
              <SelectItem key="all" value="all">
                All API Keys
              </SelectItem>
              {apiKeys.length > 0 ? (
                apiKeys.map((apiKey) => (
                  <SelectItem key={apiKey.id} value={apiKey.id}>
                    {apiKey.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem key="no-keys" value="no-keys" isDisabled>
                  No API keys available
                </SelectItem>
              )}
            </Select>
          </div>
          <Button
            variant="light"
            className="text-brand hover:bg-brand/10"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={handleRefresh}
            size="sm"
            isLoading={loadingUsageStats}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* API Key Specific Stats */}
      {selectedApiKey !== 'all' && (
        loadingUsageStats ? (
          <Card className="p-4 border-1 border-brand/20 bg-brand/5" shadow="none">
            <CardBody className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Spinner size="sm" color="primary" />
                <span className="text-gray-600">Loading usage statistics...</span>
              </div>
            </CardBody>
          </Card>
        ) : apiKeyUsageStats ? (
        <Card className="p-4 border-1 border-brand/20 bg-brand/5" shadow="none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-brand" />
              <h3 className="text-lg font-semibold text-gray-900">
                {apiKeys.find(key => key.id === selectedApiKey)?.name} - Usage Statistics
              </h3>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand">
                  {formatNumber(
                    apiKeyUsageStats.total_requests ?? 
                    apiKeyUsageStats.totalRequests ?? 
                    apiKeyUsageStats.total_calls ??
                    apiKeyUsageStats.totalCalls ??
                    apiKeyUsageStats.count ??
                    apiKeyUsageStats.requests ??
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(
                    apiKeyUsageStats.successful_requests ?? 
                    apiKeyUsageStats.successfulRequests ?? 
                    apiKeyUsageStats.successful_calls ??
                    apiKeyUsageStats.successfulCalls ??
                    apiKeyUsageStats.success_count ??
                    apiKeyUsageStats.successCount ??
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(
                    apiKeyUsageStats.failed_requests ?? 
                    apiKeyUsageStats.failedRequests ?? 
                    apiKeyUsageStats.error_requests ??
                    apiKeyUsageStats.errorRequests ??
                    apiKeyUsageStats.failed_calls ??
                    apiKeyUsageStats.failedCalls ??
                    apiKeyUsageStats.error_count ??
                    apiKeyUsageStats.errorCount ??
                    0
                  )}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(() => {
                    // Try to get success rate from API response first
                    const directSuccessRate = apiKeyUsageStats.success_rate ?? 
                                            apiKeyUsageStats.successRate ?? 
                                            apiKeyUsageStats.success_percentage ??
                                            apiKeyUsageStats.successPercentage;
                    
                    if (directSuccessRate !== undefined && directSuccessRate !== null) {
                      return `${directSuccessRate.toFixed(1)}%`;
                    }
                    
                    // Calculate success rate from available data
                    const total = apiKeyUsageStats.total_requests ?? apiKeyUsageStats.totalRequests ?? 0;
                    const successful = apiKeyUsageStats.successful_requests ?? apiKeyUsageStats.successfulRequests ?? 0;
                    
                    if (total > 0) {
                      const calculatedRate = (successful / total) * 100;
                      return `${calculatedRate.toFixed(1)}%`;
                    }
                    
                    return 'N/A';
                  })()}
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardBody>
        </Card>
        ) : (
          <Card className="p-4 border-1 border-gray-200" shadow="none">
            <CardBody className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No usage data available for this API key</p>
              </div>
            </CardBody>
          </Card>
        )
      )}

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Usage Status Card */}
        <Card className="p-4 border-1 border-gray-200" shadow="none">
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                usageStatus === 'unlimited' ? 'bg-purple-100' :
                usageStatus === 'critical' ? 'bg-red-100' :
                usageStatus === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                {usageStatus === 'unlimited' ? (
                  <Infinity className={`w-5 h-5 text-purple-600`} />
                ) : usageStatus === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : usageStatus === 'warning' ? (
                  <Activity className="w-5 h-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedApiKey === 'all' ? 'Total Usage' : 'API Key Usage'}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedApiKey === 'all' ? 'All API keys combined' : 'This API key usage'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(currentUsageData.current)}
                </span>
                {!isUnlimited && selectedApiKey === 'all' && (
                  <span className="text-sm text-gray-500">
                    of {formatNumber(currentUsageData.limit)}
                  </span>
                )}
                {selectedApiKey !== 'all' && (
                  <span className="text-sm text-gray-500">
                    requests by this key
                  </span>
                )}
              </div>
              
              {!isUnlimited && selectedApiKey === 'all' && (
                <Progress
                  value={usagePercentage}
                  className="max-w-full"
                  color={
                    usageStatus === 'critical' ? 'danger' :
                    usageStatus === 'warning' ? 'warning' : 'primary'
                  }
                  size="sm"
                  aria-label={`API usage progress: ${usagePercentage.toFixed(1)}%`}
                />
              )}
              
              <div className="flex justify-between items-center">
                <Chip
                  size="sm"
                  variant="flat"
                  color={
                    usageStatus === 'unlimited' ? 'secondary' :
                    usageStatus === 'critical' ? 'danger' :
                    usageStatus === 'warning' ? 'warning' : 'success'
                  }
                >
                  {isUnlimited ? 'Unlimited' : 
                   selectedApiKey === 'all' ? `${usagePercentage.toFixed(1)}% used` : 
                   'Individual Usage'}
                </Chip>
                {!isUnlimited && (
                  <span className="text-xs text-gray-500">
                    {formatNumber((userData?.api_usage_limit || 0) - (userData?.api_usage_current || 0))} remaining total
                  </span>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Account Type Card */}
        <Card className="p-4 border-1 border-gray-200" shadow="none">
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-brand/10">
                <Target className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Plan Details</h3>
                <p className="text-sm text-gray-500">Your subscription</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-lg font-bold text-gray-900 capitalize">
                  {loggedInUser?.account_type || 'Basic'} Plan
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">API Limit:</span>
                  <span className="font-medium text-gray-900">
                    {isUnlimited ? 'Unlimited' : formatNumber(userData?.api_usage_limit || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <Chip size="sm" color="success" variant="flat">
                    Active
                  </Chip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Billing Cycle Card */}
        <Card className="p-4 border-1 border-gray-200" shadow="none">
          <CardBody>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Billing Cycle</h3>
                <p className="text-sm text-gray-500">Current period</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium text-gray-900">
                    {billingCycle.start} - {billingCycle.end}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Days remaining:</span>
                  <span className="font-medium text-gray-900">
                    {billingCycle.daysRemaining}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Resets on {billingCycle.end}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Usage Alerts */}
      {!isUnlimited && (
        <Card className="p-4 border-1 border-gray-200" shadow="none">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Usage Alerts</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="space-y-3">
              {usageStatus === 'critical' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Critical Usage Alert
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        You've used over 90% of your API limit. Consider upgrading your plan to avoid service interruption.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {usageStatus === 'warning' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        High Usage Warning
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        You've used over 75% of your API limit. Monitor your usage carefully.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {usageStatus === 'good' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Usage Looking Good
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Your API usage is within normal limits for this billing cycle.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Usage Tips */}
      <Card className="p-4 border-1 border-gray-200" shadow="none">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-semibold text-gray-900">Optimization Tips</h3>
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-brand mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Cache API Responses</p>
                  <p className="text-xs text-gray-600">
                    Implement caching to reduce redundant API calls and save on usage.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-brand mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Monitor Usage Patterns</p>
                  <p className="text-xs text-gray-600">
                    Track your API usage to identify peak times and optimize your requests.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-brand mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Set Up Alerts</p>
                  <p className="text-xs text-gray-600">
                    Configure notifications when you reach certain usage thresholds.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Activity className="w-4 h-4 text-brand mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Batch Requests</p>
                  <p className="text-xs text-gray-600">
                    Combine multiple operations into single API calls when possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Last Updated */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Last updated: {refreshTime.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default UsageTab;
