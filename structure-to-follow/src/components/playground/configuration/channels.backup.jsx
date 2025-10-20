import React from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { ChannelForm } from "../reusableComponents/channelForm";
import {
    MessageSquare,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
} from "lucide-react";

const FB_EXT_ID = "9e9de118-8aa5-408a-960c-74074c66cd8e";
const IG_EXT_ID = "c32aeec7-50d7-4469-99a5-4235870d16a7";

const ChannelsConfig = ({
    connectedExtensions,
    channelConfigs,
    facebookPages,
    instagramAccounts,
    isLoadingPages,
    isLoadingAccounts,
    onConfigChange,
    setChatType,
    chatType,
}) => {
    const hasFacebook = connectedExtensions.some(
        (ext) => ext.extension_id === FB_EXT_ID
    );
    const hasInstagram = connectedExtensions.some(
        (ext) => ext.extension_id === IG_EXT_ID
    );

    const channels = ["widget"];
    if (hasFacebook) channels.push("facebook");
    if (hasInstagram) channels.push("instagram");

    return (
        <Accordion variant="bordered" className="bg-white border border-gray-100">
            {channels.map((chan) => {
                // choose icon component
                let Icon;
                if (chan === "widget") Icon = MessageSquare;
                else if (chan === "facebook") Icon = FacebookIcon;
                else Icon = InstagramIcon;

                const label =
                    chan === "widget"
                        ? "Chat Widget"
                        : chan.charAt(0).toUpperCase() + chan.slice(1);

                const subtitle =
                    chan === "widget"
                        ? "Configure your embedded chat widget"
                        : `Configure your ${label} channel`;

                return (
                    <AccordionItem
                        key={chan}
                        aria-label={chan}
                        title={
                            <div className="flex items-center gap-3">
                                <Icon className="w-12 h-12 rounded-lg bg-brand/10 p-3 mb-2" />
                                <span className="text-lg font-semibold text-gray-900">
                                    {label}
                                </span>
                            </div>
                        }
                        subtitle={subtitle}
                    >
                        <div className="px-4 py-2">
                            <ChannelForm
                                channelId={chan}
                                enabled={channelConfigs[chan].status}
                                onEnabledChange={(val) =>
                                    onConfigChange({
                                        ...channelConfigs,
                                        [chan]: { ...channelConfigs[chan], status: val },
                                    })
                                }
                                config={channelConfigs[chan]}
                                isLoading={
                                    chan === "facebook"
                                        ? isLoadingPages
                                        : chan === "instagram"
                                            ? isLoadingAccounts
                                            : false
                                }
                                pagesOrAccounts={
                                    chan === "facebook"
                                        ? facebookPages
                                        : chan === "instagram"
                                            ? instagramAccounts
                                            : []
                                }
                                onSelectPageOrAccount={(id) =>
                                    onConfigChange({
                                        ...channelConfigs,
                                        [chan]: {
                                            ...channelConfigs[chan],
                                            ...(
                                                chan === "facebook"
                                                    ? {
                                                        page_id: id,
                                                        page_name: facebookPages.find((p) => p.id === id)
                                                            ?.name,
                                                    }
                                                    : chan === "instagram"
                                                        ? {
                                                            account_id: id,
                                                            account_name: instagramAccounts.find(
                                                                (a) => a.id === id
                                                            )?.account_name,
                                                        }
                                                        : {}
                                            ),
                                        },
                                    })
                                }
                                onAutoResponseChange={(val) =>
                                    onConfigChange({
                                        ...channelConfigs,
                                        [chan]: {
                                            ...channelConfigs[chan],
                                            auto_response: val,
                                        },
                                    })
                                }
                                onNotificationEmailChange={(email) =>
                                    onConfigChange({
                                        ...channelConfigs,
                                        [chan]: {
                                            ...channelConfigs[chan],
                                            notification_email: email,
                                        },
                                    })
                                }
                                onAvailabilityChange={(val) =>
                                    onConfigChange({
                                        ...channelConfigs,
                                        [chan]: {
                                            ...channelConfigs[chan],
                                            availability: {
                                                ...channelConfigs[chan].availability,
                                                is_24_7: val,
                                            },
                                        },
                                    })
                                }
                                onScheduleChange={(index, field, value) => {
                                    const sched = [
                                        ...channelConfigs[chan].availability.schedule,
                                    ];
                                    sched[index] = { ...sched[index], [field]: value };
                                    onConfigChange({
                                        ...channelConfigs,
                                        [chan]: {
                                            ...channelConfigs[chan],
                                            availability: {
                                                ...channelConfigs[chan].availability,
                                                schedule: sched,
                                            },
                                        },
                                    });
                                }}
                                chatType={chatType}
                                setChatType={setChatType}
                            />
                        </div>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
};

export default ChannelsConfig;
