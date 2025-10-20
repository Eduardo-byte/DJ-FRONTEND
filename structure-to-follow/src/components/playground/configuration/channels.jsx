// src/components/ChannelsConfig.jsx
import React, { useEffect, useState } from "react";
import { Accordion, AccordionItem, Button, Input } from "@heroui/react";
import {
    MessageSquare,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    Send as TelegramIcon,
    ClipboardIcon
} from "lucide-react";
import { ChannelForm } from "../reusableComponents/channelForm";
import {
    copyToClipboard,
    generateTelegramRefCode,
    normalizeTelegramRef,
    verifyTelegram
} from "../../telegramUtils/utils";
import { integrationService } from "../../../api";
import { toast } from "sonner";

const FB_EXT_ID = "9e9de118-8aa5-408a-960c-74074c66cd8e";
const IG_EXT_ID = "c32aeec7-50d7-4469-99a5-4235870d16a7";
const TG_EXT_ID = "3c375262-ff82-45b5-b72b-ec05c215e36f";
const WT_EXT_ID = "a2a83703-8c62-4216-b94d-9ecfdfc32438";

const ChannelsConfig = ({
    connectedExtensions,
    channelConfigs,
    facebookPages,
    instagramAccounts,
    whatsappAccounts,
    isLoadingPages,
    isLoadingAccounts,
    onConfigChange,
    setChatType,
    chatType,
    agent
}) => {
    const hasFacebook = connectedExtensions.some(ext => ext.extension_id === FB_EXT_ID);
    const hasInstagram = connectedExtensions.some(ext => ext.extension_id === IG_EXT_ID);
    const hasTelegram = connectedExtensions.some(ext => ext.extension_id === TG_EXT_ID);
    const hasWhatsapp = connectedExtensions.some(ext => ext.extension_id === WT_EXT_ID);

    const channels = ["widget"];
    if (hasFacebook) channels.push("facebook");
    if (hasInstagram) channels.push("instagram");
    if (hasTelegram) channels.push("telegram");
    if (hasWhatsapp) channels.push("whatsapp");

    // Telegram UI state
    const [telegramRef, setTelegramRef] = useState(channelConfigs.telegram.ref_code_telegram || "");
    const [isVerified, setIsVerified] = useState(channelConfigs.telegram.verified || false);
    const [telegramError, setTelegramError] = useState("");

    const handleGenerateTelegramCode = async () => {
        const code = await generateTelegramRefCode(agent);
        setTelegramRef(code);
        setIsVerified(false);
        onConfigChange({
            ...channelConfigs,
            telegram: { ...channelConfigs.telegram, ref_code_telegram: code, verified: false }
        });
    };


    const handleDisconnect = async () => {
        const agentIntegration = await integrationService.getIntegrationsByAgentId(agent.id)
        const telegramIntegration = agentIntegration.find(int => int.integration_type[0].type === "telegram");
        onConfigChange({
            ...channelConfigs,
            telegram: { status: false, channel: "", ref_code_telegram: "", verified: false }
        })
        await integrationService.deleteIntegration(telegramIntegration.integration_id);
        // reset UI state
        setIsVerified(false);
        setTelegramRef("");
        setTelegramError("");
    }

    // const handleCopyTelegramCode = () => navigator.clipboard.writeText(telegramRef);
    const handleCopyTelegramCode = () => {
        copyToClipboard(telegramRef, () => toast.success("refcode copied to clipboard"));
    };

    const handleVerifyTelegram = async () => {
        try {
            const cleaned = normalizeTelegramRef(telegramRef);
            const { verified, pageId, pageName, integrationId } = await verifyTelegram(cleaned);
            if (verified) {
                setIsVerified(true);
                onConfigChange({
                    ...channelConfigs,
                    telegram: { ...channelConfigs.telegram, verified: true, channelId: pageId, channel: pageName }
                });
                await integrationService.updateIntegration(integrationId, { status: true })
            } else throw new Error();
        } catch {
            setTelegramError("Verification failed — please try again.");
        }
    };

    return (
        <Accordion variant="bordered" className="bg-white border border-gray-100">
            {channels.map(chan => {
                let Icon, label, subtitle;
                switch (chan) {
                    case "widget":
                        Icon = MessageSquare; label = "Chat Widget"; subtitle = "Embedded chat widget"; break;
                    case "facebook":
                        Icon = FacebookIcon; label = "Facebook"; subtitle = "Facebook Messenger"; break;
                    case "instagram":
                        Icon = InstagramIcon; label = "Instagram"; subtitle = "Instagram DMs"; break;
                    case "telegram":
                        Icon = TelegramIcon; label = "Telegram"; subtitle = "Telegram channel"; break;
                    case 'whatsapp':
                        Icon = null; label = 'WhatsApp'; subtitle = 'WhatsApp channel'; break;
                }

                return (
                    <AccordionItem
                        key={chan}
                        aria-label={chan}
                        title={
                            <div className="flex items-center gap-3">
                                {chan === 'whatsapp' ? (
                                    <img
                                        src="/whatsapp-icon.svg"
                                        alt="WhatsApp"
                                        className="w-12 h-12 rounded-lg bg-brand/10 p-3 mb-2"
                                    />
                                ) : (
                                    <Icon className="w-12 h-12 rounded-lg bg-brand/10 p-3 mb-2" />
                                )}
                                <span className="text-lg font-semibold text-gray-900">{label}</span>
                            </div>
                        }
                        subtitle={subtitle}
                    >
                        <div className="px-4 py-2">
                            {chan === "telegram" ? (
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-gray-800 mb-3">
                                        Telegram Verification
                                    </h3>

                                    {!isVerified ? (
                                        <>
                                            {/* STEP 2: Generate & Copy Ref Code */}
                                            {!telegramRef && (
                                                <Button onClick={handleGenerateTelegramCode}>
                                                    Generate Verification Code
                                                </Button>
                                            )}
                                            {telegramRef && (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            Step 1: Invite the Bot
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                readOnly
                                                                value="@PoweredByOlivia_bot"
                                                                onClick={() =>
                                                                    copyToClipboard("@PoweredByOlivia_bot", () =>
                                                                        toast.success("Bot username copied!")
                                                                    )
                                                                }
                                                                classNames={{ input: "cursor-pointer" }}
                                                            />
                                                            <Button
                                                                onClick={() =>
                                                                    copyToClipboard("@PoweredByOlivia_bot", () =>
                                                                        toast.success("Bot username copied!")
                                                                    )
                                                                }
                                                                aria-label="Copy bot username"
                                                                className="bg-brand"
                                                            >
                                                                <ClipboardIcon className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Invite <strong>@PoweredByOlivia_bot</strong> as an admin to your
                                                            Telegram channel or group.
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            Step 2: Copy Your Ref Code
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                readOnly
                                                                value={telegramRef}
                                                                onClick={handleCopyTelegramCode}
                                                                classNames={{ input: "cursor-pointer" }}
                                                            />
                                                            <Button
                                                                onClick={handleCopyTelegramCode}
                                                                aria-label="Copy ref code"
                                                                className="bg-brand"
                                                            >
                                                                <ClipboardIcon className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            After inviting the bot, send this ref code to your Telegram
                                                            channel or group so we can link your agent.
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Step 3: Return here and click “Verify” to complete the connection.
                                                        </p>
                                                        <p className="text-xs text-red-500">
                                                            IMPORTANT: Only click “Save channels/changes” after you’ve successfully
                                                            verified Telegram or your connection may fail.
                                                        </p>
                                                    </div>
                                                </>
                                            )}

                                            {/* STEP 3: Verify */}
                                            <Button
                                                disabled={!telegramRef}
                                                onClick={handleVerifyTelegram}
                                                className="bg-brand"
                                            >
                                                Verify
                                            </Button>



                                            {isVerified && (
                                                <p className="text-sm text-green-600">
                                                    Telegram successfully verified!
                                                </p>
                                            )}
                                            {!isVerified && telegramError && (
                                                <p className="text-sm text-red-500 mt-1">{telegramError}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-green-700">
                                                Connected as{" "}
                                                <strong>
                                                    {channelConfigs.telegram.channel} (ID: {channelConfigs.telegram.channelId})
                                                </strong>
                                            </p>
                                            <Button variant="destructive" onClick={handleDisconnect}>
                                                Disconnect
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // <ChannelForm
                                //     agent={agent}
                                //     channelId={chan}
                                //     enabled={channelConfigs[chan].status}
                                //     onEnabledChange={val =>
                                //         onConfigChange({ ...channelConfigs, [chan]: { ...channelConfigs[chan], status: val } })
                                //     }
                                //     config={channelConfigs[chan]}
                                //     isLoading={chan === "facebook" ? isLoadingPages : isLoadingAccounts}
                                //     pagesOrAccounts={chan === "facebook" ? facebookPages : instagramAccounts}
                                //     onSelectPageOrAccount={id => {
                                //         const update = chan === "facebook"
                                //             ? { page_id: id, page_name: facebookPages.find(p => p.id === id)?.name }
                                //             : { account_id: id, account_name: instagramAccounts.find(a => a.id === id)?.username };
                                //         onConfigChange({ ...channelConfigs, [chan]: { ...channelConfigs[chan], ...update } });
                                //     }}
                                //     onAutoResponseChange={val =>
                                //         onConfigChange({ ...channelConfigs, [chan]: { ...channelConfigs[chan], auto_response: val } })
                                //     }
                                //     onNotificationEmailChange={email =>
                                //         onConfigChange({ ...channelConfigs, [chan]: { ...channelConfigs[chan], notification_email: email } })
                                //     }
                                //     onAvailabilityChange={val =>
                                //         onConfigChange({
                                //             ...channelConfigs,
                                //             [chan]: {
                                //                 ...channelConfigs[chan],
                                //                 availability: { ...channelConfigs[chan].availability, is_24_7: val }
                                //             }
                                //         })
                                //     }
                                //     onScheduleChange={(i, f, v) => {
                                //         const sched = [...channelConfigs[chan].availability.schedule];
                                //         sched[i] = { ...sched[i], [f]: v };
                                //         onConfigChange({
                                //             ...channelConfigs,
                                //             [chan]: {
                                //                 ...channelConfigs[chan],
                                //                 availability: { ...channelConfigs[chan].availability, schedule: sched }
                                //             }
                                //         });
                                //     }}
                                //     chatType={chatType}
                                //     setChatType={setChatType}
                                // />

                                <ChannelForm
                                    agent={agent}
                                    channelId={chan}
                                    enabled={channelConfigs[chan].status}
                                    onEnabledChange={val =>
                                        onConfigChange({
                                            ...channelConfigs,
                                            [chan]: { ...channelConfigs[chan], status: val }
                                        })
                                    }
                                    config={channelConfigs[chan]}
                                    isLoading={
                                        chan === "facebook" || chan === "whatsapp"
                                            ? isLoadingPages
                                            : isLoadingAccounts
                                    }
                                    pagesOrAccounts={
                                        chan === "facebook"
                                            ? facebookPages
                                            : chan === "instagram"
                                                ? instagramAccounts
                                                : whatsappAccounts
                                    }
                                    onSelectPageOrAccount={id => {
                                        let update = {};
                                        if (chan === "facebook") {
                                            update = {
                                                page_id: id,
                                                page_name: facebookPages.find(p => p.id === id)?.name
                                            };
                                        } else if (chan === "instagram") {
                                            update = {
                                                account_id: id,
                                                account_name: instagramAccounts.find(a => a.id === id)
                                                    ?.account_name
                                            };
                                        } else if (chan === "whatsapp") {
                                            const w = whatsappAccounts.find(w => w.id === String(id));
                                            update = {
                                                account_id: w?.account_id || "",
                                                phone_number: w?.id || "",
                                                waba_name: w?.waba_name || "",
                                                business_name: w?.business_name || "",
                                                phone_number_id: w?.phone_number_id || ""
                                            };
                                        }
                                        onConfigChange({
                                            ...channelConfigs,
                                            [chan]: { ...channelConfigs[chan], ...update }
                                        });
                                    }}
                                    onAutoResponseChange={val =>
                                        onConfigChange({
                                            ...channelConfigs,
                                            [chan]: { ...channelConfigs[chan], auto_response: val }
                                        })
                                    }
                                    onNotificationEmailChange={email =>
                                        onConfigChange({
                                            ...channelConfigs,
                                            [chan]: { ...channelConfigs[chan], notification_email: email }
                                        })
                                    }
                                    onAvailabilityChange={val =>
                                        onConfigChange({
                                            ...channelConfigs,
                                            [chan]: {
                                                ...channelConfigs[chan],
                                                availability: {
                                                    ...channelConfigs[chan].availability,
                                                    is_24_7: val
                                                }
                                            }
                                        })
                                    }
                                    onScheduleChange={(i, f, v) => {
                                        const sched = [...channelConfigs[chan].availability.schedule];
                                        sched[i] = { ...sched[i], [f]: v };
                                        onConfigChange({
                                            ...channelConfigs,
                                            [chan]: {
                                                ...channelConfigs[chan],
                                                availability: { ...channelConfigs[chan].availability, schedule: sched }
                                            }
                                        });
                                    }}
                                    chatType={chatType}
                                    setChatType={setChatType}
                                />

                            )}
                        </div>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
};

export default ChannelsConfig;
