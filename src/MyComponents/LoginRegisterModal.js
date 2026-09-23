import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export const LoginRegisterModal = () => {
    const [activeTab, setActiveTab] = useState('login');

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Register Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UI Response Feedback
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isLoginValid = isValidEmail(loginEmail) && loginPassword.trim().length > 0;
    const isRegisterValid = 
        firstName.trim().length > 0 &&
        lastName.trim().length > 0 &&
        isValidEmail(regEmail) &&
        regPassword.trim().length > 0 &&
        regPassword === confirmPassword;

    const closeModal = () => {
        const closeBtn = document.querySelector('#loginRegisterModal .btn-close');
        if (closeBtn) closeBtn.click();
        resetForm();
    };

    // Live Supabase Reset Password Request
    // Live Supabase Reset Password Request
    const handleForgotPassword = async () => {
        if (!isValidEmail(loginEmail)) {
            setErrorMessage("Please enter a valid email address first to reset your password.");
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        // Step 1: Check if email exists in your database table
        const { data: userExists, error: checkError } = await supabase
            .from('profiles') // Replace 'profiles' with your user table name
            .select('email')
            .eq('email', loginEmail.trim().toLowerCase())
            .maybeSingle();

        if (checkError) {
            console.error("Error checking user existence:", checkError.message);
        }

        // If no user record was found
        if (!userExists) {
            setLoading(false);
            setErrorMessage("User is not found, please register.");
            return;
        }

        // Step 2: Email exists, trigger password reset email
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
            redirectTo: redirectUrl,
        });

        setLoading(false);

        if (error) {
            setErrorMessage(error.message);
        } else {
            setSuccessMessage("Password reset email sent! Check your inbox.");
        }
    };

    // Live Supabase Login & Register Action Handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        if (activeTab === 'login' && isLoginValid) {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            setLoading(false);
            if (error) {
                setErrorMessage(error.message);
            } else {
                closeModal();
            }
        } else if (activeTab === 'register' && isRegisterValid) {
            const { data, error } = await supabase.auth.signUp({
                email: regEmail,
                password: regPassword,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        provider_type: 'emailUser',
                    }
                }
            });

            setLoading(false);
            if (error) {
                setErrorMessage(error.message);
            } else if (data?.user && data?.session === null) {
                setSuccessMessage("Registration successful! Please check your email to confirm account creation.");
            } else {
                closeModal();
            }
        }
    };

    const resetForm = () => {
        setLoginEmail(''); setLoginPassword('');
        setFirstName(''); setLastName(''); setRegEmail(''); setRegPassword(''); setConfirmPassword('');
        setShowLoginPassword(false); setShowRegPassword(false); setShowConfirmPassword(false);
        setErrorMessage(''); setSuccessMessage(''); setLoading(false);
        setActiveTab('login');
    };

    return (
        <div className="modal fade" id="loginRegisterModal" tabIndex="-1" aria-labelledby="loginRegisterModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header pb-0 border-bottom-0">
                        <ul className="nav nav-tabs w-100" id="myTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link fw-bold ${activeTab === 'login' ? 'active' : ''}`} onClick={() => { setActiveTab('login'); setErrorMessage(''); setSuccessMessage(''); }} type="button">Login</button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button className={`nav-link fw-bold ${activeTab === 'register' ? 'active' : ''}`} onClick={() => { setActiveTab('register'); setErrorMessage(''); setSuccessMessage(''); }} type="button">Register</button>
                            </li>
                        </ul>
                        <button type="button" className="btn-close position-absolute top-0 end-0 m-3" data-bs-dismiss="modal" aria-label="Close" onClick={resetForm}></button>
                    </div>

                    <div className="modal-body pt-4">
                        {errorMessage && <div className="alert alert-danger py-2 small">{errorMessage}</div>}
                        {successMessage && <div className="alert alert-success py-2 small">{successMessage}</div>}

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
                                    <div className="d-flex justify-content-end align-items-center mb-4">
                                        <span 
                                            className={`text-decoration-underline ${isValidEmail(loginEmail) ? 'text-primary' : 'text-muted'}`} 
                                            style={{ cursor: isValidEmail(loginEmail) ? 'pointer' : 'not-allowed', fontSize: '0.9rem' }} 
                                            onClick={isValidEmail(loginEmail) && !loading ? handleForgotPassword : null}
                                            title={isValidEmail(loginEmail) ? "Click to send reset password email" : "Enter a valid email to enable"}
                                        >
                                            Forgot password?
                                        </span>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={!isLoginValid || loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Login"}
                                    </button>
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
                                    <button type="submit" className="btn btn-success w-100 fw-bold" disabled={!isRegisterValid || loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Register"}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};