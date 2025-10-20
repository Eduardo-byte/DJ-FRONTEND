import React, { useState, useContext } from "react";
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Divider,
} from "@heroui/react";
import { Building2, Mail, Phone, Globe, MapPin, Info } from "lucide-react";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import { supabase } from "../../lib/supabase";
import { clientService } from "../../api/services/client.service";
import { staffService } from "../../api/services/staff.service";

import useTourController from "../../Demo/utils/useTourController";
import Joyride from 'react-joyride';
import { businessSteps } from '../../Demo/Profile/business.demo'
import MyCustomTooltip from '../../Demo/CustomTooltip/MyCustomTooltip';

export default function BusinessInformation() {
    const [showTooltip, setShowTooltip] = useState(false);

    // Get current user data from context
    const { userData, setUserData, loggedInUser } = useContext(UserDataContext);
    const clientId = userData?.client_id;
    // Use the custom hook for tour control
    const { runTour, handleJoyrideCallback } = useTourController("business", loggedInUser);

    // Initialize state from context if available; fallback to defaults
    const [businessInfo, setBusinessInfo] = useState({
        name: userData?.company_name || "",
        email: userData?.business_email || "",
        phone: userData?.contact_phone || "",
        website: userData?.website || "",
        address: userData?.address || "",
    });

    const [isLoading, setIsLoading] = useState(false);

    // Update business info when the form is submitted
    const handleBusinessInfoUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Build the payload – adjust keys to match your backend requirements
            const payload = {
                company_name: businessInfo.name,
                business_email: businessInfo.email,
                contact_phone: businessInfo.phone,
                website: businessInfo.website,
                address: businessInfo.address,
            };

            // First, update your custom business information via your API
            const updateResult = await clientService.updateClientInfo(clientId, payload);
            const allStaff = await staffService.fetchStaffByClientId(clientId)
            if (allStaff.length > 0) {
                for (const staff of allStaff) {
                    await staffService.updateStaffInfo(staff.staff_id, { company_name: businessInfo.name.toString() });
                }
            }
            if (updateResult.error) {
                toast.error(updateResult.error);
                return;
            }

            // Update your context if you maintain a global user state.
            setUserData((prevData) => ({
                ...prevData,
                company_name: businessInfo.name,
                business_email: businessInfo.email,
                contact_phone: businessInfo.phone,
                website: businessInfo.website,
                address: businessInfo.address,
            }));

            toast.success("Business information updated!");
        } catch (error) {
            toast.error("Error updating business information!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Joyride component at the top level */}
            <Joyride
                showProgress={true}
                disableCloseOnEsc={true}
                disableOverlayClose={true}
                steps={businessSteps}
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
            <Card className="w-full border-1 border-black/10 border-solid business" shadow="none">
                <CardHeader className="flex gap-3">
                    <div className="p-2 rounded-lg bg-brand/10">
                        <Building2 className="w-5 h-5 text-gray-900" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-md font-semibold text-gray-900">Business Information</p>
                        <p className="text-small text-gray-500">
                            Update your business details
                        </p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <form onSubmit={handleBusinessInfoUpdate} className="space-y-4">
                        <Input
                            label="Business Name"
                            value={businessInfo.name}
                            onChange={(e) =>
                                setBusinessInfo({ ...businessInfo, name: e.target.value })
                            }
                            endContent={<Building2 className="w-4 h-4 text-gray-400" />}
                            required
                        />
                        {/* <Input
                        type="email"
                        label="Business Email"
                        value={businessInfo.email}
                        onChange={(e) =>
                            setBusinessInfo({ ...businessInfo, email: e.target.value })
                        }
                        endContent={<Mail className="w-4 h-4 text-gray-400" />}
                        required
                    /> */}
                        <Input
                            type="email"
                            label="Business Email"
                            value={businessInfo.email}
                            onChange={(e) =>
                                setBusinessInfo({ ...businessInfo, email: e.target.value })
                            }
                            required
                            endContent={<Mail className="w-4 h-4 text-gray-400" />}
                            startContent={
                                <div className="relative mb-1">
                                    <Info
                                        className="w-3 h-3 text-gray-400 cursor-pointer"
                                        onClick={() => setShowTooltip((prev) => !prev)}
                                    />
                                    <div
                                        className={`absolute bottom-full left-16 transform -translate-x-1/2 mb-2 px-3 py-2 
                        bg-brand text-xs text-black rounded-lg transition-opacity z-50 
                        whitespace-nowrap text-center
                        ${showTooltip ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                                    >
                                        This is not your login email
                                    </div>
                                </div>
                            }
                        />
                        <Input
                            label="Phone Number"
                            value={businessInfo.phone}
                            onChange={(e) =>
                                setBusinessInfo({ ...businessInfo, phone: e.target.value })
                            }
                            endContent={<Phone className="w-4 h-4 text-gray-400" />}
                            required
                        />
                        <Input
                            label="Website"
                            value={businessInfo.website}
                            onChange={(e) =>
                                setBusinessInfo({ ...businessInfo, website: e.target.value })
                            }
                            endContent={<Globe className="w-4 h-4 text-gray-400" />}
                        />
                        <Input
                            label="Address"
                            value={businessInfo.address}
                            onChange={(e) =>
                                setBusinessInfo({ ...businessInfo, address: e.target.value })
                            }
                            endContent={<MapPin className="w-4 h-4 text-gray-400" />}
                        />
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium"
                            isLoading={isLoading}
                        >
                            Save Changes
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </>
    );
}
