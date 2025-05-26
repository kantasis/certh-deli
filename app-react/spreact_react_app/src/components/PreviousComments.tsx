import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../services/auth.service'; // Import your authentication helper
import { getUserRole } from '../services/auth.service';


const API_URL = 'http://160.40.53.35:8435';
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
    const [message, setMessage] = useState('');
    const [user, setUser] = useState<any>(null);
    const [username, setUsername] = useState<string>('Guest');
    const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit'); // State for the active tab
// const [isLoggedIn, setIsLoggedIn] = useState(false);

//  useEffect(
//       () => {
//          setIsLoggedIn(AuthService.isLoggedIn());
//       },
//       []
//    );


const userRole = getUserRole();
console.log(userRole);
    if (userRole !== "ROLE_ADMIN")
       return <h2>Unauthorized</h2>;
    // Fetch logged-in user on component mount
    useEffect(() => {
        const currentUser = getCurrentUser();
        console.log('Fetched user:', currentUser);
        if (currentUser && currentUser.username) {
            setUser(currentUser);
            setUsername(currentUser.username); // Ensure username is correctly set
        }
    }, []);

    // Fetch comments from API
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



    return (



        <div className='container'>
            <h5 className="mt-5">Commited Comments</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                 
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>👤 Username</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>📅 Created At</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>📝 Comment</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>📍 Page</th>
                    </tr>
                </thead>
                <tbody>
                    {comments.map((comment) => (
                        <tr key={comment.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{comment.username}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(comment.created_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{comment.content}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{comment.page_name}</td>
                        </tr>
                        
                    ))}

                </tbody>
            </table>
        </div>


    );
};

export default Comments;

