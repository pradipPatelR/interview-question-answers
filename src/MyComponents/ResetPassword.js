import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const navigate = useNavigate();

    const isFormValid = newPassword.trim().length > 0 && newPassword === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        // Live Password Update with Supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        setLoading(false);

        if (error) {
            setErrorMessage(error.message);
        } else {
            setSuccessMessage("Password successfully updated! Redirecting to home page...");
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }
    };

    return (
        <div className="container mt-5 pt-5 mb-5 pb-5 d-flex justify-content-center">
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '500px' }}>
                <h3 className="text-center mb-4 fw-bold">Reset Password</h3>

                {errorMessage && <div className="alert alert-danger py-2 small">{errorMessage}</div>}
                {successMessage && <div className="alert alert-success py-2 small">{successMessage}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">New Password</label>
                        <div className="input-group">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control" 
                                placeholder="Enter new password" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold">Confirm Password</label>
                        <div className="input-group">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                className="form-control" 
                                placeholder="Confirm new password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
                            </button>
                        </div>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <small className="text-danger mt-1 d-block">Passwords do not match.</small>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={!isFormValid || loading}>
                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};