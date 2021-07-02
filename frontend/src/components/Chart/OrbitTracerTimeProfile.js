import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import moment from 'moment';

function OrbitTracerTimeProfile({ data }) {
  const [rows, setRows] = useState([{ x: 0, y: 0 }]);

  const getHoverTemplate = (row) => {
    return `Stage: ${row.stage}<br />Start: ${moment(row.start).format(
      'L LTS'
    )}<br />Finish: ${moment(row.end).format(
      'L LTS'
    )}<br />Duration: ${moment.utc(row.exec_time * 1000).format('HH:mm:ss')}`;
  };

  useEffect(() => {
    if (data.length > 0) {
      const retrieveCcds = data
        .filter((row) => row.stage === 'retrieve_ccds')
        .map((row, i) => ({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Retrieve CCDs',
          line: {
            color: '#0B6A22',
          },
          x: [row.start, row.end],
          y: [i + 1, i + 1],
          showlegend: i === 0,
          legendgroup: 'Retrieve CCDs',
          hovertemplate: getHoverTemplate(row),
        }));

      const retrieveBspJpl = data
        .filter((row) => row.stage === 'retrieve_bsp_jpl')
        .map((row, i) => ({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Retrieve BSP JPL',
          line: {
            color: '#0C7FCA',
          },
          x: [row.start, row.end],
          y: [i + 1, i + 1],
          showlegend: i === 0,
          legendgroup: 'Retrieve BSP JPL',
          hovertemplate: getHoverTemplate(row),
        }));

      const theoreticalPositions = data
        .filter((row) => row.stage === 'theoretical_positions')
        .map((row, i) => ({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Theoretical Positions',
          line: {
            color: '#ff99ff',
          },
          x: [row.start, row.end],
          y: [i + 1, i + 1],
          showlegend: i === 0,
          legendgroup: 'Theoretical Positions',
          hovertemplate: getHoverTemplate(row),
        }));

      const matchPositions = data
        .filter((row) => row.stage === 'match_positions')
        .map((row, i) => ({
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Match Positions',
          line: {
            color: '#ac7339',
          },
          x: [row.start, row.end],
          y: [i + 1, i + 1],
          showlegend: i === 0,
          legendgroup: 'Match Positions',
          hovertemplate: getHoverTemplate(row),
        }));

      setRows(
        retrieveCcds.concat(
          retrieveBspJpl,
          theoreticalPositions,
          matchPositions
        )
      );
    }
  }, []);

  return (
    <Plot
      style={{
        width: '100%',
      }}
      data={rows}
      layout={{
        // width: 400,
        height: 400,
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

OrbitTracerTimeProfile.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      stage: PropTypes.string,
      start: PropTypes.string,
      finish: PropTypes.string,
    })
  ).isRequired,
};

export default OrbitTracerTimeProfile;
