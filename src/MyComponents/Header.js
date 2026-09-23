import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from "react-router-dom";
import { supabase } from '../supabaseClient';

export default function Header(props) {
  const [searchInput, setSearchInput] = useState(props.searchQuery || "");
  const location = useLocation();

  useEffect(() => {
    setSearchInput(props.searchQuery || "");
  }, [props.searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  let headerStyle = {
    position: "fixed",
    top: "0",
    width: "100%",
    zIndex: 1030
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    props.onSearch(searchInput);
  };

  if (props.minimal) {
    return (
      <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom" style={headerStyle}>
        <div className="container-fluid d-flex justify-content-center">
          <Link className="navbar-brand fw-bold m-0" to="/">{props.title}</Link>
        </div>
      </nav>
    );
  }

  const user = props.session?.user;
  const displayName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email;

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom" style={headerStyle}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">{props.title}</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/questions' ? 'active fw-bold' : ''}`} to="/questions">Questions</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/about' ? 'active fw-bold' : ''}`} to="/about">About</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap ms-lg-auto">
            {!user && (
              <div className="dropdown me-lg-2">
                <button 
                  className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  {props.theme === 'light' && <><i className="fa fa-sun-o"></i> Light</>}
                  {props.theme === 'dark' && <><i className="fa fa-moon-o"></i> Dark</>}
                  {props.theme === 'system' && <><i className="fa fa-desktop"></i> System</>}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ minWidth: 'auto' }}>
                  <li>
                    <button className={`dropdown-item ${props.theme === 'light' ? 'active' : ''}`} onClick={() => props.onThemeChange('light')}>
                      <i className="fa fa-sun-o me-2"></i> Light
                    </button>
                  </li>
                  <li>
                    <button className={`dropdown-item ${props.theme === 'dark' ? 'active' : ''}`} onClick={() => props.onThemeChange('dark')}>
                      <i className="fa fa-moon-o me-2"></i> Dark
                    </button>
                  </li>
                  <li>
                    <button className={`dropdown-item ${props.theme === 'system' ? 'active' : ''}`} onClick={() => props.onThemeChange('system')}>
                      <i className="fa fa-desktop me-2"></i> System
                    </button>
                  </li>
                </ul>
              </div>
            )}

            {props.searchBar && (
              <form className="d-flex" role="search" onSubmit={handleSearchSubmit}>
                <input
                  className="form-control me-2 form-control-sm"
                  type="search"
                  placeholder="Search..."
                  aria-label="Search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button className="btn btn-sm btn-outline-primary" type="submit">Search</button>
              </form>
            )}

            {user ? (
              <div className="dropdown ms-lg-2">
                <button 
                  className="btn btn-link text-body p-0 border-0" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fa fa-user-circle fa-2x"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm mt-2">
                  <li className="dropdown-item-text text-start border-bottom pb-2 mb-2">
                    <div className="fw-bold">{displayName}</div>
                    <div className="small text-muted fw-normal">{user.email}</div>
                  </li>
                  <li className="px-3 py-1 dropdown-item-text d-flex justify-content-between align-items-center">
                    <span className="small me-2">Theme</span>
                    <select 
                      className="form-select form-select-sm w-auto cursor-pointer" 
                      value={props.theme} 
                      onChange={(e) => props.onThemeChange(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </li>
                  <li>
                    <Link className="dropdown-item" data-bs-toggle="modal" data-bs-target="#addQuestionAnswerModal" to="#">
                      <i className="fa fa-plus-circle me-2 text-primary"></i> Add Q/A
                    </Link>
                  </li>
                  
                  <li>
                    <button className="dropdown-item" data-bs-toggle="modal" data-bs-target="#editProfileModal">
                      <i className="fa fa-edit me-2 text-secondary"></i> Edit Profile
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger fw-bold" onClick={handleLogout}>
                      <i className="fa fa-sign-out me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button 
                className="btn btn-sm btn-outline-success ms-lg-2 d-flex align-items-center justify-content-center" 
                data-bs-toggle="modal" 
                data-bs-target="#loginRegisterModal" 
                title="Login / Register"
                style={{ width: '38px', height: '38px' }}
              >
                <i className="fa fa-sign-in fa-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

Header.propTypes = {
  title: PropTypes.string,
  searchBar: PropTypes.bool.isRequired,
  showAddQA: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string,
  onSearch: PropTypes.func,
  theme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired,
  minimal: PropTypes.bool,
  session: PropTypes.object
};