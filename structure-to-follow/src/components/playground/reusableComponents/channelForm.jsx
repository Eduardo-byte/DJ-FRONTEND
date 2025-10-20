import React, { useContext, useEffect, useState } from "react";
import { Input, Switch, RadioGroup, Button } from "@heroui/react";
import {
    MessageSquare as ChatIcon,
    Check,
    Copy,
    ExternalLink,
    Info,
} from "lucide-react";
import { CustomRadio } from "../../DeploymentWizard";
import { UserDataContext } from "../../../context/UserDataContext";

export const ChannelForm = ({
    agent,
    channelId,
    enabled,
    onEnabledChange,
    config,
    isLoading,
    pagesOrAccounts,
    onSelectPageOrAccount,
    onAutoResponseChange,
    onNotificationEmailChange,
    onAvailabilityChange,
    onScheduleChange,
    chatType,
    setChatType,
}) => {
    const [copied, setCopied] = useState(false);

    // convenience flags
    const isFacebook = channelId === "facebook";
    const isInstagram = channelId === "instagram";
    const isChatWidget = channelId === "widget";
    const isWhatsapp = channelId === "whatsapp";
    const { userData, loggedInUser } = useContext(UserDataContext);

    const title = isChatWidget
        ? "Chat Widget Settings"
        : isFacebook
            ? "Facebook Messenger Settings"
            : isInstagram
                ? "Instagram Settings"
                : "WhatsApp Settings";

    const selectLabel = isFacebook
        ? "Select Facebook Page"
        : isInstagram
            ? "Select Instagram Account"
            : "Select WhatsApp Number";

    const getEmbedCode = (clientId, agentId) => {
        if (userData.client_migration === "v1") {
            return `<script
                    type="module"
                    src="https://clarity-ai.onrender.com/static/js/chat-widget-life.js?clientId=${clientId}&chatId=${agentId}"></script>`;
        } else if (userData.client_migration === "v2") {
            return `<script
                    type="module"
                    src="https://chat.olivianetwork.ai/static/js/chat-widget-life.js?clientId=${clientId}&chatId=${agentId}"></script>`;
        } else {
            // fallback or error
            console.warn("Unknown client migration version:", userData.client_migration);
            return "";
        }
    };


    // const getEmbedCode = (clientId, agent_id) =>
    //     `<script type="module" src="https://clarity-ai.onrender.com/static/js/chat-widget-life.js?clientId=${clientId}&chatId=${agent_id}"></script>`;

    return (
        <div className="space-y-6">
            {/* Title */}
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>

            {/* Enable / Disable */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">
                        {isChatWidget
                            ? "Enable Chat Widget"
                            : isFacebook
                                ? "Enable Facebook Channel"
                                : isInstagram
                                    ? "Enable Instagram Channel"
                                    : "Enable WhatsApp Channel"}
                    </p>
                    <p className="text-xs text-gray-500">Turn this channel on or off</p>
                </div>
                <Switch isSelected={enabled} onValueChange={onEnabledChange} />
            </div>

            <hr className="my-4" />

            {enabled && (
                <>
                    {/* === Chat Widget Settings === */}
                    {isChatWidget && (
                        <>
                            <div className="space-y-4">
                                <div className="flex justify-start items-center gap-4 mt-4">
                                    <RadioGroup
                                        defaultValue={chatType}
                                        orientation="horizontal"
                                        className="flex flex-row"
                                        onChange={(e) => setChatType(e.target.value)}
                                    >
                                        <CustomRadio value="classic" img_path="/chat-widget.svg">
                                            <p>Classic Widget</p>
                                        </CustomRadio>
                                        <CustomRadio value="pop-up" img_path="/pop-up-widget.svg">
                                            <p>Pop-up Widget</p>
                                        </CustomRadio>
                                    </RadioGroup>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ChatIcon className="w-5 h-5 text-gray-600" />
                                    <h4 className="text-md font-medium text-gray-800">
                                        Widget Installation
                                    </h4>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm font-medium text-gray-700">Embed Code</p>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="flex items-center gap-1"
                                            onPress={() => {
                                                navigator.clipboard.writeText(
                                                    getEmbedCode(agent.clientId, agent.id)
                                                );
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span className="text-green-500">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span>Copy Code</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded font-mono text-sm overflow-x-auto code">
                                        <code>{getEmbedCode(agent.clientId, agent.id)}</code>
                                    </div>
                                    <div className="mt-3 text-sm text-gray-600 flex items-center gap-1">
                                        <Info className="w-4 h-4" />
                                        <span>
                                            For detailed installation instructions, visit the{" "}
                                            <span
                                                className="text-brand-dark underline cursor-pointer"
                                                onClick={() => {
                                                    // replace with your own navigation logic
                                                    window.location.href = "/integrations";
                                                }}
                                            >
                                                Integrations page
                                            </span>
                                            <ExternalLink className="w-3 h-3 inline" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* === WhatsApp Settings === */}
                    {isWhatsapp && (
                        <>
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Phone number selector */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {selectLabel}
                                        </label>
                                        <select
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            // value={config.id ? config.id : ""}
                                            value={config.phone_number || ""}
                                            onChange={(e) => { onSelectPageOrAccount(e.target.value) }}
                                        >
                                            <option value="" disabled>
                                                Select a whatsapp account
                                            </option>
                                            {pagesOrAccounts.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                    disabled={item.usedByOther}
                                                >
                                                    {item.waba_name} – {item.id}
                                                    {item.usedByThis && " (In use by this agent)"}
                                                    {item.usedByOther && " (In use by another agent)"}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500">
                                            The WhatsApp Business number your agent will use.
                                        </p>
                                    </div>

                                    {/* Notification email */}
                                    <Input
                                        label="Notification Email"
                                        type="email"
                                        placeholder="notifications@example.com"
                                        value={config.notification_email}
                                        onChange={(e) =>
                                            onNotificationEmailChange(e.target.value)
                                        }
                                        description="Email to receive notifications about new messages"
                                    />

                                    {/* Availability schedule */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="text-base font-semibold text-gray-800 mb-3">
                                            Agent Availability
                                        </h4>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Available 24/7
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Agent will respond at all times
                                                </p>
                                            </div>
                                            <Switch
                                                isSelected={config.availability.is_24_7}
                                                onValueChange={onAvailabilityChange}
                                            />
                                        </div>

                                        {!config.availability.is_24_7 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Custom Schedule
                                                </p>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Set specific hours when the agent will be active
                                                </p>

                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {[
                                                                    "Day",
                                                                    "Active",
                                                                    "Start Time",
                                                                    "End Time",
                                                                ].map((h) => (
                                                                    <th
                                                                        key={h}
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                    >
                                                                        {h}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {config.availability.schedule.map((day, idx) => (
                                                                <tr key={day.day}>
                                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                                        {day.day}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        <Switch
                                                                            size="sm"
                                                                            isSelected={day.enabled}
                                                                            onValueChange={(val) =>
                                                                                onScheduleChange(idx, "enabled", val)
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        <Input
                                                                            type="time"
                                                                            size="sm"
                                                                            value={day.start_time}
                                                                            onChange={(e) =>
                                                                                onScheduleChange(
                                                                                    idx,
                                                                                    "start_time",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            disabled={!day.enabled}
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        <Input
                                                                            type="time"
                                                                            size="sm"
                                                                            value={day.end_time}
                                                                            onChange={(e) =>
                                                                                onScheduleChange(
                                                                                    idx,
                                                                                    "end_time",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            disabled={!day.enabled}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* === Facebook / Instagram Settings === */}
                    {!isChatWidget && !isWhatsapp && (
                        <>
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Page/Account selector */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            {selectLabel}
                                        </label>
                                        <select
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                            value={
                                                isFacebook ? config.page_id : config.account_id
                                            }
                                            onChange={(e) => onSelectPageOrAccount(e.target.value)}
                                        >
                                            <option value="" disabled>
                                                {`Select a ${isFacebook ? "page" : "account"
                                                    }`}
                                            </option>
                                            {pagesOrAccounts.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                    disabled={item.usedByOther}
                                                >
                                                    {isFacebook ? item.name : item.pageName}
                                                    {item.usedByThis && " (In use by this agent)"}
                                                    {item.usedByOther &&
                                                        " (In use by another agent)"}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500">
                                            {isFacebook
                                                ? "The Facebook page where your agent will respond to messages."
                                                : "The Instagram Business account where your agent will respond to messages."}
                                        </p>
                                    </div>

                                    {/* Notification email */}
                                    <Input
                                        label="Notification Email"
                                        type="email"
                                        placeholder="notifications@example.com"
                                        value={config.notification_email}
                                        onChange={(e) =>
                                            onNotificationEmailChange(e.target.value)
                                        }
                                        description="Email to receive notifications about new messages"
                                    />

                                    {/* Availability schedule */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <h4 className="text-base font-semibold text-gray-800 mb-3">
                                            Agent Availability
                                        </h4>

                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Available 24/7
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Agent will respond at all times
                                                </p>
                                            </div>
                                            <Switch
                                                isSelected={config.availability.is_24_7}
                                                onValueChange={onAvailabilityChange}
                                            />
                                        </div>

                                        {!config.availability.is_24_7 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Custom Schedule
                                                </p>
                                                <p className="text-xs text-gray-500 mb-3">
                                                    Set specific hours when the agent will be active
                                                </p>

                                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {[
                                                                    "Day",
                                                                    "Active",
                                                                    "Start Time",
                                                                    "End Time",
                                                                ].map((h) => (
                                                                    <th
                                                                        key={h}
                                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                                    >
                                                                        {h}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {config.availability.schedule.map((day, idx) => (
                                                                <tr key={day.day}>
                                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                                        {day.day}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        <Switch
                                                                            size="sm"
                                                                            isSelected={day.enabled}
                                                                            onValueChange={(val) =>
                                                                                onScheduleChange(idx, "enabled", val)
                                                                            }
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        <Input
                                                                            type="time"
                                                                            size="sm"
                                                                            value={day.start_time}
                                                                            onChange={(e) =>
                                                                                onScheduleChange(
                                                                                    idx,
                                                                                    "start_time",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            disabled={!day.enabled}
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-500">
                                                                        <Input
                                                                            type="time"
                                                                            size="sm"
                                                                            value={day.end_time}
                                                                            onChange={(e) =>
                                                                                onScheduleChange(
                                                                                    idx,
                                                                                    "end_time",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            disabled={!day.enabled}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )
            }
        </div >
    );
};

export default ChannelForm;
