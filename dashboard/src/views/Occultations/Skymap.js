import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AladinPanel from 'components/Aladin/Panel';

class Skymap extends Component {
  static propTypes = {
    ra: PropTypes.any,
    dec: PropTypes.any,
  };

  render() {
    const { ra, dec } = this.props;

    let position = null;
    if (ra != null && dec != null) {
      position = ra + ' ' + dec;
    }

    // Nivel de Zoom
    const fov = 0.1;

    return (
      <div
        style={{ width: '100%', height: '500px', backgroundColor: '#d3d3d3' }}
      >
        <AladinPanel position={position} fov={fov} desfootprint={false} />
      </div>
    );
  }
}

export default Skymap;
