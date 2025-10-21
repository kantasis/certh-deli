import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../services/auth.service';
import { submitComment } from '../services/comments-submit';


const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const API_URL = `http://${authentication_host}`;

interface Comment {
    id: number;
    content: string;
    username: string;
    created_at: string;
    page_name: string;
}

const Comments: React.FC = () => {
    const [text, setText] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
    const [username, setUsername] = useState<string>('Guest');

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.username) {
            setUsername(currentUser.username);
        }
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`${API_URL}/comments`);
                setComments(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) {
            setMessage({ text: '⚠️ Comment cannot be empty.', type: 'danger' });
            setTimeout(() => setMessage(null), 5000);
            return;
        }

        let currentPage = window.location.pathname.replace("/", ""); // Remove "/"

        if (currentPage === "LIT03") {
            const lit03Panel = localStorage.getItem("lit03Panel") || "Unknown Panel";
            currentPage = `LIT03-${lit03Panel}`;
        }


        console.log("Submitting comment with:", { text, username, currentPage });

        try {
            const newComment = await submitComment(text, username, currentPage);
            setComments([...comments, newComment.data]);
            setText('');
            setMessage({ text: '✅ Comment submitted successfully!', type: 'success' });
            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error('Error submitting comment:', error);
            setMessage({ text: '❌ Failed to submit comment.', type: 'danger' });
            setTimeout(() => setMessage(null), 5000);
        }
    };

    return (
        <div className="container mt-4">
            <h5 className="mb-3">💬 Comments</h5>
            <p><strong>Logged in as:</strong> {username}</p>

            {/* Success / Error Messages */}
            {message && (
                <div className={`alert alert-${message.type} fade show`} role="alert">
                    {message.text}
                </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    ✍️ Submit Comment
                </button>
            </form>


        </div>
    );
};

export default Comments;
