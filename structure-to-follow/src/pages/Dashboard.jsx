import { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserDataContext'
import { metricsService } from '../api/services/metrics.service'
import { staffService } from '../api/services/staff.service'
import { useAuth } from '../context/AuthContext'
import { Card, CardBody, CardHeader, Chip, Tab, Tabs, Button } from "@heroui/react"
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  Globe,
  MessagesSquare,
  UserPlus,
  Facebook,
  Instagram,
  Twitter,
  Send,
  Bot,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  MessageCircle
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import Joyride, { STATUS } from 'react-joyride';
import { dashboardSteps } from '../Demo/Dashboard/Dashboard.demo'
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip'
import useTourController from '../Demo/utils/useTourController'

// Channel configuration
const CHANNELS = {
  text: {
    displayName: 'Chat Widget',
    icon: Globe,
    color: '#CCFC01'
  },
  facebook: {
    displayName: 'Facebook',
    icon: Facebook,
    color: '#1877F2'
  },
  instagram: {
    displayName: 'Instagram',
    icon: Instagram,
    color: '#E4405F'
  },
  telegram: {
    displayName: 'Telegram',
    icon: Send,
    color: '#0088cc'
  },
  whatsapp: {
    displayName: 'WhatsApp',
    icon: MessageCircle,
    color: '#25D366'
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { userData, loggedInUser, isStaff } = useContext(UserDataContext)
  const { user } = useAuth()
  const [showPromo, setShowPromo] = useState(true)
  const [metricsData, setMetricsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [fadeState, setFadeState] = useState('in')
  const [activeTab, setActiveTab] = useState('all')
  const promoIntervalRef = useRef(null)

  const { runTour, handleJoyrideCallback } = useTourController("dashboard", loggedInUser)

  // Promotional messages (same as before)
  // Promotional messages based on account type
  const basicPromos = [
    {
      icon: Sparkles,
      title: "Upgrade to create more agents!",
      description: "Expand your capabilities with additional AI agents for different use cases.",
      buttonText: "Upgrade Now"
    },
    {
      icon: Facebook,
      title: "Connect with social media!",
      description: "Integrate with Facebook, Instagram, and Twitter to reach more customers.",
      buttonText: "Connect Channels"
    },
    {
      icon: MessageSquare,
      title: "Get 10,000 messages per month!",
      description: "Scale your conversations with increased message capacity.",
      buttonText: "Upgrade Plan"
    }
  ]

  const proPromos = [
    {
      icon: Send,
      title: "Add WhatsApp integration!",
      description: "Connect with customers on their preferred messaging platform.",
      buttonText: "Enable WhatsApp"
    },
    {
      icon: Activity,
      title: "Unlock unlimited messages!",
      description: "Remove all limits and scale your customer communications.",
      buttonText: "Upgrade Now"
    },
    {
      icon: Globe,
      title: "Custom CRM integration!",
      description: "Connect your database and CRM systems for seamless data flow.",
      buttonText: "Set Up Integration"
    }
  ]

  const advancedPromos = [
    {
      icon: Bot,
      title: "Create custom solutions!",
      description: "Work with our team to build tailored AI solutions for your business.",
      buttonText: "Contact Us"
    },
    {
      icon: Users,
      title: "Re-engage with old leads!",
      description: "Turn past conversations into new opportunities with smart follow-ups.",
      buttonText: "Start Campaign"
    },
    {
      icon: Zap,
      title: "Custom engagement campaigns!",
      description: "Design targeted outreach strategies to boost conversion rates.",
      buttonText: "Create Campaign"
    }
  ]

  // Get the appropriate promos based on account type
  const getPromos = () => {
    const accountType = userData?.account_type?.toLowerCase() || 'basic'

    if (accountType === 'pro') return proPromos
    if (accountType === 'advanced') return advancedPromos
    return basicPromos // default to basic
  }

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userData?.client_id) {
        setLoading(false)
        return
      }
      if (isStaff && loggedInUser.account_status === "inactive") {
        try {
          await staffService.updateStaffInfo(loggedInUser.staff_id, { account_status: "active" })
        } catch (error) {
          console.log("Error updating Staff: ", error)
        }
      }

      try {
        const data = await metricsService.getComprehensiveMetricsByClientId(userData.client_id)
        setMetricsData(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [userData?.client_id])

  // Rotate through promotional messages
  useEffect(() => {
    if (!showPromo) return

    // Clear any existing interval when component unmounts or showPromo changes
    return () => {
      if (promoIntervalRef.current) {
        clearInterval(promoIntervalRef.current)
      }
    }
  }, [showPromo])

  // Start the rotation when component mounts
  useEffect(() => {
    if (!showPromo) return

    const rotatePromos = () => {
      const promos = getPromos()

      // Start fade out
      setFadeState('out')

      // After fade out completes, change content and fade in
      setTimeout(() => {
        setCurrentPromoIndex(prevIndex => (prevIndex + 1) % promos.length)
        setFadeState('in')
      }, 500) // 500ms for fade out
    }

    // Set interval for rotation (every 8 seconds)
    promoIntervalRef.current = setInterval(rotatePromos, 8000)

    // Clean up interval on unmount
    return () => {
      if (promoIntervalRef.current) {
        clearInterval(promoIntervalRef.current)
      }
    }
  }, [showPromo, userData?.account_type])

  // Process metrics data for display
  const processChannelData = () => {
    if (!metricsData) return []

    return Object.keys(CHANNELS).map(channelType => {
      const channelConfig = CHANNELS[channelType]

      // Map 'text' channel to 'website' for lead metrics lookup
      const leadChannelKey = channelType === 'text' ? 'website' : channelType

      const channelMetric = metricsData.channelMetrics.channelMetrics.find(
        cm => cm.channelType === channelType
      ) || {
        count: 0,
        currentWeekCount: 0,
        previousWeekCount: 0,
        percentageChange: 0,
        trend: true
      }

      const leadMetric = metricsData.leadMetrics.channelBreakdown.find(
        lb => lb.channel === leadChannelKey // Use the mapped key here
      ) || {
        totalLeads: 0,
        qualifiedLeads: 0,
        currentWeekLeads: 0,
        previousWeekLeads: 0,
        percentageChange: 0,
        trend: true
      }

      return {
        channelType,
        displayName: channelConfig.displayName,
        icon: channelConfig.icon,
        color: channelConfig.color,
        messages: channelMetric.count,
        messageChange: channelMetric.percentageChange,
        messageTrend: channelMetric.trend,
        currentWeekMessages: channelMetric.currentWeekCount,
        leads: leadMetric.totalLeads,
        leadChange: leadMetric.percentageChange,
        leadTrend: leadMetric.trend,
        currentWeekLeads: leadMetric.currentWeekLeads,
        engagementRate: channelMetric.engagement?.engagementRate || 0,
        engagementTrend: channelMetric.engagement?.engagementTrend || true
      }
    })
  }

  const channelData = processChannelData()
  const activeChannelData = activeTab === 'all'
    ? channelData
    : channelData.filter(channel => activeTab === 'website' ? channel.channelType === 'website' : channel.channelType === activeTab)

  // Get metrics for the current tab
  const getCurrentTabMetrics = () => {
    if (!metricsData) return []

    if (activeTab === 'all') {
      return [
        {
          title: 'Total Conversations',
          value: metricsData.messageMetrics.count.toLocaleString(),
          change: `${metricsData.messageMetrics.percentageChange > 0 ? '+' : ''}${metricsData.messageMetrics.percentageChange.toFixed(1)}%`,
          isPositive: metricsData.messageMetrics.trend,
          icon: MessageSquare
        },
        {
          title: 'Engaged Conversations',
          value: metricsData.messageMetrics.engagement.engagedConversations.toLocaleString(),
          change: `${metricsData.messageMetrics.engagement.engagementRateChange > 0 ? '+' : ''}${metricsData.messageMetrics.engagement.engagementRateChange.toFixed(1)}%`,
          isPositive: metricsData.messageMetrics.engagement.engagementTrend,
          icon: Users
        },
        {
          title: 'Total Leads',
          value: metricsData.leadMetrics.totalLeads.toLocaleString(),
          change: `${metricsData.leadMetrics.percentageChange > 0 ? '+' : ''}${metricsData.leadMetrics.percentageChange.toFixed(1)}%`,
          isPositive: metricsData.leadMetrics.trend,
          icon: UserPlus
        },
        {
          title: 'Engagement Rate',
          value: `${metricsData.messageMetrics.engagement.engagementRate.toFixed(1)}%`,
          change: `${metricsData.messageMetrics.engagement.engagementRateChange > 0 ? '+' : ''}${metricsData.messageMetrics.engagement.engagementRateChange.toFixed(1)}%`,
          isPositive: metricsData.messageMetrics.engagement.engagementTrend,
          icon: Activity
        }
      ]
    }

    const channel = channelData.find(c => c.channelType === activeTab) || {
      messages: 0,
      messageChange: 0,
      messageTrend: true,
      leads: 0,
      leadChange: 0,
      leadTrend: true,
      engagementRate: 0,
      engagementTrend: true
    }

    return [
      {
        title: 'Total Messages',
        value: channel.messages.toLocaleString(),
        change: `${channel.messageChange > 0 ? '+' : ''}${channel.messageChange.toFixed(1)}%`,
        isPositive: channel.messageTrend,
        icon: MessageSquare
      },
      {
        title: 'Engagement Rate',
        value: `${channel.engagementRate.toFixed(1)}%`,
        change: `${channel.engagementTrend ? '+' : '-'}${Math.abs(channel.messageChange).toFixed(1)}%`,
        isPositive: channel.engagementTrend,
        icon: Activity
      },
      {
        title: 'Total Leads',
        value: channel.leads.toLocaleString(),
        change: `${channel.leadChange > 0 ? '+' : ''}${channel.leadChange.toFixed(1)}%`,
        isPositive: channel.leadTrend,
        icon: UserPlus
      },
      {
        title: 'Current Week',
        value: `${channel.currentWeekMessages} msg / ${channel.currentWeekLeads} leads`,
        change: `${channel.messageChange > 0 ? '+' : ''}${channel.messageChange.toFixed(1)}%`,
        isPositive: channel.messageTrend,
        icon: Clock
      }
    ]
  }

  // Get conversation data for charts
  const getConversationData = () => {
    if (!metricsData) return []

    if (activeTab === 'all') {
      return metricsData.messageMetrics.dailyData.map(day => ({
        name: day.dayOfWeek,
        value: day.messageCount
      }))
    }

    const channelMetric = metricsData.channelMetrics.channelMetrics.find(
      cm => cm.channelType === activeTab
    )

    return channelMetric
      ? channelMetric.dailyData.map(day => ({
        name: day.dayOfWeek,
        value: day.messageCount
      }))
      : Array(7).fill(0).map((_, i) => ({
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        value: 0
      }))
  }

  const MetricCard = ({ metric }) => {
    const metricClass = metric.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')

    return (
      <div className={`${metricClass} p-6 bg-white border border-gray-100 rounded-lg`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{metric.title}</p>
            <h3 className="text-2xl font-semibold text-gray-900 mt-1">{metric.value}</h3>
          </div>
          <div className={`p-2 rounded-lg ${metric.isPositive ? 'bg-brand/10' : 'bg-red-50'}`}>
            <metric.icon className={`w-5 h-5 ${metric.isPositive ? 'text-gray-900' : 'text-red-500'}`} />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-3">
          {metric.isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {metric.change}
          </span>
          <span className="text-sm text-gray-400">vs last week</span>
        </div>
      </div>
    )
  }

  const ChannelCard = ({ channel }) => {
    const ChannelIcon = channel.icon

    return (
      <div className="p-4 border border-gray-100 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${channel.color}20` }}>
            <ChannelIcon className="w-5 h-5" style={{ color: channel.color }} />
          </div>
          <h4 className="font-semibold text-gray-900">{channel.displayName}</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Messages</p>
            <p className="text-lg font-semibold text-gray-900">{channel.messages}</p>
            <div className="flex items-center gap-1 mt-1">
              {channel.messageTrend ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${channel.messageTrend ? 'text-green-500' : 'text-red-500'}`}>
                {channel.messageChange > 0 ? '+' : ''}{channel.messageChange}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Leads</p>
            <p className="text-lg font-semibold text-gray-900">{channel.leads}</p>
            <div className="flex items-center gap-1 mt-1">
              {channel.leadTrend ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${channel.leadTrend ? 'text-green-500' : 'text-red-500'}`}>
                {channel.leadChange > 0 ? '+' : ''}{channel.leadChange}%
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Engagement Rate</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              {channel.engagementRate.toFixed(1)}%
            </p>
            {channel.engagementTrend ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                +{Math.abs(channel.messageChange)}%
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                -{Math.abs(channel.messageChange)}%
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading metrics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Promotional Banner (keep your existing promo banner) */}
      {showPromo && (
        <div className="relative bg-gray-900 text-white rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTI5LjQyIDY1Ljc1YzUuMjktMy4xNyAxMS43My0zLjE3IDE3LjAyIDBMNTY3LjQgMzgyLjc1YzUuMjkgMy4xNyA4LjUxIDguOTUgOC41MSAxNS4yNXYzNC4wMWMwIDYuMy0zLjIyIDEyLjA4LTguNTEgMTUuMjVMNTY3LjQgMzgyLjc1YzUuMjkgMy4xNyA4LjUxIDguOTUgOC41MSAxNS4yNXYzNC4wMWMwIDYuMy0zLjIyIDEyLjA4LTguNTEgMTUuMjVMMTQ2LjQ0IDUzNC4yNWMtNS4yOSAzLjE3LTExLjczIDMuMTctMTcuMDIgMEwxMjkuNDIgNjUuNzV6IiBmaWxsPSIjQ0NGQzAxIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-10" />
          <div
            className={`relative px-6 py-4 flex items-center justify-between transition-opacity duration-500 ${fadeState === 'in' ? 'opacity-100' : 'opacity-0'
              }`}
          >
            {(() => {
              const promos = getPromos()
              const currentPromo = promos[currentPromoIndex]
              const PromoIcon = currentPromo.icon

              return (
                <>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block p-2 rounded-lg bg-brand">
                      <PromoIcon className="w-5 h-5 text-gray-900" />
                    </div>
                    <p className="text-sm sm:text-base font-medium">
                      {currentPromo.title}
                      <span className="hidden sm:inline"> {currentPromo.description}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      className="bg-brand text-gray-900 font-medium hidden sm:flex"
                      radius="full"
                      endContent={<ArrowRight className="w-4 h-4" />}
                      onPress={() => navigate('/profile?tab=plans')}
                    >
                      {currentPromo.buttonText}
                    </Button>
                    <button
                      onClick={() => setShowPromo(false)}
                      className="text-white/80 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={dashboardSteps}
        run={runTour}
        scrollOffset={150}
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

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {activeTab === 'all' ? 'Overview of all channels' : `Metrics for ${CHANNELS[activeTab]?.displayName || ''}`}
        </p>
      </div>

      {/* Enhanced Tabs for channel selection */}
      <Tabs
        aria-label="Channel metrics"
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        classNames={{
          tabList: "gap-1 p-0 overflow-x-auto",
          cursor: "bg-brand",
          tab: "max-w-fit px-3 h-10",
          tabContent: "group-data-[selected=true]:text-gray-900",
        }}
        variant="underlined"
      >
        <Tab key="all" title="All Channels" className="introduction">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>All</span>
          </div>
        </Tab>
        <Tab key="text" title="Website Chat">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </div>
        </Tab>
        <Tab key="facebook" title="Facebook">
          <div className="flex items-center gap-2">
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </div>
        </Tab>
        <Tab key="instagram" title="Instagram">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </div>
        </Tab>
        <Tab key="whatsapp" title="WhatsApp">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </div>
        </Tab>
        <Tab key="telegram" title="Telegram">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </div>
        </Tab>
      </Tabs>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {getCurrentTabMetrics().map((metric, index) => (
          <MetricCard key={`metric-${index}-${metric.title}`} metric={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversations Chart */}
        <div className="bg-white border border-gray-100 rounded-lg p-6 conversations-chart">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-brand/10">
              <BarChart3 className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {activeTab === 'all' ? 'All Conversations' : `${CHANNELS[activeTab]?.displayName} Conversations`}
              </p>
              <p className="text-sm text-gray-500">Weekly overview</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getConversationData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CCFC01" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#CCFC01" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #f1f1f1',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#CCFC01"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Distribution - Only show for "All Channels" tab */}
        {activeTab === 'all' && (
          // <div className="bg-white border border-gray-100 rounded-lg p-6 channel-distribution">
          //   <div className="flex items-center gap-3 mb-6">
          //     <div className="p-2 rounded-lg bg-brand/10">
          //       <PieChart className="w-5 h-5 text-gray-900" />
          //     </div>
          //     <div>
          //       <p className="font-semibold text-gray-900">Channel Distribution</p>
          //       <p className="text-sm text-gray-500">Messages by platform</p>
          //     </div>
          //   </div>
          //   <div className="h-[300px] w-full">
          //     <ResponsiveContainer width="100%" height="100%">
          //       <RePieChart>
          //         <Pie
          //           data={channelData.filter(c => c.messages > 0)}
          //           cx="50%"
          //           cy="50%"
          //           labelLine={false}
          //           outerRadius={80}
          //           fill="#8884d8"
          //           dataKey="messages"
          //           nameKey="displayName"
          //           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          //         >
          //           {channelData.map((entry, index) => (
          //             <Cell key={`cell-${index}`} fill={entry.color} />
          //           ))}
          //         </Pie>
          //         <Tooltip
          //           formatter={(value, name, props) => {
          //             // Calculate total messages
          //             const total = channelData.reduce((sum, channel) => sum + channel.messages, 0);
          //             // Calculate percentage for this segment
          //             const percent = total > 0 ? (value / total) * 100 : 0;
          //             return [
          //               value,
          //               `${props.payload.displayName} (${percent.toFixed(0)}%)`
          //             ];
          //           }}
          //         />
          //         <Legend />
          //       </RePieChart>
          //     </ResponsiveContainer>
          //   </div>
          // </div>
          <div className="bg-white border border-gray-100 rounded-lg p-6 channel-distribution">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-brand/10">
                <BarChart3 className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Channel Distribution</p>
                <p className="text-sm text-gray-500">Messages & Leads by platform</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelData.filter(c => c.messages > 0 || c.leads > 0)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis
                    dataKey="displayName"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #f1f1f1',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    formatter={(value, name, props) => {
                      // For messages, show percentage of total messages
                      if (name === 'Messages') {
                        const totalMessages = channelData.reduce((sum, c) => sum + c.messages, 0);
                        const percent = totalMessages > 0 ? (value / totalMessages * 100).toFixed(1) : 0;
                        return [`${value} (${percent}%)`, name];
                      }
                      // For leads, show percentage of total leads
                      if (name === 'Leads') {
                        const totalLeads = channelData.reduce((sum, c) => sum + c.leads, 0);
                        const percent = totalLeads > 0 ? (value / totalLeads * 100).toFixed(1) : 0;
                        return [`${value} (${percent}%)`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="messages"
                    name="Messages"
                    fill="#CCFC01"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="leads"
                    name="Leads"
                    fill="#2D3436"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* For individual channel tabs, show lead conversion */}
        {activeTab !== 'all' && (
          <div className="bg-white border border-gray-100 rounded-lg p-6 lead-conversion">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-brand/10">
                <UserPlus className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Lead Conversion</p>
                <p className="text-sm text-gray-500">Messages to leads ratio</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Messages',
                      value: activeChannelData[0]?.messages || 0,
                      fill: CHANNELS[activeTab]?.color || '#CCFC01'
                    },
                    {
                      name: 'Leads',
                      value: activeChannelData[0]?.leads || 0,
                      fill: '#2D3436'
                    }
                  ]}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f1f1" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" nameKey="name">
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? CHANNELS[activeTab]?.color || '#CCFC01' : '#2D3436'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Channel Performance - Only show for "All Channels" tab */}
      {activeTab === 'all' && (
        <div className="bg-white border border-gray-100 rounded-lg channel-performance">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channelData.map((channel, index) => (
                <ChannelCard key={`channel-${index}-${channel.channelType}`} channel={channel} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}