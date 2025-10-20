import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    useDisclosure,
} from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFormik } from "formik";
import PropTypes from "prop-types";
import axios from "axios";
import { supabase_v2 } from "../../lib/supabaseClient2";
import { staffService } from "../../api/services/staff.service";

function generateSecurePassword(length = 18) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "@#$%";

    const allChars = lowercase + uppercase + numbers + symbols;
    let password = "";

    // Ensure the password contains at least one character of each type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Fill the rest of the password length with random characters from all types
    for (let i = 4; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to ensure randomness
    password = password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

    return `tp${password}`;
}

function SetStaffPassword({ staff, isStaff }) {
    // console.log("STAFF: ", staff);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const formik = useFormik({
        initialValues: {
            password: "",
        },
        validate: (values) => {
            const errors = {};
            if (!values.password) {
                errors.password = "Password is required";
            } else if (values.password.length < 8) {
                errors.password = "Password must be at least 8 characters";
            }
            return errors;
        },
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // Validate that the authenticated_id is a valid UUID
                const isValidUUID = (id) =>
                    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
                        id
                    );

                if (!isValidUUID(staff.authenticated_id)) {
                    toast.error("Invalid user ID. Unable to update password.");
                    setSubmitting(false);
                    return;
                }

                // Use the authenticated_id as the user_id
                const updateResult = await supabase_v2.auth.admin.updateUserById(
                    staff.authenticated_id,
                    { password: values.password }
                );

                if (updateResult.error) {
                    throw updateResult.error;
                }

                toast.success("Password successfully updated!");

                // Optionally update staff information
                await staffService.updateStaffInfo(
                    staff.staff_id,
                    { account_status: "active" },
                    import.meta.env.VITE_API_URL,
                    import.meta.env.VITE_API_URL_KEY
                );

                // Send a welcome email with the new password
                const emailPayload = {
                    recipient_email: staff.email,
                    temporary_password: values.password,
                };

                await axios.post(
                    `${import.meta.env.VITE_API_URL}/send-welcome-email`,
                    emailPayload,
                    {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    }
                );

                toast.success("Welcome email sent successfully!");
                onClose();
            } catch (error) {
                toast.error(`Error updating password: ${error.message}`);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <>
            <Button variant="bordered" size="sm" onClick={onOpen} isDisabled={isStaff}>
                Manual Password
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h2>Update Password for {staff?.email || "unknown user"}</h2>
                            <div className="w-full bg-warning-100 rounded-lg">
                                <p className="text-base font-normal text-warning-800 p-2">
                                    Set a manual password and send it via email to{" "}
                                    {staff?.name || "the user"}!
                                </p>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <form className="space-y-6" onSubmit={formik.handleSubmit}>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={isVisible ? "text" : "password"}
                                        required
                                        onChange={formik.handleChange}
                                        variant="bordered"
                                        startContent={
                                            <button
                                                type="button"
                                                onClick={toggleVisibility}
                                                className="focus:outline-none"
                                            >
                                                {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        }
                                        value={formik.values.password}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <p className="text-red-500 text-sm">
                                            {formik.errors.password}
                                        </p>
                                    )}
                                    <Button
                                        className="w-full mt-2"
                                        size="sm"
                                        onClick={() => {
                                            const newPassword = generateSecurePassword();
                                            formik.setFieldValue("password", newPassword);
                                            toast.success("Secure password generated!");
                                        }}
                                    >
                                        Generate Password
                                    </Button>
                                </div>
                                <Button
                                    className="bg-black text-white"
                                    fullWidth
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? "Updating..." : "Update Password"}
                                </Button>
                            </form>
                        </ModalBody>
                    </>
                </ModalContent>
            </Modal>
        </>
    );
}

SetStaffPassword.propTypes = {
    staff: PropTypes.shape({
        email: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        staff_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        authenticated_id: PropTypes.string.isRequired, // Ensure this field is required
    }),
};

export default SetStaffPassword;
