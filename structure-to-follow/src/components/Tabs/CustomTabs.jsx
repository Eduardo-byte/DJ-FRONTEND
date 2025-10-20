import React, { useState } from "react";
import { Avatar } from "@heroui/react";
import { Bot, CheckCheck, User2 } from "lucide-react";
import dayjs from "dayjs";
import ScrollableTabHeader from "./ScrollableTabHeader";


function CustomTabs({ leadMessages, selectedLead }) {
    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour12: true,
        }).format(new Date(dateString));
    };
    // Use a string value (e.g., "conversation0", "conversation1", etc.)
    const [selectedConversation, setSelectedConversation] = useState("conversation0");

    return (
        <div>
            {/* Scrollable Header */}
            {leadMessages.length > 1 ? (
                <ScrollableTabHeader>
                    {leadMessages.map((msg, idx) => {
                        const tabValue = `conversation${idx}`;
                        return (
                            <button
                                key={msg.message_id || idx}
                                onClick={() => setSelectedConversation(tabValue)}
                                className={`inline-block px-4 py-2 border-b-2 transition-colors duration-200 ${selectedConversation === tabValue ? "border-brand font-bold" : "border-transparent"
                                    }`}
                            >
                                {/* Conversation {idx + 1} */}
                                {formatDate(msg.created_at)}
                            </button>
                        );
                    })}
                </ScrollableTabHeader>
            ) : (
                null
            )}
            {/* Tab Content */}
            <div className="mt-4">
                {leadMessages.map((msg, idx) => {
                    const tabValue = `conversation${idx}`;
                    if (selectedConversation !== tabValue) return null;
                    return (
                        <div key={msg.message_id || idx}>
                            {typeof msg.content === "object" &&
                                Array.isArray(msg.content.messages) ? (
                                <div className="space-y-2">
                                    {msg.content.messages.map((m, i) => {
                                        const isUser = m.message_type?.toLowerCase() === "user";
                                        const isBot =
                                            m.message_type?.toLowerCase() === "bot" ||
                                            m.message_type?.toLowerCase() === "ai";
                                        return (
                                            <div
                                                key={m.message_id || i}
                                                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                                            >
                                                {/* Left avatar for non-user messages */}
                                                {!isUser && (
                                                    <div className="flex-shrink-0">
                                                        {isBot ? (
                                                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                                                                <Bot className="w-4 h-4 text-brand" />
                                                            </div>
                                                        ) : (
                                                            // <Avatar
                                                            //     src="https://i.pravatar.cc/150?u=agent"
                                                            //     className="w-8 h-8"
                                                            // />
                                                            (<User2
                                                                className="w-6 h-6 text-brand"
                                                            />)
                                                        )}
                                                    </div>
                                                )}

                                                {/* Message bubble */}
                                                <div className={`max-w-[70%] ${isUser ? "order-1" : "order-2"}`}>
                                                    <div
                                                        className={`rounded-2xl px-4 py-2 ${isUser
                                                            ? "bg-brand text-gray-900"
                                                            : isBot
                                                                ? "bg-gray-100 text-gray-900"
                                                                : "bg-gray-100 text-gray-900"
                                                            }`}
                                                    >
                                                        <p className="text-sm">{m.content}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            {(m.created_at)}
                                                        </span>
                                                        {m.status === "read" && (
                                                            <CheckCheck className="w-3 h-3 text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right avatar for user messages */}
                                                {/* {isUser && (
                                                    <div className="flex-shrink-0 order-2">
                                                        <Avatar src={selectedLead.avatar} className="w-8 h-8" />
                                                    </div>
                                                )} */}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <p className="text-sm">{String(msg.content)}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CustomTabs;
