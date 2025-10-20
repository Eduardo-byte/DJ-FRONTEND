import {
    ArrowDown,
    ArrowUp,
    Facebook,
    Globe,
    Instagram,
    MessageSquare,
    Send,
    Smartphone,
    Twitter,
} from "lucide-react";

// ReactSelect custom helpers
export const getChannelIcon = (channels, channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.icon || MessageSquare;
};

export const getChannelColor = (channels, channelId) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.color || '#CCFC01';
};

export const getStatusColor = (leadStatuses, status) => {
    const statusObj = leadStatuses.find((s) => s.key === (status || "new"));
    return statusObj?.color || "bg-gray-500";
};


// ----------------------------
// Channels & Statuses (keep all even if empty)
// ----------------------------

export const leadStatuses = [
    { key: "all", name: "All Statuses" },
    { key: "new", name: "New", color: "bg-blue-500" },
    { key: "in-progress", name: "In Progress", color: "bg-brand" },
    { key: "qualified", name: "Qualified", color: "bg-green-500" },
    { key: "negotiation", name: "Negotiation", color: "bg-purple-500" },
    { key: "lost", name: "Lost", color: "bg-red-500" },
];

export const channels = [
    { id: 'all', name: 'All Channels', icon: MessageSquare, color: '#728d00' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#728d00' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#728d00' },
    { id: 'whatsapp', name: 'Whatsapp', icon: MessageSquare, color: '#728d00' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: '#728d00' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#728d00' },
    { id: 'website', name: 'Website Chat', icon: Globe, color: '#728d00' },
    { id: 'sms', name: 'SMS', icon: Smartphone, color: '#728d00' }
];


export const sortOptions = [
    { key: 'newest', name: 'Newest First', icon: ArrowDown },
    { key: 'oldest', name: 'Oldest First', icon: ArrowUp },
    // { key: 'unread', name: 'Unread First', icon: MessageSquare },
    // { key: 'read', name: 'Read First', icon: MessageSquare },
    // { key: 'name', name: 'Name', icon: User }
];