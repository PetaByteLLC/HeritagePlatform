import React, { useState, useEffect, useContext, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faSearch, faAdd, faTrash, faEye, faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { MapContext } from '../../../MapContext';
import { fetchAllBookmarks, addBookmark, editBookmark, deleteBookmark } from "../../data/repositories/GeoserverRepository";
import BookmarkEdit from './BookmarkEdit'
import './Bookmark.css';

const Bookmark = () => {
    const { strategy, mode } = useContext(MapContext);
    const [error, setError] = useState(null);
    const [error2, setError2] = useState(null);
    const [errorAdd, setErrorAdd] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const modalBtnRef = useRef();

    useEffect(() => {
        loadBookmarks(null);
    }, []);

    useEffect(() => {
        if (strategy) {
            strategy.removeBookmark();
        }
    }, [strategy, mode]);

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

    const showAddBookmark = () => {
        if (mode === '2D' && !strategy.coordinate) {
            setErrorAdd('Please select a point on map.');
            return;
        }
        setErrorAdd('');
        modalBtnRef.current.click();
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

    const showBookmark = (bookmark) => {
        strategy.showBookmark(bookmark);
    };

    const viewBookmark = (bookmark) => {
        strategy.viewBookmark(bookmark);
    };

    const clearBookmark = () => {
        strategy.removeBookmark();
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
                    <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => clearBookmark()}></button>
                </div>
                <div className="offcanvas-body">
                    <div className="bookmark-actions">
                        <div className="hstack gap-3">
                            <input className="form-control me-auto" type="search"
                                   placeholder="Search bookmark..."
                                   aria-label="Search bookmark..."
                                   value={searchQuery}
                                   onChange={(e) => setSearchQuery(e.target.value)}/>
                            <button type="button" className="btn btn-secondary"
                                    onClick={() => loadBookmarks(searchQuery)}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                            <div className="vr"></div>
                            <button type="button" ref={modalBtnRef} className="hidden" data-bs-toggle="modal" data-bs-target="#bookmarkEditModal">
                            </button>
                            <button type="button" className="btn btn-outline-success" onClick={() => showAddBookmark()}>
                                <FontAwesomeIcon icon={faAdd} />
                            </button>
                        </div>
                        {errorAdd && (<div className="alert alert-danger alert-dismissible mt-3 mb-0" role="alert">
                            <div>{errorAdd}</div>
                            <button type="button" className="btn-sm btn-close" onClick={()=>setErrorAdd('')}></button>
                        </div>)}
                    </div>
                    <div className="bookmark-items">
                        {error2 ? (<p style={{ color: 'red' }}>{error2}</p>) : ''}
                        {error ? (
                            <p style={{ color: 'red' }}>{error}</p>
                        )
                        : bookmarks.map((bookmark, index) => (
                        <div key={bookmark.id} className="bookmark-item">
                            <div className="bookmark-item-body">
                                <div className="bookmark-item-icon">
                                    <FontAwesomeIcon icon={faBookmark} />
                                </div>
                                <div className="bookmark-item-name">
                                    {bookmark.properties.name}
                                </div>
                            </div>
                            <div className="bookmark-item-action">
                                <div className="hstack gap-1">
                                    <button type="button" className="btn btn-sm btn-outline-success btn-square-sm" onClick={() => showBookmark(bookmark)}
                                            title="Find bookmark">
                                        <FontAwesomeIcon icon={faMousePointer} />
                                    </button>
                                    {mode === '3D' && (<button type="button" className="btn btn-sm btn-outline-success btn-square-sm" onClick={() => viewBookmark(bookmark)}
                                                               title="View bookmark">
                                        <FontAwesomeIcon icon={faEye} />
                                    </button>)}
                                    <button type="button" className="btn btn-sm btn-outline-danger btn-square-sm" onClick={() => removeBookmark(bookmark)}
                                            title="Delete bookmark">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
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