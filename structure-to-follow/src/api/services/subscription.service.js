import { ENDPOINTS } from '../config/endpoints.js';
import apiGatewayAxiosInstance, { logError } from '../config/apiGatewayAxiosInstance.js';
import { capitalizeFirstLetter } from '../../utils/textFormat.js';
import { toast } from 'sonner';

/**
 * Subscription API service for handling subscription operations.
 */
class SubscriptionService {
    /**
     * Get payment links for all available plans.
     * @returns {Promise<import('../types/subscription.types').PaymentLinksResponse|null>} - The payment links or null if an error occurs.
     */
    async getPaymentLinks() {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SUBSCRIPTION.PLAN_MANAGEMENT.GET_PAYMENT_LINKS
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching payment links:", error);
            return null;
        }
    }

    /**
     * Get subscription details by subscription ID.
     * @param {string} subscriptionId - The subscription ID.
     * @returns {Promise<import('../types/subscription.types').SubscriptionResponse|null>} - The subscription details or null if an error occurs.
     */
    async getClientSubscriptionById(subscriptionId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SUBSCRIPTION.PLAN_MANAGEMENT.GET_CLIENT_SUBSCRIPTION_BY_ID.replace(':subscriptionId', subscriptionId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching subscription details:", error);
            return null;
        }
    }

    /**
     * Get current plan for a client by client ID.
     * @param {string} clientId - The client ID.
     * @returns {Promise<import('../types/subscription.types').CurrentPlanResponse|null>} - The current plan details or null if an error occurs.
     */
    async getCurrentPlanForClientByClientId(clientId) {
        try {
            //console.log("Fetching current plan for clientId:", clientId);
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SUBSCRIPTION.PLAN_MANAGEMENT.GET_CURRENT_PLAN_FOR_CLIENT_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            //console.log("Current plan API response:", response.data);

            if (!response.data || !response.data.data) {
                console.log("API response missing expected data structure");
                return null;
            }

            return response.data.data;
        } catch (error) {
            console.error("Error fetching current plan:", error);
            return null;
        }
    }

    /**
     * Search for a client by email.
     * @param {string} email - The email to search for.
     * @returns {Promise<import('../types/subscription.types').CustomerSearchResponse|null>} - The search results or null if an error occurs.
     */
    async searchClientByEmail(email) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SUBSCRIPTION.PLAN_MANAGEMENT.SEARCH_CLIENT_BY_EMAIL.replace(':email', encodeURIComponent(email))
            );
            return response.data.data;
        } catch (error) {
            console.error("Error searching client by email:", error);
            return null;
        }
    }

    /**
     * Create a new subscription plan.
     * @param {import('../types/subscription.types').CreateSubscriptionRequest} subscriptionData - The subscription data.
     * @returns {Promise<import('../types/subscription.types').Subscription|{success: boolean, message: string}>} - The created subscription or an error object.
     */
    async createNewSubscription(subscriptionData) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_PLAN.CREATE_NEW_SUBSCRIPTION,
                subscriptionData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error creating subscription:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Error creating subscription"
            };
        }
    }

    /**
     * Update a subscription plan by ID.
     * @param {string} subscriptionId - The subscription ID.
     * @param {import('../types/subscription.types').UpdateSubscriptionRequest} updateData - The update data.
     * @returns {Promise<import('../types/subscription.types').Subscription|{success: boolean, message: string}>} - The updated subscription or an error object.
     */
    async updateSubscriptionById(subscriptionId, updateData) {
        try {
            const response = await apiGatewayAxiosInstance.patch(
                ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_PLAN.UPDATE_SUBSCRIPTION_BY_ID.replace(':subscriptionId', subscriptionId),
                updateData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating subscription:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Error updating subscription"
            };
        }
    }

    /**
     * Get a subscription plan by ID.
     * @param {string} subscriptionId - The subscription ID.
     * @returns {Promise<import('../types/subscription.types').Subscription|null>} - The subscription or null if an error occurs.
     */
    async getSubscriptionById(subscriptionId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_PLAN.GET_SUBSCRIPTION_BY_ID.replace(':subscriptionId', subscriptionId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching subscription:", error);
            return null;
        }
    }

    /**
     * Get a subscription plan by client ID.
     * @param {string} clientId - The client ID.
     * @returns {Promise<import('../types/subscription.types').Subscription|null>} - The subscription or null if an error occurs.
     */
    async getSubscriptionByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SUBSCRIPTION.SUBSCRIPTION_PLAN.GET_SUBSCRIPTION_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching subscription by client ID:", error);
            return null;
        }
    }

    /**
   * Downgrade a customer to a new plan.
   * @param {import('../types/subscription.types').DowngradePlanRequest} downgradeData - The downgrade data.
   * @returns {Promise<import('../types/subscription.types').DowngradePlanResponse|{success: boolean, message: string}>} - The downgrade result.
   */
    async downgradePlan(email, targetPlan, customerCurrentPlan, clientId) {
        try {
            const zoho_user_data = await this.searchClientByEmail(email)


            // Loop through each customer
            if (zoho_user_data && zoho_user_data.success && zoho_user_data.customers && zoho_user_data.customers.length > 0) {
                // Create an array to store all plan promises
                const planPromises = [];

                // Loop through each customer
                for (const customer of zoho_user_data.customers) {
                    // Get the current plan for this customer
                    const planPromise = this.getCurrentPlanForClientByClientId(customer.customer_id);
                    planPromises.push(planPromise);
                }

                // Wait for all plan requests to complete
                const customerPlans = await Promise.all(planPromises);


                // Process the results - use a for loop instead of forEach to allow early return
                for (let i = 0; i < zoho_user_data.customers.length; i++) {

                    if (customerPlans[i] && customerPlans[i].currentPlan) {
                        const currentPlan = customerPlans[i];
                        const currentPlanCode = currentPlan.currentPlan.plan.plan_code;
                        const customerId = currentPlan.currentPlan.subscription.customer_id;

                        // Compare currentPlanCode with customerCurrentPlan
                        if (currentPlanCode.toLowerCase() === customerCurrentPlan.toLowerCase()) {
                            const downgradeData = {
                                customerId: customerId,
                                subscriptionId: currentPlan.currentPlan.subscription.subscription_id,
                                newPlanCode: capitalizeFirstLetter(targetPlan)
                            };

                            const response = await apiGatewayAxiosInstance.post(
                                ENDPOINTS.SUBSCRIPTION.PLAN_MANAGEMENT.DOWNGRADE_PLAN,
                                downgradeData
                            );

                            if (response.data && response.data.success) {
                                //console.log("Success Downgraded the user");

                                // Check if clientId is valid
                                if (!clientId) {
                                    console.log("Warning: clientId is null or undefined");
                                } else {

                                    // Get the current plan using the clientId parameter
                                    const subData = await this.getSubscriptionByClientId(clientId);
                                    //console.log("subData: ", subData);
                                    const planUpdateData = {
                                        plan_name: response.data.data.subscription.line_items[0].name.toLowerCase() || 'basic',
                                        monthly_cost: 0,
                                        annual_cost: 0,
                                        message_limit: 100,
                                        storage_limit: 50,
                                        feature_list: {},
                                        active: true,
                                        zoho_info: {
                                            customer_id: response.data.data.subscription.customer_id,
                                            created_at: response.data.data.subscription.created_at,
                                            subscription_id: response.data.data.subscription.subscription_id,
                                            plan: response.data.data.subscription.plan,
                                            addons: response.data.data.subscription.addons,
                                            amount: response.data.data.subscription.amount,
                                            discount: response.data.data.subscription.discount,
                                            status: response.data.data.subscription.status,
                                            expires_at: response.data.data.subscription.expires_at,
                                            trial_starts_at: response.data.data.subscription.trial_starts_at,
                                            current_term_starts_at: response.data.data.subscription.current_term_starts_at,
                                            current_term_ends_at: response.data.data.subscription.current_term_ends_at,
                                            trial_remaining_days: response.data.data.subscription.trial_remaining_days,
                                            payment_terms_label: response.data.data.subscription.payment_terms_label,
                                            contact_persons_associated: response.data.data.subscription.contact_persons_associated,
                                            shipping_interval_unit: response.data.data.subscription.shipping_interval_unit,
                                            action_type: 'downgrade',
                                            db_client_id: clientId
                                        }
                                    }

                                    // Adjust plan details based on account type
                                    switch (response.data.data.subscription.line_items[0].name?.toLowerCase()) {
                                        case 'pro':
                                            planUpdateData.monthly_cost = 99;
                                            planUpdateData.annual_cost = 990;
                                            planUpdateData.message_limit = 10000;
                                            planUpdateData.storage_limit = 200;
                                            break;
                                        case 'advanced':
                                            planUpdateData.monthly_cost = 249;
                                            planUpdateData.annual_cost = 2490;
                                            planUpdateData.message_limit = 1000000;
                                            planUpdateData.storage_limit = 500;
                                            break;
                                        case 'enterprise':
                                            planUpdateData.monthly_cost = 249;
                                            planUpdateData.annual_cost = 2490;
                                            planUpdateData.message_limit = -1; // Unlimited messages
                                            planUpdateData.storage_limit = 1000;
                                            break;
                                    }

                                    // TODO: Update user on the database with subData if available
                                    const updated_data = await this.updateSubscriptionById(subData.subscription_id, planUpdateData)
                                    //console.log(updated_data)
                                }
                            }
                            return response.data.data;
                        } else {
                            console.log("");
                        }
                    }
                }
            } else {
                console.log("No customers found or invalid response format");
            }

            return zoho_user_data;
        } catch (error) {
            console.error("Error downgrading plan:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Error downgrading plan"
            };
        }
    }

    /**
     * Cancel a subscription by ID.
     * @param {string} email - The subscription ID to cancel.
     * @param {string} customerCurrentPlan - The Customer Current Plan.
     * @returns {Promise<import('../types/subscription.types').CancelSubscriptionResponse|{success: boolean, message: string}>} - The cancellation result.
     */
    async cancelSubscription(email, customerCurrentPlan, clientId) {
        try {

            const zoho_user_data = await this.searchClientByEmail(email)
            // Loop through each customer
            if (zoho_user_data && zoho_user_data.success && zoho_user_data.customers && zoho_user_data.customers.length > 0) {
                // Create an array to store all plan promises
                const planPromises = [];

                // Loop through each customer
                for (const customer of zoho_user_data.customers) {
                    // Get the current plan for this customer
                    const planPromise = this.getCurrentPlanForClientByClientId(customer.customer_id);
                    planPromises.push(planPromise);
                }

                // Wait for all plan requests to complete
                const customerPlans = await Promise.all(planPromises);

                const allPlansEmpty = customerPlans.every(plan => plan === null);

                //console.log(allPlansEmpty)

                if (!allPlansEmpty) {
                    for (let i = 0; i < zoho_user_data.customers.length; i++) {
                        if (customerPlans[i] && customerPlans[i].currentPlan) {
                            const currentPlan = customerPlans[i];
                            const currentPlanCode = currentPlan.currentPlan.plan.plan_code;

                            // Compare currentPlanCode with customerCurrentPlan
                            if (currentPlanCode.toLowerCase() === customerCurrentPlan.toLowerCase()) {

                                // cancel user subscription
                                const payload = {
                                    cancel_at_end: true,
                                    cancellation_reason: "Customer requested cancellation"
                                };

                                const response = await apiGatewayAxiosInstance.post(
                                    ENDPOINTS.SUBSCRIPTION.PLAN_MANAGEMENT.CANCEL_SUBSCRIPTION_BY_ID.replace(':subscriptionId', currentPlan.currentPlan.subscription.subscription_id),
                                    payload
                                );

                                if (response.data && response.data.success) {
                                    //console.log("Success Downgraded the user");

                                    // Check if clientId is valid
                                    if (!clientId) {
                                        console.log("Warning: clientId is null or undefined");
                                    } else {

                                        // Get the current plan using the clientId parameter
                                        const subData = await this.getSubscriptionByClientId(clientId);
                                        //console.log("subData: ", subData);
                                        const planUpdateData = {
                                            plan_name: subData.name,
                                            monthly_cost: subData.monthly_cost,
                                            annual_cost: subData.annual_cost,
                                            message_limit: subData.message_limit,
                                            storage_limit: subData.storage_limit,
                                            feature_list: subData.feature_list,
                                            active: subData.active,
                                            zoho_info: {
                                                customer_id: subData.zoho_info.customer_id,
                                                created_at: subData.zoho_info.created_at,
                                                subscription_id: subData.zoho_info.subscription_id,
                                                plan: subData.zoho_info.plan,
                                                addons: subData.zoho_info.addons,
                                                amount: subData.zoho_info.amount,
                                                discount: subData.zoho_info.discount,
                                                status: subData.zoho_info.status,
                                                expires_at: subData.zoho_info.expires_at,
                                                trial_starts_at: subData.zoho_info.trial_starts_at,
                                                current_term_starts_at: subData.zoho_info.current_term_starts_at,
                                                current_term_ends_at: subData.zoho_info.current_term_ends_at,
                                                trial_remaining_days: subData.zoho_info.trial_remaining_days,
                                                payment_terms_label: subData.zoho_info.payment_terms_label,
                                                contact_persons_associated: subData.zoho_info.contact_persons_associated,
                                                shipping_interval_unit: subData.zoho_info.shipping_interval_unit,
                                                action_type: 'cancel',
                                                db_client_id: subData.zoho_info.db_client_id,
                                                scheduled_cancellation_date: response.data.data.subscription.subscription.scheduled_cancellation_date
                                            }
                                        }

                                        // Update user on the database with subData if available
                                        const updated_data = await this.updateSubscriptionById(subData.subscription_id, planUpdateData)
                                        //console.log(updated_data)
                                    }
                                }
                                return response.data.data;
                            } else {
                                console.log("");
                            }
                        }
                    }
                } else {
                    toast.warning("Your plan is current canceled or deactivated")
                }
            } else {
                console.log("No customers found or invalid response format");
            }

            return {
                success: true,
                subscription: response.data.subscription
            };
        } catch (error) {
            console.error("Error cancelling subscription:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Error cancelling subscription"
            };
        }
    }
}

export const subscriptionService = new SubscriptionService();
