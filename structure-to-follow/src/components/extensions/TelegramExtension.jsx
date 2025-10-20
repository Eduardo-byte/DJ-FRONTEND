import { useState, useEffect, useContext } from "react";
import {
    Button,
} from "@heroui/react";
import { Send, CheckCircle2, Info, Globe } from "lucide-react";
import { UserDataContext } from "../../context/UserDataContext";
import { clientExtensionService } from "../../api";

export default function TelegramExtension({ platform, onConnected }) {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const { loggedInUser, userData } = useContext(UserDataContext);


    const handleConnect = async () => {
        setLoading(true);
        try {
            const clientExtensions = await clientExtensionService.getClientExtensionsByClientId(userData.client_id);
            // Look for existing Telegram extension
            const existing = clientExtensions.find(
                (ce) => ce.extension_id === "3c375262-ff82-45b5-b72b-ec05c215e36f"
            );

            if (existing) {
                // Update the existing extension to connected
                await clientExtensionService.updateClientExtension(existing.client_extension_id, { is_connected: true, connected_at: new Date().toISOString(), });
            } else {
                // Create a new extension for Telegram
                const extensionData = {
                    client_id: userData.client_id,
                    extension_name: "telegram",
                    extension_id: "3c375262-ff82-45b5-b72b-ec05c215e36f",
                    is_connected: true,
                    connected_at: new Date().toISOString(),
                };
                await clientExtensionService.createClientExtension(extensionData);
            }

            setConnected(true);
            if (typeof onConnected === "function") {
                // re-fetch server state or just pass back the new list
                const updated = await clientExtensionService.getClientExtensionsByClientId(userData.client_id);
                onConnected(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                {!connected &&
                    <div className="space-y-4 font-semibold">
                        <p>{platform.description}</p>
                    </div>
                }
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-brand/10">
                            <CheckCircle2 className="w-5 h-5 text-gray-900" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">
                            {connected ? `Successfully Connected ${platform.name} with Olivia AI` : 'Ready to Connect'}
                        </h4>
                    </div>

                    <p className="text-sm text-gray-600">
                        {connected
                            ? `Your ${platform.name} is now connected! You can manage this integration from the Extensions page.`
                            : `You're all set to connect your ${platform.name} with Olivia AI.`}
                    </p>

                    <div className="p-6 border border-gray-100 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                        <div
                            className="p-3 rounded-lg mb-4"
                            style={{ backgroundColor: `${platform.color}20` }}
                        >
                            <Send className="w-8 h-8" style={{ color: platform.color }} />
                        </div>
                        <h5 className="text-base font-medium text-gray-900 mb-1 text-center">
                            {connected
                                ? `Successfully Connected ${platform.name} with Olivia AI`
                                : `Connect to ${platform.name}`}
                        </h5>
                        {/* <p className="text-sm text-gray-500 text-center mb-4">
                            {connected
                                ? `If your agent is not deployed, go to the Agents page, click the deploy icon and select the ${platform.name} channel, then follow the steps. If you already deployed your agent, go to the Playground tab and under Channels you should now see ${platform.name} available to deploy on your agent.`
                                : `Click the button below to complete the authorization process in order to connect ${platform.name}.`}
                        </p> */}
                        <p className="text-sm text-gray-500 text-center mb-4">
                            {connected
                                ? (
                                    <>
                                        You’re all set!
                                        <a href="/agents" className="underline">Go to Agents</a> to deploy (click the deploy icon <Globe className="inline w-4 h-4" /> and select {platform.name} channel),
                                        or click edit your agent  and navigate to  the tab Channels to start using Telegram.
                                    </>
                                )
                                : `Click below to authorize Olivia AI to connect your ${platform.name}.`}
                        </p>

                        <Button
                            className="bg-brand text-gray-900 font-medium min-w-[200px]"
                            startContent={<Send className="w-4 h-4" />}
                            onPress={handleConnect}
                            isLoading={loading}
                            isDisabled={connected || loading}
                        >
                            {connected ? 'Connected' : 'Connect Now'}
                        </Button>
                    </div>

                    <div className="p-4 bg-brand/10 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-gray-900 mt-0.5" />
                            <p className="text-xs text-gray-600">
                                You can disconnect this integration at any time from the Extensions page.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
