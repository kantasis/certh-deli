import axios from 'axios';

const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const DASHBOARD_API_URL = `http://${authentication_host}:8435`;

export const saveDashboard = async (userId: string, iframeUrl: string, pageName: string) => {
    try {
        const response = await axios.post(`${DASHBOARD_API_URL}/api/save-dashboard`, {
            user_id: userId,
            saved_url: iframeUrl,
            page_name: pageName,
        });
        return response.data;
    } catch (error) {
        console.error("Error saving graph:", error.response?.data || error.message);
        throw error;
    }
};

export const getSavedDashboards = async (userId: string) => {
    try {
        const response = await axios.get(`${DASHBOARD_API_URL}/api/user-dashboards/${userId}`);
        console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching graphs:", error.response?.data || error.message);
        throw new Error("Failed to load saved graphs");
    }
};


export const deleteDashboard = async (id: number) => {
    await axios.delete(`${DASHBOARD_API_URL}/api/delete-dashboard/${id}`);

};