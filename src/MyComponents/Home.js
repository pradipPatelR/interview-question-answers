import React from 'react';

export const Home = () => {
  return (
    <div className="container mt-4 mt-md-5 pt-4 pt-md-5 text-center px-3 px-md-4">
      <h1 className="display-5 fw-bold text-primary mb-3 mb-md-4">
        Welcome to Interview Prep!
      </h1>
      <p className="lead mb-4 px-md-5 mx-md-5 text-wrap">
        Master your interview skills by curating, practicing, and reviewing top interview questions and answers.
      </p>
      <img 
        src={process.env.PUBLIC_URL + '/logo192.png'} 
        alt="Welcome Hero" 
        className="img-fluid mb-5 mt-2 mt-md-3" 
        style={{ maxWidth: '200px', width: '50vw', height: 'auto' }} 
      />
    </div>
  );
};