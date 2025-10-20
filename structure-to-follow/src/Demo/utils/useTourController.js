// File: src/hooks/useTourController.js
import { useState, useEffect, useContext } from 'react';
import { STATUS } from 'react-joyride';
import { clientService } from '../../api/services/client.service';
import { subscriptionService } from '../../api/services/subscription.service';
import { UserDataContext } from '../../context/UserDataContext';
import { useAuth } from '../../context/AuthContext';

export default function useTourController(path, userData) {

    const [runTour, setRunTour] = useState(false);
    const { setLoggedInUser } = useContext(UserDataContext);
    const { user } = useAuth();
    
    // Start the tour only when both path and userData are available,
    // and after checking subscription status and client data.
    useEffect(() => {
        if (!path || !userData) {
            console.log("Not ready for tour: path or userData is missing.");
            return;
        }

        const fetchAndCheckData = async () => {
            try {
                // Don't show tours for Enterprise users (custom payment arrangements)
                if (userData?.account_type === "enterprise") {
                    console.log("Enterprise user - starting tour directly (no payment needed)");
                    if (userData?.demo_tooltip?.[path] == false) {
                        setRunTour(true);
                    } else {
                        setRunTour(false);
                    }
                    return;
                }

                // Don't show tours for God Mode users (app owners/administrators) - but allow tours
                if (userData?.role === "God Mode") {
                    console.log("God Mode user - starting tour directly (no payment needed)");
                    if (userData?.demo_tooltip?.[path] == false) {
                        setRunTour(true);
                    } else {
                        setRunTour(false);
                    }
                    return;
                }

                // For regular users, check if they have paid (subscription status)
                let userHasPaid = false;
                
                if (userData?.subscription_id && user) {
                    try {
                        // console.log("Checking subscription status for tour:", userData.subscription_id);
                        const subscriptionData = await subscriptionService.getSubscriptionById(userData.subscription_id);
                        
                        if (subscriptionData && subscriptionData.zoho_info) {
                            // Check if zoho_info is empty object {} (unpaid) or has data (paid)
                            const isZohoInfoEmpty = Object.keys(subscriptionData.zoho_info).length === 0;
                            userHasPaid = !isZohoInfoEmpty; // User has paid if zoho_info is NOT empty
                            
                            // console.log("User payment status for tour:", userHasPaid ? "PAID" : "UNPAID");
                        }
                    } catch (error) {
                        console.error("Error checking subscription for tour:", error);
                        // If we can't check subscription, assume unpaid (don't show tour)
                        userHasPaid = false;
                    }
                }

                // Only start tour if:
                // 1. User has paid (no payment modal should be shown)
                // 2. Demo tooltip flag for the given path is false or missing
                if (userHasPaid && userData?.demo_tooltip?.[path] == false) {
                    console.log("Starting tour for path:", path, "- User has paid and hasn't seen this tour");
                    setRunTour(true);
                } else {
                    if (!userHasPaid) {
                        console.log("Not starting tour - User hasn't paid yet (payment modal will be shown)");
                    } else if (userData?.demo_tooltip?.[path] !== false) {
                        console.log("Not starting tour - User has already seen this tour for path:", path);
                    }
                    setRunTour(false);
                }
            } catch (error) {
                console.error("Failed fetching data for tour check:", error);
                setRunTour(false);
            }
        };

        fetchAndCheckData();
    }, [path, userData, user]);

    // Lock or restore page scrolling based on runTour state
    useEffect(() => {
        document.body.style.overflow = runTour ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [runTour]);

    // Callback for Joyride events
    const handleJoyrideCallback = async (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            setRunTour(false);
            document.body.style.overflow = 'auto';
            const updatedDemoTooltip = {
                ...userData.demo_tooltip,
                [path]: true,
            };
            let userUpdated
            switch (path) {
                case "dashboard":
                    //console.log("dashboard");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "conversations":
                    //console.log("conversations");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "chat":
                    //console.log("chat");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "leads":
                    //console.log("leads");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "agents":
                    //console.log("agents");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "extensions":
                    //console.log("extensions");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "account":
                    //console.log("account");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "business":
                    //console.log("business");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "team":
                    //console.log("team");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "notifications":
                    //console.log("notifications");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "plans":
                    //console.log("plans");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "playground":
                    //console.log("playground");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                case "aiConfiguration":
                    //console.log("aiConfiguration");
                    userUpdated = await clientService.updateClientInfo(userData.client_id, { demo_tooltip: updatedDemoTooltip });
                    setLoggedInUser(userUpdated)
                    break;
                default:
                // code block
            }
        }
    };

    return { runTour, handleJoyrideCallback, setRunTour };
}
