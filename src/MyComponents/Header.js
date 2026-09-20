import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from "react-router-dom";

export default function Header(props) {
  const [searchInput, setSearchInput] = useState(props.searchQuery || "");
  const location = useLocation();

  useEffect(() => {
    setSearchInput(props.searchQuery || "");
  }, [props.searchQuery]);

  let headerStyle = {
    position: "fixed",
    top: "0",
    width: "100%",
    zIndex: 1030
  }

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
              <Link className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`} aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/questions' ? 'active fw-bold' : ''}`} to="/questions">Questions</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/about' ? 'active fw-bold' : ''}`} to="/about">About</Link>
            </li>
            
            {props.showAddQA && (
              <li className="nav-item">
                <Link className="nav-link text-primary fw-bold" data-bs-toggle="modal" data-bs-target="#addQuestionAnswerModal" to="/questions">+ Add Q/A</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap">
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

            {/* New Login/Register Button */}
            <button className="btn btn-sm btn-outline-success fw-bold ms-lg-2" data-bs-toggle="modal" data-bs-target="#loginRegisterModal">
              Login / Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  searchBar: PropTypes.bool.isRequired,
  showAddQA: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string,
  onSearch: PropTypes.func,
  theme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired,
  minimal: PropTypes.bool
}