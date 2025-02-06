import React, { useState, useRef } from 'react';
import ReactDOM from "react-dom";

const BookmarkEdit = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [distance, setDistance] = useState(100);
    const [color, setColor] = useState('#c8ff00');
    const [errors, setErrors] = useState({});
    const closeRef = useRef();

    const addNewBookmark = () => {
        if (!name) {
            setErrors({name:true});
            return;
        }
        onAdd(name, distance, color);
        setName('');
        setErrors({});
        closeRef.current.click();
    };

    return ReactDOM.createPortal(
        <div className="modal fade" id="bookmarkEditModal" tabIndex="-1" aria-labelledby="bookmarkEditModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="bookmarkEditModalLabel">Add new bookmark</h1>
                        <button ref={closeRef} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form id="bookmark-form" className="needs-validation" noValidate>
                            <div className="mb-3">
                                <label htmlFor="bookmark-name" className="col-form-label">Bookmark name:</label>
                                <input type="text" className={'form-control '+(errors.name && 'is-invalid')} id="bookmark-name"
                                       value={name}
                                       onChange={(e) => setName(e.target.value)}
                                       aria-describedby="bookmark-name-feedback"
                                       required/>
                               {errors.name && (
                                <div id="bookmark-name-feedback" className="invalid-feedback">
                                    Please enter the bookmark name.
                                </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="bookmark-distance" className="col-form-label">View distance: {distance} meter</label>
                                <input type="range" className="form-range" id="bookmark-distance"  min="50" max="1000" step="50"
                                       value={distance}
                                       onChange={(e) => setDistance(e.target.value)}/>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="GFG_Color" className="form-label">
                                    Select Color
                                </label>
                                <input type="color" className="form-control"
                                       list="colors" id="GFG_Color"
                                       placeholder="Select Color"
                                       value={color}
                                       onChange={(e) => setColor(e.target.value)}/>
                                    <datalist id="colors">
                                        <option value="#c8ff00"></option>
                                        <option value="#ff0000"></option>
                                        <option value="#00ff00"></option>
                                        <option value="#0000ff"></option>
                                        <option value="#660000"></option>
                                        <option value="#006600"></option>
                                        <option value="#000066"></option>
                                        <option value="#cc0000"></option>
                                        <option value="#00cc00"></option>
                                        <option value="#0034af"></option>
                                    </datalist>
                            </div>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" onClick={() => addNewBookmark()}>Create bookmark</button>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById("modal-root")
    );
};

export default BookmarkEdit;