import React from 'react'

const HelpDesk = ({ p1, p2, p3, p4, project, text }) => {
  const value =
    decodeURIComponent(p1) +
    decodeURIComponent(p2) +
    '@' +
    decodeURIComponent(p3) +
    '.' +
    decodeURIComponent(p4) +
    '?subject=' +
    project +
    ' Your subject goes here, immediately after this tag' // Decode the encoded email

  const handleClick = () => {
    window.location.href = `mailto:${value}`
  }

  return (
    <span onClick={handleClick} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
      {text}
    </span>
  )
}

export default HelpDesk
