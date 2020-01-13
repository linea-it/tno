import React from 'react';
import PropTypes from 'prop-types';
import Panel from '../../lib/Aladin/Panel';

function CustomSkymap({ ra, dec }) {
  // Zoom Level:
  const fov = 0.1;

  return (
    <div
      style={{ width: '100%', height: '701px', backgroundColor: '#d3d3d3' }}
    >
      <Panel position={`${ra} ${dec}`} fov={fov} desfootprint />
    </div>
  );
}

CustomSkymap.propTypes = {
  ra: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  dec: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

export default CustomSkymap;
