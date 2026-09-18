import React from 'react';

export const About = () => {
  return (
    <div className="container my-4 my-md-5 pt-3 pt-md-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border p-4" style={{ borderRadius: '12px' }}>
            <h2 className="fw-bold text-primary mb-3 text-center">About This Application</h2>
            <p className="lead text-center mb-4">
              An interactive Interview Questions & Answers platform equipped with Speech-to-Text and Text-to-Speech practice.
            </p>
            
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="p-3 border rounded-3 bg-body-tertiary h-100" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold">🎙️ Real-time Practice</h6>
                  <p className="small text-muted mb-0">Speak your answers and test your accuracy percentage live against target answers.</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 border rounded-3 bg-body-tertiary h-100" style={{ borderRadius: '12px' }}>
                  <h6 className="fw-bold">☁️ Cloud Persistence</h6>
                  <p className="small text-muted mb-0">Your questions are saved securely via Supabase backend integration.</p>
                </div>
              </div>
            </div>

            <div className="border-top pt-3 text-center text-muted small">
              Created by <strong>Pradip Patel</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};