import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

export const Footer = () => {
  const [visitCount, setVisitCount] = useState(0);
  const isExecuted = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode (Dev Mode)
    if (isExecuted.current) return;
    isExecuted.current = true;

    const handleVisitCount = async () => {
      const hasVisitedSession = sessionStorage.getItem('has_visited_session');

      if (!hasVisitedSession) {
        // Set flag synchronously BEFORE initiating the async database call
        sessionStorage.setItem('has_visited_session', 'true');

        const { data, error } = await supabase.rpc('increment_page_visit', {
          page_name_input: 'global',
        });

        if (!error && data !== null) {
          setVisitCount(data);
        } else {
          fetchCurrentCount();
        }
      } else {
        fetchCurrentCount();
      }
    };

    const fetchCurrentCount = async () => {
      const { data, error } = await supabase
        .from('site_stats')
        .select('visit_count')
        .eq('page_name', 'global')
        .single();

      if (!error && data) {
        setVisitCount(data.visit_count);
      }
    };

    handleVisitCount();
  }, []);

  let footerStyle = {
    position: 'fixed',
    bottom: '0',
    width: '100%',
    zIndex: 1030,
  };

  // Keep a minimum width of 6 digits, but allow the value to grow beyond 6 digits
  // (e.g., 12 -> ['0','0','0','0','1','2'], 1000000 -> ['1','0','0','0','0','0','0'])
  const normalizedCount = Math.max(0, Number(visitCount) || 0);
  const digits = String(normalizedCount).padStart(6, '0').split('');

  return (
    <footer className="bg-body-tertiary text-body py-2 border-top" style={footerStyle}>
      <div className="container-fluid d-flex align-items-center justify-content-between px-3">
        {/* Left Side: Capitalized Title & Square Box Counter */}
        <div className="counter-wrapper">
          <span className="counter-title">VISIT COUNT</span>
          <div className="square-counter" title="Total Website Visits">
            {digits.map((digit, index) => (
              <span key={index} className="square-digit">
                {digit}
              </span>
            ))}
          </div>
        </div>

        {/* Center / Right Side: Copyright Text */}
        <div className="text-center flex-grow-1 me-md-5">
          <p className="mb-0 small text-muted">
            Copyright &copy; interview-question-answers.vercel.app. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};