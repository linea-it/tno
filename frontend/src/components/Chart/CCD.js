import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import useStyles from './styles';

function CCD({ data, width, height }) {
  const classes = useStyles();

  const rows = [];

  data.ccds.forEach((row, i) => {
    let showlegend = false;
    if (i === 0) {
      showlegend = true;
    }
    rows.push({
      x: row.x,
      y: row.y,
      mode: 'lines',
      line: {
        color: '#3972b3',
      },
      type: 'scatter',
      name: 'CCDs',
      showlegend,
      legendgroup: 'CCDs',
      hoverinfo: 'skip',
    });
  });

  rows.push({
    x: data.asteroidsInside.x,
    y: data.asteroidsInside.y,
    mode: 'markers',
    type: 'scatter',
    name: 'Small Bodies Inside CCD',
    marker: {
      color: '#008000',
    },
    text: data.asteroidsInside.ccdnum.map((ccdnum) => `CCD Number: ${ccdnum}`),
  });

  rows.push({
    x: data.asteroidsOutside.x,
    y: data.asteroidsOutside.y,
    mode: 'markers',
    type: 'scatter',
    name: 'Small Bodies Outside CCD',
    marker: {
      color: '#333',
    },
  });

  rows.push({
    x: [null],
    y: [null],
    name: 'Query Limit',
    mode: 'lines',
    showlegend: true,
    hoverinfo: 'skip',
    line: {
      color: 'rgba(255, 26, 26, 0.7)',
    },
  });

  // width = !width ? height : width;

  return (
    <Plot
      data={rows}
      className={classes.plotWrapper}
      layout={{
        title: 'Cone Search',
        width,
        height,
        hovermode: 'closest',
        autosize: true,
        xaxis: {
          title: 'RA (º)',
          nticks: 5,
          scaleanchor: 'y',
        },
        yaxis: {
          title: 'Dec (º)',
          nticks: 5,
          // scaleanchor: 'x',
        },
        shapes: [
          {
            opacity: 0.5,
            xref: 'x',
            yref: 'y',
            x0: data.asteroidsLimit.x[0],
            y0: data.asteroidsLimit.y[0],
            x1: data.asteroidsLimit.x[1],
            y1: data.asteroidsLimit.y[1],
            type: 'circle',
            line: {
              color: '#ff1a1a',
            },
          },
        ],
      }}
      config={{
        scrollZoom: false,
        displaylogo: false,
        responsive: true,
      }}
    />
  );
}

CCD.defaultProps = {
  width: null,
  height: 'auto',
};

CCD.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  data: PropTypes.shape({
    x: PropTypes.array,
    y: PropTypes.array,
  }).isRequired,
};

export default CCD;
