import { ENDPOINTS } from '../config/endpoints.js';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';

/**
 * Staff API service for handling staff operations.
 */
class StaffService {
    /**
     * Insert a new staff record into Supabase.
     * @param {import('../types/staff.types').CreateStaffPayload} staffData - The staff data for creation.
     * @returns {Promise<import('../types/staff.types').Staff | { error: any }>} A promise that resolves to the created staff record or an error object.
     */
    async InsertStaffIntoSupabase(staffData) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.STAFF.CREATE_STAFF,
                staffData
            );
            // Return the response data
            return response.data.data;
        } catch (error) {
            // Log and return the error
            console.error("Error creating staff:", error);
            return { error: error };
        }
    }

    /**
     * Update staff information.
     * @param {string} staffId - The unique identifier of the staff member.
     * @param {import('../types/staff.types').UpdateStaffPayload} updatedData - The staff data to update.
     * @returns {Promise<import('../types/staff.types').Staff | { error: any }>} A promise that resolves to the updated staff record or an error object.
     */
    async updateStaffInfo(staffId, updatedData) {
        try {
            //console.log("updatedData", updatedData);
            const response = await apiGatewayAxiosInstance.patch(
                ENDPOINTS.STAFF.UPDATE_STAFF.replace(':staffId', staffId),
                updatedData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating client information:", error);
            return { error: error };
        }
    }

    /**
     * Fetch all staff records.
     * @returns {Promise<import('../types/staff.types').Staff[] | null>} A promise that resolves to an array of staff records or null if an error occurs.
     */
    async fetchAllStaff() {
        try {
            const response = await apiGatewayAxiosInstance.get(ENDPOINTS.STAFF.FETCH_ALL_STAFF);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching staff:", error);
            return null;
        }
    }

    /**
     * Fetch staff by client ID.
     * @param {string} clientId - The client identifier.
     * @returns {Promise<import('../types/staff.types').Staff[] | null>} A promise that resolves to an array of staff records or null if an error occurs.
     */
    async fetchStaffByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.STAFF.FETCH_STAFF_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching staff:", error);
            return null;
        }
    }

    /**
     * Fetch staff by email.
     * @param {string} email - The email address of the staff member.
     * @returns {Promise<import('../types/staff.types').Staff | null>} A promise that resolves to the staff record or null if an error occurs.
     */
    async fetchStaffByEmail(email) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.STAFF.FETCH_STAFF_BY_EMAIL.replace(':email', email)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching staff:", error);
            return null;
        }
    }

    /**
     * Fetch staff data by authenticated ID.
     * @param {string} audId - The authenticated ID.
     * @returns {Promise<import('../types/staff.types').Staff | null>} A promise that resolves to the staff record or null if an error occurs.
     */
    async fetchStaffDataByAudId(audId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.STAFF.FETCH_STAFF_BY_AUD_ID.replace(':audId', audId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching client data:", error);
            return null;
        }
    }

    /**
     * Delete a staff member.
     * @param {string} staffId - The unique identifier of the staff member.
     * @param {string} authenticatedId - The authenticated ID of the staff member.
     * @returns {Promise<any>} A promise that resolves to the deletion response.
     */
    async staffMemberDelete(staffId, authenticatedId) {
        try {
            //console.log("staffId", staffId);
            //console.log("authenticatedId", authenticatedId);
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.STAFF.DELETE_STAFF
                    .replace(':staffId', staffId)
                    .replace(':authenticatedId', authenticatedId)
            );
            if (response.data.statusCode === 204 || response.data.statusCode === 200) {
                //console.log('User successfully deleted from Supabase Auth.');
                return response.data;
            } else {
                console.error('Failed to delete user from Supabase Auth.', response.data);
                return response.data;
            }
        } catch (error) {
            console.error('Error deleting user from Supabase Auth:', error);
            throw error;
        }
    }
}

export const staffService = new StaffService();
