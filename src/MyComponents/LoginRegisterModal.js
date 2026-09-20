import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginRegisterModal = () => {
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Register Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation Helpers
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Button Enable/Disable Logic
    const isLoginValid = isValidEmail(loginEmail) && loginPassword.trim().length > 0;
    const isRegisterValid = 
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        isValidEmail(regEmail) &&
        regPassword.trim().length > 0 &&
        regPassword === confirmPassword;

    const navigate = useNavigate();

    // Forgot Password Logic (Requires valid email to trigger)
    const handleForgotPassword = () => {
        if (isValidEmail(loginEmail)) {
            // Close the modal
            const closeBtn = document.querySelector('#loginRegisterModal .btn-close');
            if (closeBtn) closeBtn.click();
            
            // Navigate to reset password page
            navigate('/reset-password');
        } else {
            alert("Please enter a valid Email Id first to reset your password.");
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'login' && isLoginValid) {
            console.log("Logging in...", { loginEmail, loginPassword, rememberMe });
            alert("Login Successful!");
        } else if (activeTab === 'register' && isRegisterValid) {
            console.log("Registering...", { firstName, lastName, regEmail, regPassword });
            alert("Registration Successful!");
        }
    };

    const resetForm = () => {
        setLoginEmail(''); setLoginPassword(''); setRememberMe(false);
        setFirstName(''); setLastName(''); setRegEmail(''); setRegPassword(''); setConfirmPassword('');
        setShowLoginPassword(false); setShowRegPassword(false); setShowConfirmPassword(false);
        setActiveTab('login');
    };

    return (
        <div className="modal fade" id="loginRegisterModal" tabIndex="-1" aria-labelledby="loginRegisterModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header pb-0 border-bottom-0">
                        <ul className="nav nav-tabs w-100" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link fw-bold ${activeTab === 'login' ? 'active' : ''}`} onClick={() => setActiveTab('login')} type="button">Login</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link fw-bold ${activeTab === 'register' ? 'active' : ''}`} onClick={() => setActiveTab('register')} type="button">Register</button>
                            </li>
                        </ul>
                        <button type="button" className="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                    </div>

                    <div className="modal-body pt-4">
                        <form onSubmit={handleFormSubmit}>
                            {/* LOGIN VIEW */}
                            {activeTab === 'login' && (
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label">Email Id</label>
                                        <input type="email" className="form-control" placeholder="Enter your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <div className="input-group">
                                            <input 
                                                type={showLoginPassword ? "text" : "password"} 
                                                className="form-control" 
                                                placeholder="Enter password" 
                                                value={loginPassword} 
                                                onChange={(e) => setLoginPassword(e.target.value)} 
                                                required 
                                            />
                                            <button 
                                                className="btn btn-outline-secondary" 
                                                type="button" 
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                title={showLoginPassword ? "Hide password" : "Show password"}
                                            >
                                                {showLoginPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ cursor: 'pointer' }} />
                                            <label className="form-check-label user-select-none" htmlFor="rememberMe" style={{ cursor: 'pointer' }}>Remember me</label>
                                        </div>
                                        <span 
                                            className={`text-decoration-underline ${isValidEmail(loginEmail) ? 'text-primary' : 'text-muted'}`} 
                                            style={{ cursor: isValidEmail(loginEmail) ? 'pointer' : 'not-allowed', fontSize: '0.9rem' }} 
                                            onClick={isValidEmail(loginEmail) ? handleForgotPassword : null}
                                            title={isValidEmail(loginEmail) ? "Click to reset password" : "Enter a valid email to enable"}
                                        >
                                            Forgot password?
                                        </span>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={!isLoginValid}>Login</button>
                                </div>
                            )}

                            {/* REGISTER VIEW */}
                            {activeTab === 'register' && (
                                <div>
                                    <div className="row mb-3">
                                        <div className="col">
                                            <label className="form-label">First Name</label>
                                            <input type="text" className="form-control" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">Last Name</label>
                                            <input type="text" className="form-control" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Email Id</label>
                                        <input type="email" className="form-control" placeholder="Enter valid email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <div className="input-group">
                                            <input 
                                                type={showRegPassword ? "text" : "password"} 
                                                className="form-control" 
                                                placeholder="Create password" 
                                                value={regPassword} 
                                                onChange={(e) => setRegPassword(e.target.value)} 
                                                required 
                                            />
                                            <button 
                                                className="btn btn-outline-secondary" 
                                                type="button" 
                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                                title={showRegPassword ? "Hide password" : "Show password"}
                                            >
                                                {showRegPassword ? <i className="fa fa-eye-slash"></i> : <i className="fa fa-eye"></i>}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Confirm Password</label>
                                        <div className="input-group">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                className="form-control" 
                                                placeholder="Confirm password" 
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
                                        {regPassword && confirmPassword && regPassword !== confirmPassword && (
                                            <small className="text-danger mt-1 d-block">Passwords do not match.</small>
                                        )}
                                    </div>
                                    <button type="submit" className="btn btn-success w-100 fw-bold" disabled={!isRegisterValid}>Register</button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};