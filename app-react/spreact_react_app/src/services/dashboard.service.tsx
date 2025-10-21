import axios from 'axios';

const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const DASHBOARD_API_URL = `http://${authentication_host}`;



export const getSavedDashboards = async (userId: string) => {
    try {
        const response = await axios.get(`${DASHBOARD_API_URL}/api/user-dashboards/${userId}`);
        // console.log(response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching graphs:", error.response?.data || error.message);
        throw new Error("Failed to load saved graphs");
    }
};


export const deleteDashboard = async (id: number) => {
    await axios.delete(`${DASHBOARD_API_URL}/api/delete-dashboard/${id}`);

};

export const deleteDashboardCollection = async (dashboardId: number) => {
    await axios.delete(`${DASHBOARD_API_URL}/api/delete-dashboard-collection/${dashboardId}`);
};


export const getUserDashboards = async (userId: string) => {
    const res = await axios.get(`${DASHBOARD_API_URL}/api/user-dashboards/${userId}`);
    return res.data; // [{ id, name, graphs: [...] }]
};

export const createDashboard = async (userId: string, name: string) => {
    try {
        const res = await axios.post(`${DASHBOARD_API_URL}/api/create-dashboard`, {
            user_id: userId,
            name,
        });
        return res.data;
    } catch (err: any) {
        console.error("Error creating dashboard:", err.response?.data || err.message);
        throw err;
    }
};


export const renameDashboard = async (dashboardId: number, name: string) => {
    await axios.patch(`${DASHBOARD_API_URL}/api/rename-dashboard/${dashboardId}`, {
        name,
    });
};

export const saveGraphToDashboard = async (
    dashboardId: number,
    savedUrl: string,
    pageName: string,
    userId: string,
) => {
  
    if (!userId) throw new Error("User not authenticated");

    const res = await axios.post(`${DASHBOARD_API_URL}/api/save-graph`, {
        dashboardId,
        savedUrl,
        pageName,
        user_id: userId, // 👈 include user_id
    });

    return res.data;
};

