import React from "react";
import { Link } from "react-router-dom";

const ChangePasswordDropdown: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    return (
        <li className="nav-item dropdown">
            <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                Profile
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
                <li>
                    <Link className="dropdown-item" to="/profile">My Profile</Link>
                </li>
                <li>
                    <Link className="dropdown-item" to="/change-password">Change Password</Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                    <a className="dropdown-item" href="#" onClick={onLogout}>Logout</a>
                </li>
            </ul>
        </li>
    );
};

export default ChangePasswordDropdown;
