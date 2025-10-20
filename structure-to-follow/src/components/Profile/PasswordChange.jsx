import React, { useState, useContext } from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider } from "@heroui/react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import { supabase } from "../../lib/supabase";
import useTourController from "../../Demo/utils/useTourController";
import Joyride from 'react-joyride';
import { accountSteps } from '../../Demo/Profile/account.demo'
import MyCustomTooltip from '../../Demo/CustomTooltip/MyCustomTooltip';
// Password Change Component (unchanged)
export function PasswordChange() {
    const { userData, isStaff, loggedInUser } = useContext(UserDataContext);
    let userEmail
    if (isStaff) {
        userEmail = loggedInUser?.email;
    } else {
        userEmail = userData?.email || userData?.contact_email;
    }

    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Check if new password and confirm password match
            if (newPassword !== confirmPassword) {
                toast.error("New passwords do not match!");
                return;
            }

            // 2. Attempt to sign in with current (old) password to verify it
            const signInResult = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: currentPassword,
            });

            if (signInResult.error) {
                toast.error("Current password is incorrect!");
                return;
            }

            // 3. Update the password in Supabase
            const updateResult = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateResult.error) {
                toast.error("Error updating password!");
            } else {
                toast.success("Password updated successfully!");
                // Clear input fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full border-1 border-black/10 border-solid" shadow="none">
            <CardHeader className="flex gap-3 password-change">
                <div className="p-2 rounded-lg bg-brand/10">
                    <Lock className="w-5 h-5 text-gray-900" />
                </div>
                <div className="flex flex-col">
                    <p className="text-md font-semibold text-gray-900">Change Password</p>
                    <p className="text-small text-gray-500">
                        Update your password to keep your account secure
                    </p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* This username input is because of browser errors thats why is display:none */}
                    <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        value={userEmail}
                        readOnly
                        style={{ display: "none" }}
                    />
                    <Input
                        autoComplete="current-password"
                        aria-label="Password"
                        type={showPasswords ? "text" : "password"}
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        endContent={
                            <button
                                type="button"
                                onClick={() => setShowPasswords((prev) => !prev)}
                            >
                                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        }
                        required
                    />
                    <Input
                        autoComplete="new-password"
                        type={showPasswords ? "text" : "password"}
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <Input
                        autoComplete="new-password"
                        type={showPasswords ? "text" : "password"}
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium"
                        isLoading={isLoading}
                    >
                        Update Password
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
}

// Change Login Email Component
export function EmailChange() {
    const [isLoading, setIsLoading] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Check if the new email and confirmation match
            if (newEmail !== confirmEmail) {
                toast.error("New emails do not match!");
                return;
            }

            // 2. Update the email in Supabase
            const updateResult = await supabase.auth.updateUser({
                email: newEmail,
            });

            if (updateResult.error) {
                toast.error("Error updating email!");
            } else {
                toast.success("A confirmation email has been sent. Please confirm your new email for the changes to take effect.");
                // Logout the user after updating the email
                await supabase.auth.signOut();
                // Clear input fields
                setNewEmail("");
                setConfirmEmail("");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update email");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Card className="w-full border-1 border-black/10 border-solid" shadow="none">
            <CardHeader className="flex gap-3 email-change">
                <div className="p-2 rounded-lg bg-brand/10">
                    <Mail className="w-5 h-5 text-gray-900" />
                </div>
                <div className="flex flex-col">
                    <p className="text-md font-semibold text-gray-900">Change Login Email</p>
                    <p className="text-small text-gray-500">
                        Update your login email address
                    </p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <form onSubmit={handleEmailChange} className="space-y-4">
                    {/* <Input
                        type={showPassword ? "text" : "password"}
                        label="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        endContent={
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        }
                        required
                    /> */}
                    <Input
                        type="email"
                        label="New Email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="email"
                        label="Confirm New Email"
                        value={confirmEmail}
                        onChange={(e) => setConfirmEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium"
                        isLoading={isLoading}
                    >
                        Update Email
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
}

// Main container component that displays both cards
export default function AccountSettings() {
    const { loggedInUser } = useContext(UserDataContext);
    // Use the custom hook for tour control
    const { runTour, handleJoyrideCallback } = useTourController("account", loggedInUser);
    return (
        <div className="space-y-6">
            {/* Joyride component at the top level */}
            <Joyride
                showProgress={true}
                disableCloseOnEsc={true}
                disableOverlayClose={true}
                steps={accountSteps}
                run={runTour}
                scrollOffset={300}
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
            <EmailChange />
            <PasswordChange />
        </div>
    );
}
