import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';
import qs from 'qs';

/**
 * User API service for handling user operations.
 */
class UserService {
    /**
     * Fetch all users for a given client.
     * @param {string} clientId - The client identifier.
     * @returns {Promise<import('../types/user.types').User[] | null>} A promise that resolves to an array of users or null if an error occurs.
     */
    async fetchAllUsers(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.USERS.READ_ALL_USERS.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            return null;
        }
    }

    /**
     * Update a user by user ID.
     * @param {string} userId - The unique identifier of the user.
     * @param {import('../types/user.types').UpdateUserPayload} updateData - The update data for the user.
     * @returns {Promise<import('../types/user.types').User | null>} A promise that resolves to the updated user data or null if an error occurs.
     */
    async updateUser(userId, updateData) {
        try {
            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.USERS.UPDATE_USER.replace(':userId', userId),
                updateData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating user:", error);
            return null;
        }
    }

    /**
     * Delete users by providing an array of user IDs.
     * @param {string[]} userIds - Array of user IDs to delete.
     * @returns {Promise<any>} A promise that resolves to the deletion result or null if an error occurs.
     */
    async deleteUsers(userIds) {
        try {
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.USERS.DELETE_USERS,
                {
                    params: { user_ids: userIds },
                    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' }),
                }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error deleting user(s):", error);
            return null;
        }
    }
}

export const userService = new UserService();
