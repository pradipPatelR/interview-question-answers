import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const isFormValid = newPassword.trim().length > 0 && newPassword === confirmPassword;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            alert("Password successfully reset!");
            navigate("/"); // Redirect to home
        }
    };

    return (
        <div className="container mt-5 pt-5 mb-5 pb-5 d-flex justify-content-center">
            <div className="card shadow-sm p-4 w-100" style={{ maxWidth: '500px' }}>
                <h3 className="text-center mb-4 fw-bold">Reset Password</h3>
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
                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={!isFormValid}>
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};
