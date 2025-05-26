import axios from 'axios';

<<<<<<< Updated upstream

const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const API_URL = `http://${authentication_host}:8435`; //"http://localhost:8435"; // Use container name, NOT localhost


=======
const API_URL = "http://160.40.53.35:8435"; // Use container name, NOT localhost
>>>>>>> Stashed changes


export const submitComment = async (text: string, username: string, page_name: string) => {
    try {
        console.log("Sending request to:", `${API_URL}/submit-text`);
        console.log("Submitting comment:", { text, username, page_name });
        const response = await axios.post(`${API_URL}/submit-text`, { text, username, page_name });
        console.log("Response:", response.data);
        return response;
    } catch (error) {
        console.error("Error submitting comment:", error.response?.data || error.message);
        throw new Error("Failed to submit comment");
    }
};


