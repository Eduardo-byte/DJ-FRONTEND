import React from 'react';
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Key } from 'lucide-react';
import TabsContainer from '../components/tabsForApiKeys/TabsContainer';

export default function ApiKeys() {
  return (
    <div className="mt-6">
      <Card className="w-full border-1 border-black/10 border-solid" shadow="none">
        <CardHeader className="flex gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Key className="w-5 h-5 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold text-gray-900">
              API Management
            </p>
            <p className="text-small text-gray-500">
              Manage your API keys, monitor usage, and view request logs
            </p>
          </div>
        </CardHeader>

        <Divider />

        <CardBody>
          <TabsContainer />
                </CardBody>
              </Card>
    </div>
  );
}