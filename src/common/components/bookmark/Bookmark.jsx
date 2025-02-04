import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPlus, faMinus, faTimes, faBookmark, faSearch, faAdd, faTrash} from '@fortawesome/free-solid-svg-icons';
import { MapContext } from '../../../MapContext';
import { fetchAllBookmarks, addBookmark, editBookmark, deleteBookmark } from "../../data/repositories/GeoserverRepository";
import BookmarkEdit from './BookmarkEdit'
import './Bookmark.css';

const Bookmark = () => {
    const { strategy } = useContext(MapContext);
    const [error, setError] = useState(null);
    const [error2, setError2] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadBookmarks(null);
    }, []);

    const loadBookmarks = async (keyword) => {
        try {
            const data = await fetchAllBookmarks(keyword);
            setBookmarks(data.features);
        }
        catch (error) {
            setError('Failed to load bookmarks');
            console.error(error);
        }
    };

    const addNewBookmark = (name, distance, color) => {
        let bookmark = strategy.createBookmark(name, distance, color);
        addBookmark(bookmark)
            .then(resp => {
                const featureIdElement = resp.querySelector("ogc\\:FeatureId, FeatureId");
                bookmark.id = featureIdElement ? featureIdElement.getAttribute("fid") : null;
                console.log(bookmark);
                let newBookmarks = bookmarks.slice();
                newBookmarks.unshift(bookmark);
                setBookmarks(newBookmarks);
                strategy.showBookmark(bookmark);
            })
            .catch(err => {
                setError2(err);
            })
    };

    const removeBookmark = (bookmark) => {
        deleteBookmark(bookmark)
            .then(resp => {
                setBookmarks(bookmarks.filter((bm, i) => bm.id !== bookmark.id));
                strategy.removeBookmark();
            })
            .catch(err => {
                setError2(err);
            })
    };

    return (
        <>
            <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1"
                 id="bookmarkMenu" aria-labelledby="bookmarkMenuLabel">
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="bookmarkMenuLabel">Bookmarks</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className="bookmark-actions">
                        <div className="hstack gap-3">
                            <input className="form-control me-auto" type="text"
                                   placeholder="Search bookmark..."
                                   aria-label="Search bookmark..."
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}/>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => loadBookmarks(searchQuery)}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                            <div className="vr"></div>
                            <button type="button" className="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#bookmarkEditModal">
                                <FontAwesomeIcon icon={faAdd} />
                            </button>
                        </div>
                    </div>
                    <div className="bookmark-items">
                        {error2 ? (<p style={{ color: 'red' }}>{error2}</p>) : ''}
                        {error ? (
                            <p style={{ color: 'red' }}>{error}</p>
                        )
                        : bookmarks.map((bookmark, index) => (
                        <div key={bookmark.id} className="bookmark-item">
                            <div className="bookmark-item-body" onClick={() => strategy.showBookmark(bookmark)}>
                                <div className="bookmark-item-icon">
                                    <FontAwesomeIcon icon={faBookmark} />
                                </div>
                                <div className="bookmark-item-name">
                                    {bookmark.properties.name}
                                </div>
                            </div>
                            <div className="bookmark-item-action" onClick={() => removeBookmark(bookmark)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            <BookmarkEdit onAdd={addNewBookmark}/>
        </>
    );
};

export default Bookmark;