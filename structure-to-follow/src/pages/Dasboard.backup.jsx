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
    Zap
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

export default function Dashboard() {
    const navigate = useNavigate()
    const { userData, loggedInUser, isStaff } = useContext(UserDataContext)
    const { user } = useAuth()
    const [showPromo, setShowPromo] = useState(true)
    const [metricsData, setMetricsData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
    const [fadeState, setFadeState] = useState('in') // 'in' or 'out'
    const promoIntervalRef = useRef(null)


    // Use the custom hook for tour control
    const { runTour, handleJoyrideCallback } = useTourController("dashboard", loggedInUser);

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
        // console.log("isStaff:", isStaff);

        const fetchMetrics = async () => {
            if (!userData?.client_id) {
                setLoading(false)
                return
            }
            if (isStaff) {
                console.log("userData", userData);
                console.log("logged in user:", loggedInUser);
                if (loggedInUser.account_status == "inactive") {
                    try {
                        await staffService.updateStaffInfo(loggedInUser.staff_id, { account_status: "active" });
                    } catch (error) {
                        console.log("Error updating Staff: ", error);
                    }
                }
            }

            try {
                const data = await metricsService.getComprehensiveMetricsByClientId(userData.client_id)
                console.log("metrics: ", data)
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

    // Use real data for conversation chart if available
    const conversationData = metricsData ?
        metricsData.messageMetrics.dailyData.map(day => ({
            name: day.dayOfWeek,
            value: day.messageCount
        })) :
        [
            { name: 'Mon', value: 4000 },
            { name: 'Tue', value: 3000 },
            { name: 'Wed', value: 2000 },
            { name: 'Thu', value: 2780 },
            { name: 'Fri', value: 1890 },
            { name: 'Sat', value: 2390 },
            { name: 'Sun', value: 3490 }
        ]
    //console.log("metricsData:", metricsData);
    // For channel data, we'll use the real channel if available, otherwise use mock data
    const channelData = metricsData ?
        [
            {
                name: metricsData?.channelMetrics?.channelMetrics[0]?.displayName,
                value: metricsData?.channelMetrics?.channelMetrics[0]?.count,
                leads: metricsData?.leadMetrics?.totalLeads,
                color: '#CCFC01',
                icon: Globe
            }
        ] :
        [
            { name: 'Facebook', value: 400, leads: 120, color: '#1877F2', icon: Facebook },
            { name: 'Instagram', value: 300, leads: 85, color: '#E4405F', icon: Instagram },
            { name: 'Twitter', value: 300, leads: 65, color: '#1DA1F2', icon: Twitter },
            { name: 'Telegram', value: 200, leads: 45, color: '#0088cc', icon: Send },
            { name: 'Website Chat', value: 350, leads: 95, color: '#CCFC01', icon: Globe }
        ]

    // Website metrics with real data
    const websiteMetrics = metricsData ?
        [
            {
                title: 'Total Messages',
                value: metricsData.messageMetrics.count.toLocaleString(),
                change: `${metricsData.messageMetrics.percentageChange > 0 ? '+' : ''}${metricsData.messageMetrics.percentageChange.toFixed(1)}%`,
                isPositive: metricsData.messageMetrics.trend,
                icon: Globe
            },
            {
                title: 'Engaged Conversations',
                value: metricsData.messageMetrics.engagement.engagedConversations.toLocaleString(),
                change: `${metricsData.messageMetrics.engagement.engagementRateChange > 0 ? '+' : ''}${metricsData.messageMetrics.engagement.engagementRateChange.toFixed(1)}%`,
                isPositive: metricsData.messageMetrics.engagement.engagementTrend,
                icon: MessagesSquare
            },
            {
                title: 'Conversion Rate',
                value: `${(metricsData.leadMetrics.totalLeads / metricsData.messageMetrics.count * 100).toFixed(1)}%`,
                change: `${metricsData.leadMetrics.percentageChange > 0 ? '+' : ''}${metricsData.leadMetrics.percentageChange.toFixed(1)}%`,
                isPositive: metricsData.leadMetrics.trend,
                icon: UserPlus
            },
            {
                title: 'Current Week Messages',
                value: metricsData.messageMetrics.currentWeekCount.toLocaleString(),
                change: `${metricsData.messageMetrics.percentageChange > 0 ? '+' : ''}${metricsData.messageMetrics.percentageChange.toFixed(1)}%`,
                isPositive: metricsData.messageMetrics.trend,
                icon: Activity
            }
        ] :
        [
            {
                title: 'Total Visitors',
                value: '12,345',
                change: '+8.5%',
                isPositive: true,
                icon: Globe
            },
            {
                title: 'Chat Interactions',
                value: '4,567',
                change: '+15.2%',
                isPositive: true,
                icon: MessagesSquare
            },
            {
                title: 'Conversion Rate',
                value: '3.8%',
                change: '+0.5%',
                isPositive: true,
                icon: UserPlus
            },
            {
                title: 'Avg. Session',
                value: '4.2m',
                change: '+1.3%',
                isPositive: true,
                icon: Clock
            }
        ]

    // Main metrics with real data
    const metrics = metricsData ?
        [
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
        ] :
        [
            {
                title: 'Total Conversations',
                value: '2,345',
                change: '+12.5%',
                isPositive: true,
                icon: MessageSquare
            },
            {
                title: 'Active Users',
                value: '1,234',
                change: '+5.2%',
                isPositive: true,
                icon: Users
            },
            {
                title: 'Avg. Response Time',
                value: '2.5m',
                change: '-8.3%',
                isPositive: true,
                icon: Clock
            },
            {
                title: 'Engagement Rate',
                value: '85%',
                change: '+3.7%',
                isPositive: true,
                icon: Activity
            }
        ]


    // This function will convert a title like
    // "Total Conversations" --> "total-conversations"
    function getMetricClassName(title) {
        // remove any non-alphanumeric characters if needed
        return title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '');
    }


    const MetricCard = ({ metric }) => {
        // Generate a class name based on the metric’s title
        const metricClass = getMetricClassName(metric.title);

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
                    <span className={`text-sm font-medium ${metric.isPositive ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {metric.change}
                    </span>
                    <span className="text-sm text-gray-400">vs last week</span>
                </div>
            </div>
        )
    }



    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading metrics...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Promotional Banner */}
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

            {/* Joyride component at the top level */}
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
                <p className="text-sm text-gray-500 mt-1">Overview of your messaging metrics</p>
            </div>

            {/* Tabs for different metric views */}
            <Tabs
                aria-label="Metric categories"
                classNames={{
                    tabList: "gap-4 p-0",
                    cursor: "bg-brand",
                    tab: "max-w-fit px-0 h-10",
                    tabContent: "group-data-[selected=true]:text-gray-900 px-2",
                }}
                variant="underlined"
            >
                <Tab key="all" title="All Channels" className='introduction'>
                    <div className="mt-6 space-y-8">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {metrics.map((metric, index) => (
                                <MetricCard key={`metric-${index}-${metric.title}`} metric={metric} />
                            ))}
                        </div>
                    </div>
                </Tab>
                <Tab key="website" title="Website Chat">
                    <div className="mt-6 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {websiteMetrics.map((metric, index) => (
                                <MetricCard key={`website-metric-${index}-${metric.title}`} metric={metric} />
                            ))}
                        </div>
                    </div>
                </Tab>
            </Tabs>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Conversations Chart */}
                <div className="bg-white border border-gray-100 rounded-lg p-6 conversations-chart">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-brand/10">
                            <BarChart3 className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Conversations</p>
                            <p className="text-sm text-gray-500">Weekly overview</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={conversationData}
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

                {/* Channel Distribution */}
                <div className="bg-white border border-gray-100 rounded-lg p-6 channel-distribution">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-brand/10">
                            <PieChart className="w-5 h-5 text-gray-900" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Channel Distribution</p>
                            <p className="text-sm text-gray-500">Messages & Leads by platform</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={channelData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
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
                                <Legend />
                                <Bar dataKey="value" name="Messages" fill="#CCFC01" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="leads" name="Leads" fill="#2D3436" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Chatbot Creation Card */}
            {/* <div className="bg-white border-2 border-dashed border-brand rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand">
                  <Bot className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Create Your First Chatbot</h3>
              </div>
              <p className="text-gray-600">
                Automate your customer service with AI-powered chatbots. Handle routine inquiries, qualify leads, and provide 24/7 support.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand" />
                  <span className="text-sm text-gray-600">Quick setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand" />
                  <span className="text-sm text-gray-600">Multi-channel</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand" />
                  <span className="text-sm text-gray-600">24/7 Support</span>
                </div>
              </div>
              <Button
                className="bg-brand text-gray-900 font-medium"
                radius="full"
                endContent={<ArrowRight className="w-4 h-4" />}
              >
                Create Chatbot
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-transparent rounded-lg" />
                <img 
                  src="/chatbot-illustration.svg" 
                  alt="Chatbot illustration" 
                  className="w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div> */}

            {/* Channel Details */}
            <div className="bg-white border border-gray-100 rounded-lg channel-performance">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {channelData.map((channel, index) => (
                            <div key={`channel-${index}-${channel.name}`} className="p-4 border border-gray-100 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${channel.color}20` }}>
                                        <channel.icon className="w-5 h-5" style={{ color: channel.color }} />
                                    </div>
                                    <h4 className="font-semibold text-gray-900">{channel.name}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Messages</p>
                                        <p className="text-lg font-semibold text-gray-900">{channel.value || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Leads</p>
                                        <p className="text-lg font-semibold text-gray-900">{channel.leads}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}
