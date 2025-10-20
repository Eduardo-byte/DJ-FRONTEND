import { useState } from "react";
import { Button } from "@heroui/react";
import {
    Info,
    ArrowRight,
    ArrowLeft,
    Shield,
    Lock,
    CheckCircle2,
    Facebook,
} from "lucide-react";
import MetaAuthComponent from "./MetaAuthComponent";
import { useContext } from "react";
import { UserDataContext } from "../../context/UserDataContext";
import WhatsAppAuthComponent from "./WhatsappAuthComponent";

export default function WhatsappExtension({ platform, currentStep, onAuthSuccess, onAuthFailure }) {
    const { loggedInUser, userData } = useContext(UserDataContext);
    const [authSuccess, setAuthSuccess] = useState(false);

    const handleAuthSuccess = (response) => {
        setAuthSuccess(true);
        // Call the parent component's onAuthSuccess callback
        if (onAuthSuccess) {
            onAuthSuccess(response);
        }
    };

    const handleAuthFailure = (error) => {
        console.error("Whatsapp authentication failed:", error);
        // Call the parent component's onAuthFailure callback
        if (onAuthFailure) {
            onAuthFailure(error);
        }
    };

    return (
        <>
            {currentStep === 1 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-brand/10">
                            <Info className="w-5 h-5 text-gray-900" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">About this integration</h4>
                    </div>

                    <p className="text-sm text-gray-600">
                        Connecting your {platform.name} account will allow you to:
                    </p>

                    <div className="space-y-3">
                        {platform.features.map((feature) => (
                            <div key={feature.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <feature.icon className="w-5 h-5 text-gray-900" />
                                <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                            </div>
                        ))}
                    </div>

                    {platform.scopes && (
                        <div className="p-4 bg-brand/10 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-gray-900 mt-0.5" />
                                <div>
                                    <h5 className="text-sm font-medium text-gray-900 mb-1">Permissions Required</h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {platform.scopes.map((scope) => (
                                            <li key={scope} className="text-xs text-gray-600">{scope}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-brand/10">
                            <Lock className="w-5 h-5 text-gray-900" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">Authentication Process</h4>
                    </div>

                    <p className="text-sm text-gray-600">
                        To connect your {platform.name} account, you'll need to:
                    </p>

                    <ol className="space-y-4">
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">1</div>
                            <div>
                                <p className="text-sm text-gray-900 font-medium">Authorize Access</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    You'll be redirected to {platform.name} to authorize our application.
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">2</div>
                            <div>
                                <p className="text-sm text-gray-900 font-medium">Login (if needed)</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    If you're not already logged in, you'll need to sign in to your {platform.name} account.
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">3</div>
                            <div>
                                <p className="text-sm text-gray-900 font-medium">Review Permissions</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Review and approve the permissions our app is requesting.
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-medium text-gray-900">4</div>
                            <div>
                                <p className="text-sm text-gray-900 font-medium">Return to App</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    After authorization, you'll be redirected back to our application.
                                </p>
                            </div>
                        </li>
                    </ol>

                    <div className="p-4 bg-brand/10 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-gray-900 mt-0.5" />
                            <p className="text-xs text-gray-600">
                                We use secure OAuth 2.0 for authentication. Your credentials are never stored on our servers.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-brand/10">
                            <CheckCircle2 className="w-5 h-5 text-gray-900" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">Ready to Connect</h4>
                    </div>

                    <p className="text-sm text-gray-600">
                        You're all set to connect your {platform.name} account. Follow the steps below to complete the authorization.
                    </p>

                    {authSuccess ? (
                        <div className="p-6 border border-green-100 rounded-lg bg-green-50 flex flex-col items-center justify-center">
                            <div className="p-3 rounded-full bg-green-100 mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h5 className="text-base font-medium text-gray-900 mb-1">
                                Successfully Connected!
                            </h5>
                            <p className="text-sm text-gray-500 text-center">
                                Your {platform.name} account has been successfully connected.
                            </p>
                        </div>
                    ) : (
                        <WhatsAppAuthComponent
                            platform={platform}
                            clientId={userData?.client_id}
                            onAuthSuccess={handleAuthSuccess}
                            onAuthFailure={handleAuthFailure}
                        />
                    )}

                    <div className="p-4 bg-brand/10 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-gray-900 mt-0.5" />
                            <p className="text-xs text-gray-600">
                                You can disconnect this integration at any time from the Extensions page.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
