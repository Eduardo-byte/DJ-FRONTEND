import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import {
  Tabs,
  Tab,
} from "@heroui/react";
import {
  User,
  Building2,
  CreditCard,
  Users,
  Bell,
} from "lucide-react";
import Staff from "./Staff";
import AccountSettings from "../components/Profile/PasswordChange";
import NotificationPreferences from "../components/Profile/NotificationPreferences";
import BusinessInformation from "../components/Profile/BusinessInformation";
import PlanSettings from "../components/Profile/PlanSettings";
import { UserDataContext } from "../context/UserDataContext";

export default function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("account");
  const { loggedInUser } = useContext(UserDataContext);

  // Set active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ["account", "business", "staff", "notifications", "plans"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs
        aria-label="Settings"
        classNames={{
          base: "flex w-full flex-col lg:flex-row", // root flex container
          tabList: "grid grid-cols-2 sm:grid-cols-3 md:flex md:justify-between gap-2 md:gap-0",
          tab: "px-2 md:px-4 h-10 whitespace-nowrap min-w-0 flex items-center justify-center",
          tabContent: "group-data-[selected=true]:text-gray-900 px-2 text-center",
          panel: "mt-4 lg:ml-6",
        }}
        variant="underlined"
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
      >
        <Tab
          key="account"
          title={
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Account</span>
            </div>
          }
        >
          <div className="mt-6 space-y-6">
            <AccountSettings />
          </div>
        </Tab>

        <Tab
          key="business"
          title={
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Business</span>
            </div>
          }
        >
          <div className="mt-6">
            <BusinessInformation />
          </div>
        </Tab>

        <Tab
          key="staff"
          title={
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </div>
          }
        >
          <Staff />
        </Tab>

        <Tab
          key="notifications"
          title={
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
          }
        >
          <div className="mt-6">
            <NotificationPreferences />
          </div>
        </Tab>
        {
          (loggedInUser.role === "God Mode" || loggedInUser.account_type !== "enterprise") &&
          <Tab
            key="plans"
            title={
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Plans</span>
              </div>
            }
          >
            <PlanSettings />
          </Tab>
        }
      </Tabs>
    </div>
  );
}
