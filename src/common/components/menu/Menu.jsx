import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHome } from '@fortawesome/free-solid-svg-icons';
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
                <li><a href="#home1"><FontAwesomeIcon icon={faHome} className="icon" /> Home 1</a></li>
                <li><a href="#home2"><FontAwesomeIcon icon={faHome} className="icon" /> Home 2</a></li>
                <li><a href="#home3"><FontAwesomeIcon icon={faHome} className="icon" /> Home 3</a></li>
                <li><a href="#home4"><FontAwesomeIcon icon={faHome} className="icon" /> Home 4</a></li>
            </ul>
        </div>
    );
};

export default Menu;
