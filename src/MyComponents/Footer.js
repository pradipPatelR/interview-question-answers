import React from 'react'

export const Footer = () => {
  let footerStyle = {
    position: "fixed",
    bottom: "0",
    width: "100%"
  }
  return (
    <footer className="bg-dark text-light text-center py-3" style={footerStyle}>
      <p className="mb-0">Copyright &copy; InterviewQuestionsAnswers-2026.com. All rights reserved.</p>
    </footer>
  )
}

