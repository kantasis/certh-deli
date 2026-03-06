import axios from "axios";

const isProduction = import.meta.env.MODE === "production";
const host = import.meta.env.VITE_AUTHENTICATION_HOST;

// Relative URL in production (Nginx handles routing)
const API_URL = isProduction
    ? "/submit-text"
    : `http://${host}:8435/submit-text`;

// ------------------------
// Submit Comment
// ------------------------
export const submitComment = async (
    text: string,
    username: string,
    page_name: string
) => {
    try {
        console.log("Sending request to:", `${API_URL}`);
        console.log("Submitting comment:", { text, username, page_name });

        const response = await axios.post(`${API_URL}`, {
            text,
            username,
            page_name
        });

        console.log("Response:", response.data);
        return response.data;

    } catch (error: any) {
        console.error(
            "Error submitting comment:",
            error.response?.data || error.message
        );
        throw new Error("Failed to submit comment");
    }
};