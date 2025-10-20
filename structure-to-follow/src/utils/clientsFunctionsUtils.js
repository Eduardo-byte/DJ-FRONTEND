import { clientService } from "../api/services/client.service";
import { staffService } from "../api/services/staff.service";

const setCurrentUserData = async (user_id, setUserData, setIsStaff) => {
    const userData = await clientService.fetchClientDataByAudId(user_id);
    if (userData) {
        setUserData(userData);
    } else {
        const staffData = await staffService.fetchStaffDataByAudId(user_id)
        if (staffData) {
            const clientData = await clientService.fetchClientData(staffData.client_id)
            if (staffData.contact_email !== clientData.contact_email) {
                const staffUpdate = await staffService.updateStaffInfo(staffData.staff_id, { contact_email: clientData.contact_email });
                // console.log("staffUpdate: ", staffUpdate);
            }
            // console.log("staffData:", staffData);
            // console.log("clientData from Staff:", clientData);
            setUserData(clientData);
            setIsStaff(true);
        }
    }
}

const setUserLoggedInData = async (user_id, setLoggedInUser) => {
    const userData = await clientService.fetchClientDataByAudId(user_id);
    if (userData) {
        setLoggedInUser(userData);
    } else {
        const staffData = await staffService.fetchStaffDataByAudId(user_id)
        if (staffData) {
            const clientData = await clientService.fetchClientData(staffData.client_id)
            // console.log("staffData:", staffData);
            // console.log("clientData from Staff:", clientData);
            setLoggedInUser(staffData);
        }
    }

}

const getAllClients = async (setClientList) => {
    const allClients = await clientService.fetchAllClients();
    setClientList(allClients)
}

export {
    setCurrentUserData,
    getAllClients,
    setUserLoggedInData
}