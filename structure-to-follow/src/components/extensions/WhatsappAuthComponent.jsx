import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { metaAuthService, clientExtensionService } from "../../api";
import { whatsappService } from "../../api/services/meta";

export default function WhatsAppAuthComponent({
    platform,
    clientId,
    onAuthSuccess,
    onAuthFailure
}) {
    const [appId, setAppId] = useState(null);
    const [step, setStep] = useState("init");       // init | select | done
    const [numbers, setNumbers] = useState([]);
    const [selected, setSelected] = useState(null);

    // 1️⃣ Load your FB App ID
    useEffect(() => {
        whatsappService.getAppId().then((r) => setAppId(r.appId));
    }, []);

    // 2️⃣ Listen for the callback’s postMessage
    useEffect(() => {
        const handler = (e) => {
            if (
                e.origin === window.location.origin &&
                e.data.type === "WHATSAPP_AUTH_TOKEN"
            ) {
                exchange(e.data.token);
            }
            if (
                e.origin === window.location.origin &&
                e.data.type === "WHATSAPP_AUTH_ERROR"
            ) {
                onAuthFailure(e.data.error);
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    const connect = () => {
        const scopes = encodeURIComponent(
            "whatsapp_business_messaging,whatsapp_business_management,business_management"
        );
        const redirect = encodeURIComponent(
            `${window.location.origin}/whatsapp-auth-callback`
        );
        // const state = btoa(JSON.stringify({ clientId }));
        window.open(
            `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}` +
            `&redirect_uri=${redirect}` +
            `&scope=${scopes}` +
            `&response_type=token&state=${clientId}`,
            "_blank",
            "noopener"
        );
    };

    // 3️⃣ Exchange & fetch numbers
    const exchange = async (shortTok) => {
        try {
            const { longLivedToken } = await metaAuthService.exchangeToken({
                accessToken: shortTok,
            });
            const biz = await whatsappService.getBusinessWhatsApp(longLivedToken);
            if (!biz.success) throw new Error(biz.message);
            setNumbers(biz.phone_numbers || []);
            setStep("select");
            // stash for final
            sessionStorage.setItem("wa_token", longLivedToken);
        } catch (err) {
            onAuthFailure(err);
        }
    };

    // 4️⃣ Finalize
    const finish = async () => {
        try {
            const tok = sessionStorage.getItem("wa_token");
            await whatsappService.subscribeNumber(selected, tok);
            await clientExtensionService.createClientExtension({
                client_id: clientId,
                extension_name: "whatsapp",
                is_connected: true,
                connected_at: new Date().toISOString(),
                long_lived_token: tok,
                token_expires_at: new Date(
                    Date.now() + 60 * 24 * 60 * 60 * 1000
                ).toISOString(),
                metadata: { phone_number_id: selected },
            });
            setStep("done");
            onAuthSuccess({ phone_number_id: selected });
        } catch (err) {
            onAuthFailure(err);
        }
    };

    if (step === "init") {
        return (
            <div className="p-6 border border-gray-100 rounded-lg bg-gray-50 flex flex-col items-center justify-center">
                <div
                    className="p-3 rounded-lg mb-4"
                    style={{ backgroundColor: `${platform.color}20` }}
                >
                    <img src="/whatsapp-icon.svg" alt="" className="w-6 h-6" />
                </div>
                <h5 className="text-base font-medium text-gray-900 mb-1">
                    Connect to {platform.name}
                </h5>
                <p className="text-sm text-gray-500 text-center mb-4">
                    You'll be redirected to {platform.name} to complete the authorization process.
                </p>
                <Button
                    className="bg-brand text-gray-900 font-medium min-w-[200px]"
                    startContent={
                        <img
                            src="/whatsapp-icon.svg"
                            alt="WhatsApp icon"
                            className="w-4 h-4"
                        />
                    }
                    onPress={connect}
                    isDisabled={!appId}
                >
                    Connect Now
                </Button>
            </div>
        );
    }
    if (step === "select") {
        return (
            <div>
                <p className="mb-2">Select a WhatsApp number:</p>
                {numbers.map((n) => (
                    <label key={n.display_phone_number_id} className="block mb-1">
                        <input
                            type="radio"
                            name="wa"
                            onChange={() => setSelected(n.display_phone_number_id)}
                            className="mr-2"
                        />
                        {n.display_phone_number}
                    </label>
                ))}
                <Button
                    onPress={finish}
                    isDisabled={!selected}
                    className="mt-3 w-full"
                >
                    Finalize Connection
                </Button>
            </div>
        );
    }
    // done
    return <p>WhatsApp connected successfully 🎉</p>;
}
