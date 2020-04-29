import React from 'react';
import PropTypes from 'prop-types';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js';
import moment from 'moment';
import useStyles from './styles';

const colors = [
  '#996600',
  '#ff00ff',
  '#6600cc',
  '#FEAA00',
  '#1240AC',
  '#FF0100',
  '#00CC01',
  '#000000',
];

function AstrometryTimeProfile({ data, width, height }) {
  const classes = useStyles();
  const Plot = createPlotlyComponent(Plotly);

  const rows = [];
  let indexAxisY = 0;
  let firstAstometryCheck = true;

  const getColor = (stage) => {
    switch (stage) {
      case 'ccd_images':
        return colors[0];
      case 'bsp_jpl':
        return colors[1];
      case 'gaia_catalog':
        return colors[2];
      case 'header_extraction':
        return colors[3];
      case 'praia_astrometry':
        return colors[4];
      case 'praia_targets':
        return colors[5];
      case 'plots':
        return colors[6];
      default:
        return colors[3];
    }
  };

  const getCcdStage = (row) => {
    indexAxisY++;
    const axisY = indexAxisY;
    return [axisY, axisY];
  };

  const astometryLegendCheck = () => {
    if (firstAstometryCheck) {
      firstAstometryCheck = false;
      return true;
    }
    return false;
  };

  const getHoverTemplate = (row) => {
    return `</br>${row[0]}
      </br>Stage: ${row[5]}
      ${row[4] ? `</br>CCD: ${row[4]}` : ``}
      </br>Start: ${moment(row[1]).format('L LTS')}
      </br>Finish: ${moment(row[2]).format('L LTS')}
      </br>Duration: ${moment.utc(row[3] * 1000).format('HH:mm:ss')}`;
  };

  // const totalRunTime = moment(rows[rows.length - 1]) - moment(rows[0]);

  data.forEach((row) => {
    rows.push({
      type: 'scatter',
      mode: 'lines+markers',
      name: row[5],
      duration: moment.duration(row[3], 'seconds').humanize(),
      x: [row[1], row[2]],
      y: getCcdStage(row),
      line: {
        color: getColor(row[5]),
      },
      showlegend: !row[4] ? true : astometryLegendCheck(),
      legendgroup: row[4] ? 'Praia_astrometry' : row[5],
      hovertemplate: getHoverTemplate(row),
    });
  });

  return (
    <Plot
      className={classes.plotWrapper}
      data={rows}
      layout={{
        width,
        height,
        xaxis: {
          automargin: true,
          autorange: true,
        },
        yaxis: {
          automargin: true,
          autorange: true,
          showticklabels: false,
        },
        hovermode: 'closest',
        autosize: true,
      }}
      config={{
        scrollZoom: false,
        displaylogo: false,
        responsive: true,
      }}
    />
  );
}

AstrometryTimeProfile.defaultProps = {
  width: 500,
  height: 310,
};

AstrometryTimeProfile.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.arrayOf([PropTypes.array]).isRequired,
};

export default AstrometryTimeProfile;
