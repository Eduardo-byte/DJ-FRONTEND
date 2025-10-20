import { useState } from 'react';
import { Tabs, Tab, Card, CardBody } from "@heroui/react";
import { Key, Activity, BarChart3 } from 'lucide-react';
import ApiKeysTab from './ApiKeysTab';
import UsageTab from './UsageTab';
import LogsTab from './LogsTab';

const TabsContainer = () => {
  const [selectedTab, setSelectedTab] = useState('api-keys');

  return (
    <div className="w-full">
      <Tabs 
        aria-label="API Management Tabs" 
        selectedKey={selectedTab} 
        onSelectionChange={setSelectedTab}
        className="w-full"
        variant="underlined"
      >
        <Tab
          key="api-keys"
          title={
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Keys</span>
            </div>
          }
        >
          <Card className="mt-4">
            <CardBody>
              <ApiKeysTab />
            </CardBody>
          </Card>
        </Tab>
        
        <Tab
          key="usage"
          title={
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Usage</span>
            </div>
          }
        >
          <Card className="mt-4">
            <CardBody>
              <UsageTab />
            </CardBody>
          </Card>
        </Tab>
        
        <Tab
          key="logs"
          title={
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Logs</span>
            </div>
          }
        >
          <Card className="mt-4">
            <CardBody>
              <LogsTab />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default TabsContainer;
