import React, { useState, useEffect, useContext } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Switch,
    Input,
    Button,
    cn
} from "@heroui/react";
import { Mail, Phone, Trash, Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import validator from "validator";
import { UserDataContext } from "../../context/UserDataContext";
import { clientService } from "../../api/services/client.service";

import Joyride from "react-joyride";
import useTourController from "../../Demo/utils/useTourController";
import { notificationsSteps } from '../../Demo/Profile/notifications.demo'
import MyCustomTooltip from "../../Demo/CustomTooltip/MyCustomTooltip";

function isValidEmail(email) {
    return validator.isEmail(email);
}

function isValidPhoneNumber(phone) {
    const regex = /^(?:\+|00)?[0-9]{1,15}$/;
    return regex.test(phone);
}

export default function NotificationPreferences() {
    const { userData, loggedInUser } = useContext(UserDataContext);
    const clientId = userData?.client_id;

    // Use the custom hook for tour control
    const { runTour, handleJoyrideCallback } = useTourController("notifications", loggedInUser);

    // States for emails/phones and validation
    const [emails, setEmails] = useState([]);
    const [phones, setPhones] = useState([]);
    const [invalidEmails, setInvalidEmails] = useState(new Set());
    const [invalidPhones, setInvalidPhones] = useState(new Set());

    // Store initial states to compare changes
    const [initialEmailsJson, setInitialEmailsJson] = useState("");
    const [initialPhonesJson, setInitialPhonesJson] = useState("");
    const [initialPreferableContacts, setInitialPreferableContacts] = useState("");
    const [initialIsNotificationsOn, setInitialIsNotificationsOn] = useState(false);

    // Notification preferences: using checkboxes for Email/Phone (or Both)
    const [selectedOptions, setSelectedOptions] = useState([]);
    // Global toggle for notifications on/off
    const [isNotificationsOn, setIsNotificationsOn] = useState(false);
    // Whether to show the notifications switch section (based on fetched data)
    const [showSwitch, setShowSwitch] = useState(false);
    // Saving state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load client data on mount
    useEffect(() => {
        async function loadData() {
            if (!clientId) return;
            const clientData = await clientService.fetchClientData(clientId);
            if (clientData && clientData.preferable_emails && clientData.preferable_phone) {
                setEmails(clientData.preferable_emails);
                setPhones(clientData.preferable_phone);
                setIsNotificationsOn(clientData.is_notifications_on);
                setShowSwitch(true);
                setInitialEmailsJson(JSON.stringify(clientData.preferable_emails));
                setInitialPhonesJson(JSON.stringify(clientData.preferable_phone));
                setInitialPreferableContacts(clientData.preferable_contact);
                setInitialIsNotificationsOn(clientData.is_notifications_on);

                if (clientData.preferable_contact) {
                    setSelectedOptions(
                        clientData.preferable_contact === "Both"
                            ? ["Both", "Email", "Phone"]
                            : [clientData.preferable_contact]
                    );
                } else {
                    setSelectedOptions([]);
                }
            } else if (clientData && clientData.preferable_emails) {
                setEmails(clientData.preferable_emails);
                setInitialEmailsJson(JSON.stringify(clientData.preferable_emails));
            } else {
                toast.error("Failed to fetch client data!");
            }
        }
        loadData();
    }, [clientId]);

    // Handlers for adding/removing email and phone fields
    const addEmail = () => setEmails([...emails, ""]);
    const addPhone = () => setPhones([...phones, ""]);

    const handleEmailChange = (index, value) => {
        const updated = [...emails];
        updated[index] = value;
        setEmails(updated);
        if (isValidEmail(value)) {
            setInvalidEmails(new Set([...invalidEmails].filter(i => i !== index)));
        } else {
            setInvalidEmails(new Set([...invalidEmails, index]));
        }
    };

    const handlePhoneChange = (index, value) => {
        const updated = [...phones];
        updated[index] = value;
        setPhones(updated);
        if (isValidPhoneNumber(value)) {
            setInvalidPhones(new Set([...invalidPhones].filter(i => i !== index)));
        } else {
            setInvalidPhones(new Set([...invalidPhones, index]));
        }
    };

    const removeEmail = (index) => {
        setEmails(emails.filter((_, i) => i !== index));
        setInvalidEmails(new Set([...invalidEmails].filter(i => i !== index)));
    };

    const removePhone = (index) => {
        setPhones(phones.filter((_, i) => i !== index));
        setInvalidPhones(new Set([...invalidPhones].filter(i => i !== index)));
    };

    // Validation functions
    const validateEmails = () => {
        const invalidSet = new Set();
        emails.forEach((email, idx) => {
            if (!isValidEmail(email)) invalidSet.add(idx);
        });
        setInvalidEmails(invalidSet);
        return invalidSet.size === 0;
    };

    const validatePhones = () => {
        const invalidSet = new Set();
        phones.forEach((phone, idx) => {
            if (!isValidPhoneNumber(phone)) invalidSet.add(idx);
        });
        setInvalidPhones(invalidSet);
        return invalidSet.size === 0;
    };

    // Checkbox handling for selecting notification methods
    const handleCheckboxChange = (option) => (checked) => {
        let updatedOptions = [...selectedOptions];
        if (checked) {
            updatedOptions.push(option);
            if (updatedOptions.includes("Email") && updatedOptions.includes("Phone")) {
                updatedOptions = ["Both", "Email", "Phone"];
            }
        } else {
            updatedOptions = updatedOptions.filter(opt => opt !== option);
            if (updatedOptions.includes("Both")) {
                updatedOptions = updatedOptions.filter(opt => opt !== "Both");
            }
        }
        setSelectedOptions(updatedOptions);
    };

    const isOptionChecked = (option) =>
        selectedOptions.includes(option) || selectedOptions.includes("Both");

    // Save changes if any state differs from the initial values
    const handleSaveChanges = async () => {
        if (validateEmails() && validatePhones()) {
            let currentPref = "";
            if (selectedOptions.includes("Email") && selectedOptions.includes("Phone")) {
                currentPref = "Both";
            } else if (selectedOptions.includes("Email")) {
                currentPref = "Email";
            } else if (selectedOptions.includes("Phone")) {
                currentPref = "Phone";
            } else {
                toast.error("Please select a notification preference or disable notifications.");
                return;
            }

            const emailsChanged = JSON.stringify(emails) !== initialEmailsJson;
            const phonesChanged = JSON.stringify(phones) !== initialPhonesJson;
            const prefChanged = currentPref !== initialPreferableContacts;
            const switchChanged = isNotificationsOn !== initialIsNotificationsOn;

            if (emailsChanged || phonesChanged || prefChanged || switchChanged) {
                setIsSubmitting(true);
                try {
                    const payload = {
                        preferable_emails: emails,
                        preferable_phone: phones,
                        preferable_contact: currentPref,
                        is_notifications_on: isNotificationsOn,
                    };
                    const response = await clientService.updateClientInfo(clientId, payload);
                    if (response.error) {
                        toast.error("Failed to update client preferences!");
                    } else {
                        toast.success("Client preferences updated successfully!");
                        setInitialEmailsJson(JSON.stringify(emails));
                        setInitialPhonesJson(JSON.stringify(phones));
                        setInitialPreferableContacts(currentPref);
                        setInitialIsNotificationsOn(isNotificationsOn);
                    }
                } catch (err) {
                    toast.error("Error while saving client preferences!");
                } finally {
                    setIsSubmitting(false);
                }
            } else {
                toast.info("No changes made to save.");
            }
        } else {
            toast.error("Please enter valid email addresses and phone numbers.");
        }
    };

    return (
        <>
            {/* Joyride component at the top level */}
            <Joyride
                showProgress={true}
                disableCloseOnEsc={true}
                disableOverlayClose={true}
                steps={notificationsSteps}
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
            <Card className="w-full border-1 border-black/10 border-solid welcome" shadow="none">
                <CardHeader className="flex gap-3">
                    {/* Icon Container with brand background */}
                    <div className="p-2 rounded-lg bg-brand/10">
                        <MessageSquare className="w-5 h-5 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-md font-semibold text-gray-900">
                            Notification Preferences
                        </p>
                        <p className="text-small text-gray-500">
                            Manage how and when you receive notifications from the platform
                        </p>
                    </div>
                    {showSwitch && (
                        <div className="ml-auto flex items-center">
                            <p className="text-xs mr-2">Off</p>
                            <Switch
                                isSelected={isNotificationsOn}
                                id="switchContainer"
                                size="sm"
                                onValueChange={() => setIsNotificationsOn((prev) => !prev)}
                            />
                            <p className="text-xs ml-2">On</p>
                        </div>
                    )}
                </CardHeader>

                <Divider />

                <CardBody className="space-y-4">

                    {isNotificationsOn && (
                        <>
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg method">
                                <h3 className="text-base font-bold mb-2">Notification Methods</h3>
                                <p className="text-xs mb-4">Choose which channels you'd like to receive notifications through. You can select one or both options to ensure you never miss important updates.</p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Custom Email Checkbox - Improved */}
                                    <div className="flex-1">
                                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                                            <div className="relative mr-3">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isOptionChecked("Email")}
                                                    onChange={(e) => handleCheckboxChange("Email")(e.target.checked)}
                                                />
                                                <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ${isOptionChecked("Email") ? 'border-transparent' : 'border-gray-300'}`}>
                                                    <div className={`w-full h-full rounded-md ${isOptionChecked("Email") ? 'bg-gradient-to-r from-brand to-brand-secondary' : 'bg-transparent'}`}>
                                                        {isOptionChecked("Email") && (
                                                            <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail size={18} className="text-gray-600" />
                                                <span className="font-medium">Email Notifications</span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Custom Phone Checkbox - Improved */}
                                    <div className="flex-1">
                                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                                            <div className="relative mr-3">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isOptionChecked("Phone")}
                                                    onChange={(e) => handleCheckboxChange("Phone")(e.target.checked)}
                                                />
                                                <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center ${isOptionChecked("Phone") ? 'border-transparent' : 'border-gray-300'}`}>
                                                    <div className={`w-full h-full rounded-md ${isOptionChecked("Phone") ? 'bg-gradient-to-r from-brand to-brand-secondary' : 'bg-transparent'}`}>
                                                        {isOptionChecked("Phone") && (
                                                            <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={18} className="text-gray-600" />
                                                <span className="font-medium">SMS Notifications</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {isOptionChecked("Email") && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg email-inputs">
                                    <div className="flex w-full justify-between items-center mb-3">
                                        <div>
                                            <h3 className="text-base font-bold">Email Addresses</h3>
                                            <p className="text-xs text-gray-600">
                                                Add one or more email addresses where you'd like to receive notifications. All addresses will receive the same updates, allowing you to stay informed across multiple accounts.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            isIconOnly
                                            onPress={addEmail}
                                            className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium rounded-full h-8 w-8 min-w-0 flex items-center justify-center"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {emails.length > 0 ? (
                                            emails.map((email, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Input
                                                        label="Email Address"
                                                        size="sm"
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => handleEmailChange(idx, e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        className="text-danger bg-transparent hover:bg-red-50 transition-colors"
                                                        onPress={() => removeEmail(idx)}
                                                    >
                                                        <Trash size={16} />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No email addresses added yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isOptionChecked("Phone") && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg phone-inputs">
                                    <div className="flex w-full justify-between items-center mb-3">
                                        <div>
                                            <h3 className="text-base font-bold">Phone Numbers</h3>
                                            <p className="text-xs text-gray-600">
                                                Add mobile numbers to receive SMS notifications for time-sensitive updates. Standard message rates may apply based on your carrier.
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            isIconOnly
                                            onPress={addPhone}
                                            className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium rounded-full h-8 w-8 min-w-0 flex items-center justify-center"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {phones.length > 0 ? (
                                            phones.map((phone, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Input
                                                        label="Phone Number"
                                                        size="sm"
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => handlePhoneChange(idx, e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        className="text-danger bg-transparent hover:bg-red-50 transition-colors"
                                                        onPress={() => removePhone(idx)}
                                                    >
                                                        <Trash size={16} />
                                                    </Button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No phone numbers added yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {(isOptionChecked("Email") || isOptionChecked("Phone")) && (
                                <div className="flex justify-end mt-8">
                                    <Button
                                        type="submit"
                                        className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium px-6 py-2  shadow-sm hover:shadow transition-all"
                                        onPress={handleSaveChanges}
                                        isLoading={isSubmitting}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardBody>
            </Card>
        </>
    );
}
