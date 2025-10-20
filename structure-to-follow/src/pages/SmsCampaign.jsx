import React from "react";
import { MessageSquare } from "lucide-react";

export default function SmsCampaign() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <MessageSquare className="w-5 h-5 text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              SMS Campaign
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Create and manage your SMS campaigns
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-lg p-8 border border-gray-100 flex flex-col items-center justify-center">
        <div className="p-4 rounded-full bg-gray-100 mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">SMS Campaign Feature Coming Soon</h3>
        <p className="text-sm text-gray-500 text-center max-w-md mb-6">
          This feature is currently under development. Check back later for updates.
        </p>
      </div>
    </div>
  );
}
