/**
 * @typedef {Object} DailyData
 * @property {string} date - Date in YYYY-MM-DD format
 * @property {string} dayOfWeek - Short day name (Mon, Tue, etc.)
 * @property {number} messageCount - Number of messages for this day
 */

/**
 * @typedef {Object} EngagementMetrics
 * @property {number} totalConversations - Total number of conversations
 * @property {number} engagedConversations - Number of conversations with user engagement
 * @property {number} engagementRate - Percentage of conversations with user engagement
 * @property {number} currentWeekEngagementRate - Engagement rate for the current week
 * @property {number} previousWeekEngagementRate - Engagement rate for the previous week
 * @property {number} engagementRateChange - Percentage change in engagement rate
 * @property {boolean} engagementTrend - True if engagement trend is up, false if down
 */

/**
 * @typedef {Object} MessageMetrics
 * @property {number} count - Total number of messages
 * @property {number} currentWeekCount - Number of messages in the current week
 * @property {number} previousWeekCount - Number of messages in the previous week
 * @property {number} percentageChange - Percentage change between current and previous week
 * @property {boolean} trend - True if trend is up, false if down
 * @property {EngagementMetrics} engagement - Engagement metrics for conversations
 * @property {DailyData[]} dailyData - Daily message counts for the last 7 days
 */

/**
 * @typedef {Object} ChannelMetric
 * @property {string} channelType - Channel identifier
 * @property {string} displayName - Human-readable channel name
 * @property {number} messageCount - Number of messages for this channel
 * @property {number} engagementRate - Engagement rate for this channel
 */

/**
 * @typedef {Object} LeadChannelBreakdown
 * @property {string} channel - Channel identifier
 * @property {string} displayName - Human-readable channel name
 * @property {number} totalLeads - Total number of leads for this channel
 * @property {number} qualificationRate - Percentage of leads that are qualified for this channel
 */

/**
 * @typedef {Object} LeadMetrics
 * @property {number} totalLeads - Total number of leads for this client
 * @property {number} qualifiedLeads - Number of qualified leads
 * @property {number} qualificationRate - Percentage of leads that are qualified
 * @property {LeadChannelBreakdown[]} channelBreakdown - Lead metrics broken down by channel
 */

/**
 * @typedef {Object} ChannelMetrics
 * @property {Object} totalMetrics - Overall metrics across all channels
 * @property {Object} totalMetrics.engagement - Overall engagement metrics
 * @property {Array<Object>} channelMetrics - Metrics for each individual channel
 * @property {string} channelMetrics[].channelType - Channel identifier
 * @property {string} channelMetrics[].displayName - Human-readable channel name
 * @property {Object} channelMetrics[].engagement - Channel-specific engagement metrics
 */

/**
 * @typedef {Object} ComprehensiveMetrics
 * @property {Object} messageMetrics - Message count metrics with daily breakdown
 * @property {number} messageMetrics.count - Total number of messages
 * @property {Object} messageMetrics.engagement - Engagement metrics for conversations
 * @property {number} messageMetrics.engagement.engagementRate - Percentage of conversations with user engagement
 * @property {ChannelMetrics} channelMetrics - Message metrics broken down by channel
 * @property {LeadMetrics} leadMetrics - Lead metrics with qualification rates
 */

/**
 * @typedef {Object} ChatMetrics
 * @property {string} chatId - The chat ID
 * @property {string} clientId - The client ID associated with this chat
 * @property {number} messageCount - Total number of messages in this chat
 * @property {number} currentWeekCount - Number of messages in the current week
 * @property {number} previousWeekCount - Number of messages in the previous week
 * @property {number} percentageChange - Percentage change between current and previous week
 * @property {ChannelMetric[]} channels - Channels used in this chat
 * @property {number} channelCount - Number of unique channels used in this chat
 * @property {EngagementMetrics} engagement - Engagement metrics for this chat
 * @property {LeadMetrics} leadMetrics - Lead metrics for the client associated with this chat
 */
