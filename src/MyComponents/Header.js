import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from "react-router-dom";

export default function Header(props) {
  const [searchInput, setSearchInput] = useState(props.searchQuery || "");

  // Sync local input with parent search query (e.g., if cleared by Escape key)
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
              <Link className="nav-link active" aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" data-bs-toggle="modal" data-bs-target="#addQuestionAnswerModal" to="/">Add Q/A</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Theme Selector */}
            <div className="d-flex align-items-center me-lg-2">
              <select
                className="form-select form-select-sm"
                value={props.theme}
                onChange={(e) => props.onThemeChange(e.target.value)}
                aria-label="Theme mode selector"
              >
                <option value="light">☀️ Light</option>
                <option value="dark">🌙 Dark</option>
                <option value="system">💻 System</option>
              </select>
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
          </div>
        </div>
      </div>
    </nav>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  searchBar: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string,
  onSearch: PropTypes.func,
  theme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired
}