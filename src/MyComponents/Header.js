import React from 'react'
import PropTypes from 'prop-types'
import { Link } from "react-router-dom";

export default function Header(props) {
  let headerStyle = {
    position: "fixed",
    top: "0",
    width: "100%"
  }
  return (
    <nav className="navbar navbar-expand-lg bg-primary" data-bs-theme="dark" style={headerStyle}>
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">{props.title}</Link>
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
            {props.searchBar ? (
              <form className="d-flex" role="search" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  value={props.searchQuery}
                  onChange={(e) => props.onSearch(e.target.value)}
                />
                <button className="btn btn-outline-light" type="submit">Search</button>
              </form>
            ) : ("")}
          </div>
        </div>
      </nav>
  )
}


Header.propTypes = {
    title: PropTypes.string,
    searchBar: PropTypes.bool.isRequired,
    searchQuery: PropTypes.string,
    onSearch: PropTypes.func
}