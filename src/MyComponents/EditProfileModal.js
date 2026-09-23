import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function EditProfileModal({ session }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setFirstName(session.user.user_metadata?.first_name || '');
            setLastName(session.user.user_metadata?.last_name || '');
        }
    }, [session]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const updateData = {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                }
            };

            if (password.trim() !== '') {
                updateData.password = password;
            }

            const { error } = await supabase.auth.updateUser(updateData);

            if (error) throw error;
        
            setSuccessMessage('Profile updated successfully!');
            // clear password field after update
            setPassword('');
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setErrorMessage('');
        setSuccessMessage('');
        setPassword('');
        setShowPassword(false);
        if (session?.user) {
            setFirstName(session.user.user_metadata?.first_name || '');
            setLastName(session.user.user_metadata?.last_name || '');
        }
    };

    return (
        <div className="modal fade" id="editProfileModal" tabIndex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold" id="editProfileModalLabel">Edit Profile</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                    </div>

                    <div className="modal-body pt-4">
                        {errorMessage && <div className="alert alert-danger py-2 small">{errorMessage}</div>}
                        {successMessage && <div className="alert alert-success py-2 small">{successMessage}</div>}

                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    placeholder="Enter your last name"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">New Password (optional)</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
                                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
