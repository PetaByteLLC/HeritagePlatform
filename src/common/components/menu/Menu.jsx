import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHome, faUser, faCog, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './Menu.css';

const Menu = ({ isOpen, onClose }) => {
    return (
        <div className={`menu ${isOpen ? 'open' : ''}`}>
            <div className="menu-header">
                <h2 className="menu-title">Menu</h2>
                <button className="close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <ul>
                <li><a href="#home"><FontAwesomeIcon icon={faHome} className="icon" /> Home</a></li>
                <li><a href="#profile"><FontAwesomeIcon icon={faUser} className="icon" /> Profile</a></li>
                <li><a href="#settings"><FontAwesomeIcon icon={faCog} className="icon" /> Settings</a></li>
                <li><a href="#about"><FontAwesomeIcon icon={faInfoCircle} className="icon" /> About</a></li>
            </ul>
        </div>
    );
};

export default Menu;
