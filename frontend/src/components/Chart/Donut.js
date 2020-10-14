import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import useStyles from './styles';

function Donut({ data, width, height }) {
  const classes = useStyles();

  const colors = data.map((el) => el.color);

  const rows = [
    {
      labels: data.map((el) => el.name),
      values: data.map((el) => el.value),
      text: data.map((el) => el.title),
      marker: {
        colors:
          colors.length > 0
            ? colors
            : [
                colors[0],
                colors[7],
                colors[2],
                colors[3],
                colors[4],
                colors[20],
              ],
      },
      hole: 0.4,
      type: 'pie',
      textposition: 'inside',
      hoverinfo: 'label+text',
      sort: false,
    },
  ];

  return (
    <Plot
      data={rows}
      className={classes.plotWrapper}
      layout={{
        width,
        height,
        hovermode: 'closest',
        autosize: true,
      }}
      config={{
        scrollZoom: true,
        displaylogo: false,
        responsive: true,
      }}
    />
  );
}

Donut.defaultProps = {
  width: 450,
  height: 364,
};

Donut.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Donut;
