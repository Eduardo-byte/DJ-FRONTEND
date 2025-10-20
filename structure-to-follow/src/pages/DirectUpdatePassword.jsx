import { useFormik } from "formik";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { staffService } from "../api";
import { Button, Card, CardBody, CardHeader, Divider, Input } from "@heroui/react";

function DirectUpdatePassword() {
    const [isVisible, setIsVisible] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get URL parameters
    const email = searchParams.get("email");

    const toggleVisibility = () => setIsVisible(!isVisible);

    const formik = useFormik({
        initialValues: {
            old_password: "",
            new_password: "",
            confirm_password: "",
        },
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // First verify the old password
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: oldPassword,
                });

                if (signInError) {
                    toast.error("Current password is incorrect!");
                    setSubmitting(false);
                    return;
                }

                // Check if new passwords match
                if (newPassword !== confirmPassword) {
                    toast.error(
                        "New password does not match with the confirmed password! Please try again"
                    );
                    setSubmitting(false);
                    return;
                }

                // Update the password
                const updateResult = await supabase.auth.updateUser({
                    password: newPassword,
                });

                if (updateResult.error) {
                    console.error("Error:", updateResult.error.message);
                    console.error("Error Details:", updateResult.error);
                    toast.error(`Error updating password: ${updateResult.error.message}`);
                } else {
                    // Get user by email
                    const staffData = await staffService.fetchStaffByEmail(email)

                    if (staffData && staffData.length > 0) {
                        await staffService.updateStaffInfo(staffData[0].staff_id, { account_status: "active" })
                    }
                    toast.success("Password successfully updated!");
                    navigate("/login");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("An error occurred while updating the password");
            }

            setSubmitting(false);
        },
    });

    return (
        <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <img
                        className="w-[80px] mx-auto mb-4"
                        src="Olivia-ai-LOGO.png"
                        alt="Olivia AI Network"
                    />
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Update Password
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Please enter your current password and new password to update.
                    </p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-8">
                    {/* Current Password */}
                    <Input
                        id="old_password"
                        name="old_password"
                        type={isVisible ? "text" : "password"}
                        label="Current Password"
                        labelPlacement="outside"
                        placeholder="Enter current password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        endContent={
                            <button
                                type="button"
                                className="focus:outline-none"
                                onClick={toggleVisibility}
                            >
                                {isVisible ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                            </button>
                        }
                        isDisabled={formik.isSubmitting}
                        autoComplete="current-password"
                        classNames={{
                            input: "transition-all duration-250",
                            inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none",
                        }}
                        required
                    />

                    {/* New Password */}
                    <Input
                        id="new_password"
                        name="new_password"
                        type={isVisible ? "text" : "password"}
                        label="New Password"
                        labelPlacement="outside"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        endContent={
                            <button
                                type="button"
                                className="focus:outline-none"
                                onClick={toggleVisibility}
                            >
                                {isVisible ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                            </button>
                        }
                        isDisabled={formik.isSubmitting}
                        autoComplete="new-password"
                        classNames={{
                            input: "transition-all duration-250",
                            inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none",
                        }}
                        required
                    />

                    {/* Confirm Password */}
                    <Input
                        id="confirm_password"
                        name="confirm_password"
                        type={isVisible ? "text" : "password"}
                        label="Confirm Password"
                        labelPlacement="outside"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isDisabled={formik.isSubmitting}
                        autoComplete="new-password"
                        classNames={{
                            input: "transition-all duration-250",
                            inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none",
                        }}
                        required
                    />

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
                        endContent={<ArrowRight className="w-4 h-4" />}
                        isLoading={formik.isSubmitting}
                        size="lg"
                    >
                        Update Password
                    </Button>
                </form>
            </div>
        </div>
    );


}

export default DirectUpdatePassword;
