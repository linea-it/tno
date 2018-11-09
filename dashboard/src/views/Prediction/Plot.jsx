import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import PropTypes from 'prop-types';
// import { rows } from './dataPredict.js';
// import { rows2 } from './dataPredict2.js';

class PlotPrediction extends Component {
  static propTypes = {
    positions: PropTypes.array.isRequired,
    stars: PropTypes.array.isRequired,
  };

  render() {
    const positions_ra = [];
    const positions_dec = [];
    const stars_ra = [];
    const stars_dec = [];

    const positions = this.props.positions;
    const radius = [];

    const radiusx0 = [];
    const radiusy0 = [];
    const radiusx1 = [];
    const radiusy1 = [];

    positions.map((row, i) => {
      if (row) {
        // pontos
        positions_ra.push(row[0]);
        positions_dec.push(row[1]);

        // Shapes
        radius.push({
          type: 'circle',
          xref: 'x',
          yref: 'y',
          x0: row[0] - 0.15,
          y0: row[1] - 0.15,
          x1: row[0] + 0.15,
          y1: row[1] + 0.15,
          opacity: 0.4,
          // fillcolor: 'blue',
          line: {
            color: '#f66364',
          },
        });
      }
    });

    const stars = this.props.stars;
    stars.map((row, i) => {
      if (row) {
        stars_ra.push(row[0]);
        stars_dec.push(row[1]);
      }
    });

    return (
      <Plot
        data={[
          {
            name: 'Stars',
            x: stars_ra,
            y: stars_dec,
            type: 'scatter',
            mode: 'markers',
            marker: {
              color: '#5899DA',
              opacity: 0.7,
              size: 4,
            },
          },
          {
            name: 'Ephemeris',
            x: positions_ra,
            y: positions_dec,
            type: 'line',
            mode: 'lines+markers',
            marker: {
              color: '#dc0d0e',
            },
            line: {
              color: '#f66364',
            },
          },
        ]}
        layout={{
          width: 640,
          height: 480,
          title: 'Catalog',
          xaxis: {
            title: 'RA (deg)',
          },
          yaxis: {
            title: 'Dec (deg)',
          },
          shapes: radius,
        }}
        config={{
          scrollZoom: true,
        }}
      />
    );
  }
}

export default PlotPrediction;
