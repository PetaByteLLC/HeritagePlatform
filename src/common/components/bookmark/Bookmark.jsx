import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faMinus,
    faTimes,
    faBookmark, faEllipsisV, faSearch, faAdd
} from '@fortawesome/free-solid-svg-icons';
import { MapContext } from '../../../MapContext';
import './Bookmark.css';

const geoServerConfig = {
    baseUrl: process.env.GEOSERVER_URL,
    wfsParams: {
        service: "WFS",
        version: "1.1.0",
        request: "GetFeature",
        typeName: "myworkspace:my_layer",
        outputFormat: "application/json",
    }
}

const Bookmark = ({ isOpen, onClose }) => {

    const [bookmarks, setBookmarks] = useState([
        {
            id: 1,
            name: "Bookmark name 1"
        },
        {
            id: 2,
            name: "Bookmark name 2"
        },
        {
            id: 3,
            name: "Bookmark name 3"
        },
        {
            id: 4,
            name: "Bookmark name 4"
        },
        {
            id: 5,
            name: "Bookmark name 5"
        }
    ]);

    // Удаление закладки
    const removeBookmark = (index) => {
        setBookmarks(bookmarks.filter((_, i) => i !== index));
    };

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1"
             id="bookmarkMenu" aria-labelledby="bookmarkMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="bookmarkMenuLabel">Bookmarks</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className="bookmark-actions">
                    <div className="hstack gap-3">
                        <input className="form-control me-auto" type="text" placeholder="Search bookmark..."
                               aria-label="Search bookmark..." />
                        <button type="button" className="btn btn-secondary">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <div className="vr"></div>
                        <button type="button" className="btn btn-outline-danger">
                            <FontAwesomeIcon icon={faAdd} />
                        </button>
                    </div>
                </div>
                <div className="bookmark-items">
                    {bookmarks.map((bookmark, index) => (
                    <div key={bookmark.id} className="bookmark-item">
                        <div className="bookmark-item-body">
                            <div className="bookmark-item-icon">
                                <FontAwesomeIcon icon={faBookmark} />
                            </div>
                            <div className="bookmark-item-name">
                                {bookmark.name}
                            </div>
                        </div>
                        <div className="bookmark-item-action" onClick={() => removeBookmark(index)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Bookmark;