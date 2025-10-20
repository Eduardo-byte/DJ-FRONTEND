import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ScrollShadow } from "@heroui/react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Sparkles,
  Code2,
  UserCog,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bot,
  Boxes,
  Mail,
  MessageCircle,
  UserPlus,
} from 'lucide-react';
import { UserDataContext } from '../context/UserDataContext';
import { clientExtensionService } from '../api';
import { useRealtime } from '../context/RealtimeContext';
import AdminCreateAccount from './AdminCreateAccount';

export default function Sidebar({ isCollapsed, onCollapse, user }) {
  const location = useLocation();
  const { userData, loggedInUser } = useContext(UserDataContext);
  const currentUserId = userData?.client_id;
  // State variable for new conversations count
  const [conversationCount, setConversationCount] = useState(0);
  // Track the last processed message timestamp to avoid double counting
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(null);

  const [connectedExtensions, setConnectedExtensions] = useState([]);
  const [whatsappAccounts, setWhatsappAccounts] = useState([]);
  const [isAdminCreateOpen, setIsAdminCreateOpen] = useState(false);

  // 1) Load extensions
  useEffect(() => {
    if (!userData) return;
    clientExtensionService
      .getClientExtensionsByClientId(userData.client_id)
      .then((exts) => setConnectedExtensions(exts.filter((e) => e.is_connected)))
      .catch(console.error);
  }, [userData]);

  // 2) Extract WABAs
  useEffect(() => {
    const wtExt = connectedExtensions.find(
      (e) => e.extension_id === 'a2a83703-8c62-4216-b94d-9ecfdfc32438'
    );
    if (!wtExt) return setWhatsappAccounts([]);
    setWhatsappAccounts(
      (wtExt.page_ids || []).map((p) => ({
        account_id: p.business_account_id,
        waba_name: p.waba_name,
        business_name: p.business_name,
        accessToken: wtExt.long_lived_token,
      }))
    );
  }, [connectedExtensions]);

  // Check if we're on the playground route
  const isPlaygroundRoute = location.pathname === '/playground';

  // Force sidebar to be collapsed when on the playground route
  useEffect(() => {
    if (isPlaygroundRoute && !isCollapsed) {
      onCollapse(true);
    }
  }, [location.pathname, isCollapsed, onCollapse, isPlaygroundRoute]);

  // Use the global realtime context
  const { lastMessageEvent, conversationReadEvent } = useRealtime();

  // Handle incoming message events from the global RealtimeProvider
  useEffect(() => {
    if (!lastMessageEvent) return;
    
    const payload = lastMessageEvent;
    const oldRecord = payload.old;
    const newRecord = payload.new;
    const messageTimestamp = payload.commit_timestamp;
    
    // Only process messages newer than the last processed one
    if (lastProcessedTimestamp && messageTimestamp <= lastProcessedTimestamp) {
      return;
    }

    let isLiveAgentChanged = false;
    let otherFieldsChanged = false;

    if (oldRecord && newRecord) {
      isLiveAgentChanged =
        oldRecord.isLiveAgent !== undefined &&
        newRecord.isLiveAgent !== undefined &&
        oldRecord.isLiveAgent !== newRecord.isLiveAgent;

      // If length of content.messages changed => new/updated message
      otherFieldsChanged =
        (oldRecord.content?.messages?.length !== newRecord.content?.messages?.length);
    } else if (!oldRecord && newRecord) {
      // This is a new conversation/message
      otherFieldsChanged = true;
    }

    // Only increment count for actual message changes, not just isLiveAgent changes
    if (!isLiveAgentChanged || otherFieldsChanged) {
      const isConversationsPage = location.pathname === '/conversations';
      
      if (!isConversationsPage) {
        setConversationCount((prev) => prev + 1);
      }
      
      // Update the last processed timestamp
      setLastProcessedTimestamp(messageTimestamp);
    }
  }, [lastMessageEvent, location.pathname, lastProcessedTimestamp]);

  // Handle conversation being marked as read (reduce count)
  useEffect(() => {
    if (!conversationReadEvent) return;
    
    setConversationCount((prev) => Math.max(0, prev - 1));
  }, [conversationReadEvent]);

  // Reset count when navigating to conversations page
  useEffect(() => {
    const isConversationsPage = location.pathname === '/conversations';
    
    if (isConversationsPage) {
      setConversationCount(0);
      // Update the timestamp to current time so old messages don't re-trigger the counter
      if (lastMessageEvent?.commit_timestamp) {
        setLastProcessedTimestamp(lastMessageEvent.commit_timestamp);
      }
    }
  }, [location.pathname, lastMessageEvent]);

  // Update the menu groups with the dynamic badge count
  const menuGroups = [
    {
      title: 'Main',
      items: [
        // Only show Create Account for users with God Mode role
        ...(loggedInUser.role === 'God Mode'
          ? [
            {
              name: 'Create Account',
              icon: UserPlus,
              action: () => setIsAdminCreateOpen(true),
              description: 'Create new client account',
              isButton: true,
            },
          ]
          : []),
        // Only show Ask for users with God Mode role
        ...(loggedInUser.role === 'God Mode'
          ? [
            {
              name: 'Ask',
              icon: MessageCircle,
              path: '/ask',
              description: 'Chat with AI assistant',
            },
          ]
          : []),
        {
          name: 'Dashboard',
          icon: LayoutDashboard,
          path: '/',
          description: 'Overview and analytics',
        },
      ],
    },
    {
      title: 'Communication',
      items: [
        {
          name: 'Conversations',
          icon: MessageSquare,
          path: '/conversations',
          description: 'Chat with your customers',
          // Use the dynamic badge count (only show if count > 0)
          badge: conversationCount > 0 ? conversationCount : null,
        },
        {
          name: 'Leads',
          icon: Users,
          path: '/leads',
          description: 'Manage your leads',
        },
      ],
    },
    {
      title: 'AI Tools',
      items: [
        {
          name: 'Agents',
          icon: Bot,
          path: '/agents',
          description: 'Manage AI chatbots',
        },
        // Only include the "AI Playground" item when role === "God Mode":
        ...(loggedInUser.role === 'God Mode'
          ? [
            {
              name: 'AI Playground',
              icon: Sparkles,
              path: '/playground',
              description: 'Experiment with AI features',
            },
          ]
          : []),
      ],
    },
    // {
    //   title: 'Campaigns',
    //   items: [
    //     {
    //       name: 'Social Media',
    //       icon: MessageCircle,
    //       path: '/campaigns/social-media',
    //       description: 'Manage social media posts',
    //       isNew: true,
    //     },
    //     // {
    //     //   name: 'SMS Campaign',
    //     //   icon: MessageSquare,
    //     //   path: '/campaigns/sms',
    //     //   description: 'Manage SMS campaigns',
    //     // },
    //     // {
    //     //   name: 'Email Campaign',
    //     //   icon: Mail,
    //     //   path: '/campaigns/email',
    //     //   description: 'Manage email campaigns'
    //     // },
    //   ],
    // },
    {
      title: 'Integration',
      items: [
        {
          name: 'Integrations',
          icon: Boxes,
          path: '/integrations',
          description: 'Add more features',
          isNew: true,
        },
      ],
    },
    // {
    //   title: 'Whatsapp Templates',
    //   items: [
    //     {
    //       name: 'Templates',
    //       icon: Boxes,
    //       path: '/whatsapp-templates',
    //       description: 'Add more features',
    //       isNew: true,
    //     },
    //   ],
    // },
    ...(whatsappAccounts.length > 0 && loggedInUser.role === 'God Mode'
      ? [
        {
          title: 'Whatsapp Templates',
          items: [
            {
              name: 'Templates',
              icon: Boxes,
              path: '/whatsapp-templates',
              description: 'Manage your WhatsApp templates',
              isNew: true,
            }]
        }
      ] : []
    ),
    {
      title: 'Settings',
      items: [
        // {
        //   name: 'Staff',
        //   icon: UserCog,
        //   path: '/staff',
        //   description: 'Team management',
        // },
        // Only show API Keys for users with God Mode role
        ...(loggedInUser.role === 'God Mode'
          ? [
            {
              name: 'API Keys',
              icon: Code2,
              path: '/api-keys',
              description: 'Manage API keys',
            },
          ]
          : []),
        {
          name: 'Profile',
          icon: User,
          path: '/profile',
          description: 'Your account settings',
        },
      ],
    },
  ];

  // MenuItem component (unchanged)
  const MenuItem = ({ item }) => {
    const isActive = !item.isButton && (
      location.pathname === item.path ||
      (item.path === '/' && location.pathname === '') ||
      (item.path !== '/' && location.pathname.startsWith(item.path)) ||
      (item.path === '/agents' && location.pathname.startsWith("/playground") && loggedInUser.role != "God Mode")
    );
    
    const content = (
      <>
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-900 rounded-r-full" />
        )}

        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'group-hover:bg-gray-100'
              }`}
          >
            <item.icon
              className={`w-4 h-4 ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}
            />
          </div>
          {!shouldBeCollapsed && (
            <span
              className={`font-medium text-sm ${isActive ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}
            >
              {item.name}
              {item.isNew && (
                <span className={`ml-2 text-[8px] font-semibold px-2 py-0.5 rounded-full ${isActive
                  ? 'bg-gray-900/10 text-gray-900 border-1 border-solid border-gray-900/10' // Black background with white text when selected
                  : 'bg-brand/10 border-1 border-solid border-brand text-brand' // Original green styling when not selected
                  }`}>
                  NEW
                </span>
              )}
            </span>
          )}
        </div>
        {!shouldBeCollapsed && item.badge && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${item.badge === 'New'
              ? 'bg-gray-900 text-brand'
              : 'bg-gray-100 text-gray-600'
              }`}
          >
            {item.badge}
          </span>
        )}
      </>
    );

    if (item.isButton) {
      return (
        <button
          onClick={item.action}
          className={`relative group flex items-center justify-between p-2 rounded-lg transition-all duration-250 w-full text-left ${
            item.name === 'Create Account' 
              ? 'bg-gradient-to-tr from-brand to-brand-secondary text-gray-900 hover:opacity-90' 
              : 'hover:bg-gray-50 text-gray-600'
          }`}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        to={item.path}
        className={`relative group flex items-center justify-between p-2 rounded-lg transition-all duration-250 ${isActive ? 'bg-gradient-to-tr from-brand to-brand-secondary text-gray-900' : 'hover:bg-gray-50 text-gray-600'
          }`}
      >
        {content}
      </Link>
    );
  };

  // Mobile MenuItem component for bottom navigation
  const MobileMenuItem = ({ item }) => {
    const isActive =
      location.pathname === item.path ||
      (item.path === '/' && location.pathname === '') ||
      (item.path !== '/' && location.pathname.startsWith(item.path)) ||
      (item.path === '/agents' && location.pathname.startsWith("/playground") && loggedInUser.role != "God Mode");
    
    return (
      <Link
        to={item.path}
        className="relative flex flex-col items-center justify-center p-3 transition-all duration-250 min-w-[80px] h-[80px] hover:bg-gray-50"
      >
        {isActive && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-brand rounded-b-full" />
        )}
        
        <div className="relative">
          <div className="p-2">
            <item.icon
              className={`w-5 h-5 ${
                isActive ? 'text-brand' : 'text-gray-600'
              }`}
            />
          </div>
          {item.badge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {item.badge}
            </span>
          )}
        </div>
        
        {/* Only show text for active item */}
        {isActive && (
          <span className="text-xs font-medium mt-1 text-center text-gray-900">
            {item.name}
          </span>
        )}
        
        {/* Only show NEW badge for active item */}
        {item.isNew && isActive && (
          <span className="text-[8px] font-semibold px-1 py-0.5 rounded-full mt-1 bg-brand/10 text-brand border border-brand/20">
            NEW
          </span>
        )}
      </Link>
    );
  };

  // Determine if sidebar should be collapsed based on route or prop
  const shouldBeCollapsed = isPlaygroundRoute || isCollapsed;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:block h-screen fixed left-0 top-0 bg-white border-r border-gray-100 z-50 transition-all duration-250 ${shouldBeCollapsed ? 'w-[80px]' : 'w-[280px]'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            {!shouldBeCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <img src="/Olivia-ai-LOGO.png" alt="Olivia Logo" />
                </div>
                <span className="font-bold text-gray-900 text-xl">OLIVIA AI</span>
              </div>
            )}
            <div
              onClick={() => onCollapse(!isCollapsed)}
              className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              {shouldBeCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </div>

          <ScrollShadow hideScrollBar className="flex-1" size={20}>
            <nav className="p-4">
              {menuGroups.map((group, index) => (
                <div key={group.title} className={index !== 0 ? 'mt-8' : ''}>
                  {!shouldBeCollapsed && (
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">
                      {group.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <MenuItem key={item.path} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollShadow>

          {!shouldBeCollapsed && (
            <div className="p-4 border-t border-gray-100">
              <div className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Last login: {new Date(user?.last_sign_in_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-lg">
        <div className="px-4 pt-2">
          <ScrollShadow 
            hideScrollBar 
            className="w-full" 
            orientation="horizontal"
            size={20}
          >
            <div className="flex gap-2 pb-0" style={{ width: 'max-content' }}>
              {menuGroups.flatMap(group => group.items).map((item) => (
                <MobileMenuItem key={item.path} item={item} />
              ))}
            </div>
          </ScrollShadow>
        </div>
      </div>

      {/* Admin Create Account Modal - Only for God Mode users */}
      <AdminCreateAccount
        isOpen={isAdminCreateOpen}
        onClose={() => setIsAdminCreateOpen(false)}
        onSuccess={() => {
          setIsAdminCreateOpen(false);
        }}
      />
    </>
  );
}
