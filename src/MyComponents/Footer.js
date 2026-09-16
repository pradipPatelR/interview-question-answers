import React from 'react'

export const Footer = () => {
  let footerStyle = {
    position: "fixed",
    bottom: "0",
    width: "100%",
    zIndex: 1030
  }
  return (
    <footer className="bg-body-tertiary text-body text-center py-3 border-top" style={footerStyle}>
      <p className="mb-0">Copyright &copy; https://interview-question-answers.vercel.app/. All rights reserved.</p>
    </footer>
  )
}