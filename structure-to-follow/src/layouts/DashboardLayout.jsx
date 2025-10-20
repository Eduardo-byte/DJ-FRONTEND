import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, AutocompleteItem, Autocomplete, Tooltip, Button } from "@heroui/react";
import { Bell, LogOut, Info, Infinity, User } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useContext, useEffect, useState } from 'react';
import { UserDataContext } from '../context/UserDataContext';
import { getAllClients, setCurrentUserData, setUserLoggedInData } from '../utils/clientsFunctionsUtils';
import ReactSelect, { components } from 'react-select';
import PaymentModal from '../components/PaymentModal';
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';
import { subscriptionService } from '../api/services/subscription.service';
import { RealtimeProvider } from '../context/RealtimeContext';

export default function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [allClientsList, setAllClientsList] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const { userData, setUserData, loggedInUser, setLoggedInUser, isStaff, setIsStaff } = useContext(UserDataContext);

  // Global subscription check - exclude Profile page
  const isProfilePage = location.pathname === '/profile';
  const { showPaymentModal, setShowPaymentModal, handleGoToCheckout, handleBookDemo } = useSubscriptionCheck(
    isProfilePage ? null : loggedInUser, // Don't check subscription on Profile page
    user
  );

  // Sign-out handler
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  // Fetch all clients and set the default user data on mount
  useEffect(() => {
    const getAllClientsData = async () => {
      // Set default user data (based on the logged-in user's id)
      setCurrentUserData(user.id, setUserData, setIsStaff)
      setUserLoggedInData(user.id, setLoggedInUser)
      // Fetch all clients data
      getAllClients(setAllClientsList);
    };
    getAllClientsData();
  }, [user.id]);

  // Fetch subscription data when userData changes
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (userData && userData.client_id) {
        try {
          const data = await subscriptionService.getSubscriptionByClientId(userData.client_id);
          setSubscriptionData(data);
        } catch (error) {
          console.error("Error fetching subscription data:", error);
          setSubscriptionData(null);
        }
      }
    };

    fetchSubscriptionData();
  }, [userData?.client_id]);

  // Listen for the custom event to collapse the sidebar
  useEffect(() => {
    const handleCollapseSidebar = () => {
      setIsSidebarCollapsed(true);
    };

    // Add event listener
    window.addEventListener('collapse-sidebar', handleCollapseSidebar);

    // Clean up event listener
    return () => {
      window.removeEventListener('collapse-sidebar', handleCollapseSidebar);
    };
  }, []);

  // (Optional) Debug: log when userData or allClientsList changes
  // useEffect(() => {
  //   console.log("UserLoggedIn: ", loggedInUser);
  //   console.log("Current user data: ", userData);
  //   console.log("allClientsList: ", allClientsList);
  // }, [userData, allClientsList, loggedInUser]);

  // ------------------------------
  // REACT-SELECT DROPDOWN LOGIC
  // ------------------------------

  // Map your clients into select options
  const options = allClientsList.map(client => ({
    value: client.client_id,
    label: client.company_name,
    contact_name: client.contact_name,
    auth_id: client.authenticated_id
  }));

  // Custom option component for the dropdown menu
  const CustomOption = (props) => (
    <components.Option {...props}>
      <div>
        <div>{props.data.label}</div>
        <div style={{ fontSize: '0.8em', color: '#666' }}>
          {props.data.contact_name}
        </div>
      </div>
    </components.Option>
  );

  // Custom single-value component for the select (when an option is selected)
  const CustomSingleValue = (props) => {
    const truncateText = (text, maxLength) =>
      text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

    return (
      <components.SingleValue {...props}>
        <div>{truncateText(props.data.label, 25)}</div>
      </components.SingleValue>
    );
  };

  // Filter options based on both label and contact name
  const filterOption = (option, inputValue) => {
    return (
      option.data.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.data.contact_name.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // Handler to update the current client when a new option is selected
  const handleClientIdChange = (selectedOption) => {
    if (selectedOption) {
      // console.log("selectedOption: ", selectedOption);
      setCurrentUserData(selectedOption.auth_id, setUserData);
    }
  };

  //If we want to have the Autocomplete from heroUI DO NOT DELETE:
  // const handleClientIdChange = (selectedOption) => {
  //   if (selectedOption) {
  //     // console.log("selectedOption: ", selectedOption);
  //     setCurrentUserData(selectedOption.authenticated_id, setUserData);
  //   }
  // };

  return (
    <RealtimeProvider currentUserId={userData?.client_id}>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Global Payment Modal - shows on all pages except Profile */}
        {!isProfilePage && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onGoToCheckout={handleGoToCheckout(navigate)}
            onBookDemo={handleBookDemo}
          />
        )}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onCollapse={setIsSidebarCollapsed}
          user={user}
        />

      <div
        // style={{ zIndex: 100000}}
        className={`flex-1 transition-all duration-250 ease-in-out ml-0 ${
          isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'
        }`}
      >
        <nav style={{ zIndex: 10 }} className="bg-white border-b border-gray-100 sticky top-0 ">
          <div className="px-6 h-16 py-8 flex justify-between items-center bg-white">
            {/* Olivia Logo - Mobile Only */}
            <div className="md:hidden flex items-center">
              <img src="/Olivia-ai-LOGO.png" alt="Olivia Logo" className="w-8 h-8" />
              <p className=' text-black/80 font-bold ml-1'>OLIVIA AI</p>
            </div>
            <div></div>
            
            <div className="flex justify-end gap-6 items-center flex-1 md:flex-none">
              {/* Render the clients dropdown only for God Mode users */}
              {userData && loggedInUser.role === "God Mode" && allClientsList.length > 0 && (
                <div className="w-64">
                  <ReactSelect
                    options={options}
                    placeholder="Search and select client"
                    onChange={handleClientIdChange}
                    isSearchable
                    filterOption={filterOption}
                    components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                    value={options.find(option => option.value === userData.client_id)}
                    styles={{
                      menu: (provided) => ({ ...provided, zIndex: 9999 }),
                    }}
                  />
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                {/* Trial message count display */}
                {userData && (() => {
                  // Check if user has actually paid (zoho_info is not empty)
                  const hasActivePaidSubscription = subscriptionData && 
                    subscriptionData.zoho_info && 
                    Object.keys(subscriptionData.zoho_info).length > 0;
                  
                  // If user hasn't paid, show 0 credits
                  if (!hasActivePaidSubscription) {
                    return (
                      <Tooltip
                        content={
                          <div className="text-sm w-[250px] p-4">
                            <p className='font-bold'>0 Credits</p>
                            <p className='opacity-60 mt-1'>You don't have an active subscription. Please choose a plan to get credits.</p>
                            <Button size="sm" fullWidth className='bg-brand mt-4' variant="solid" onPress={() => navigate('/profile?tab=plans')}>
                              Choose Plan
                            </Button>
                          </div>
                        }
                        placement="bottom"
                      >
                        <div className="flex items-center gap-1 border-2 border-gray-400/50 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium text-gray-900">
                            0 credits left
                          </span>
                          <Info className="w-4 h-4 text-gray-600" />
                        </div>
                      </Tooltip>
                    );
                  }
                  
                  // If user has paid, show normal credits display
                  return (
                    <Tooltip
                      content={userData.trial_message_count === -1
                        ? `You have unlimited credits available. Your subscription renews on ${new Date(userData.trial_end).toLocaleDateString()}.`
                        : `You have used ${userData.trial_current_message_count} out of ${userData.trial_message_count} available credits this month. Your credits will renew on ${new Date(userData.trial_end).toLocaleDateString()}.`
                      }
                      placement="bottom"
                    >
                      <div className="flex items-center gap-1 border-2 border-gray-400/50 px-3 py-1 rounded-full">
                        {userData.trial_message_count === -1 ? (
                          <>
                            <Infinity className="w-4 h-4 text-gray-900" />
                            <span className="text-sm font-medium text-gray-900">credits</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-900">
                              {userData.trial_message_count - userData.trial_current_message_count} credits left
                            </span>
                            <Info className="w-4 h-4 text-gray-600" />
                          </>
                        )}
                      </div>
                    </Tooltip>
                  );
                })()}

                <Dropdown>
                  <DropdownTrigger>
                    <div className="flex items-center gap-2 cursor-pointer border sm:border-none rounded-full">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-900">
                          {user?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden sm:inline text-sm text-gray-600">{user?.email}</span>
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User actions">
                    <DropdownItem key="email" className="cursor-default">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-900">{user?.email}</span>
                        <span className="text-xs text-gray-500">
                          Last login: {new Date(user?.last_sign_in_at).toLocaleDateString()}
                        </span>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      key="profile"
                      onPress={() => navigate('/profile')}
                      startContent={<User className="w-4 h-4" />}
                    >
                      Profile
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      className="text-danger"
                      color="danger"
                      onPress={handleSignOut}
                      startContent={<LogOut className="w-4 h-4" />}
                    >
                      Sign Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
        </nav>

        <main className="p-4 pb-24 md:pb-4">
          <div className="max-w-[2000px] mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>

      
      </div>
    </RealtimeProvider>
  );
}
