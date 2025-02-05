import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBookmark, faLayerGroup, faMagic } from '@fortawesome/free-solid-svg-icons';
import { MapContext } from '../../../MapContext';
import Bookmark from './../bookmark';
import LayerList from '../layer-list/LayerList';
import Effect from "../effect";
import './Menu.css';

const Menu = ({ isOpen, onClose }) => {
    const { mode } = useContext(MapContext);
    const is2D = mode === '2D';
    const [bookmarkActive, setBookmarkActive] = useState(false);
    return (<>
        <div className={`menu ${isOpen ? 'open' : ''}`}>
            <div className="menu-header">
                <h2 className="menu-title">Menu</h2>
                <button className="close-button" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <ul className='d-flex flex-column'>
                <li data-bs-toggle="offcanvas" data-bs-target="#layersMenu" aria-controls="layersMenu" role="button">
                    <p className='d-flex align-items-center gap-2 p-0 m-0'>
                        <FontAwesomeIcon icon={faLayerGroup} className="icon" fixedWidth/>
                        Layers
                    </p>
                </li>
                <li data-bs-toggle="offcanvas" data-bs-target="#bookmarkMenu" aria-controls="bookmarkMenu" role="button" onClick={() => setBookmarkActive(true)}>
                    <p className='d-flex align-items-center gap-2 p-0 m-0'>
                        <FontAwesomeIcon icon={faBookmark} className="icon" fixedWidth/>
                        Bookmarks
                    </p>
                </li>
                <li data-bs-toggle="offcanvas" data-bs-target="#effectsMenu" aria-controls="effectsMenu" role="button" className={is2D ? 'disabled' : ''}>
                    <p className='d-flex align-items-center gap-2 p-0 m-0'>
                        <FontAwesomeIcon icon={faMagic} className="icon" fixedWidth/>
                        Effects
                    </p>
                </li>
            </ul>
        </div>
        <LayerList />
        <Bookmark bookmarkActive={bookmarkActive} setBookmarkActive={setBookmarkActive} />
        <Effect />
    </>
    );
};

export default Menu;
