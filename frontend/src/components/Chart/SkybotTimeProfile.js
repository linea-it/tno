import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import moment from 'moment';

function SkybotTimeProfile({ data }) {
  const [rows, setRows] = useState([{ x: 0, y: 0 }]);

  const getHoverTemplate = (row) => {
    return `
      </br>Exposure: ${row.exposure}
      </br>Positions: ${row.positions}
      </br>Start: ${moment(row.start).format('L LTS')}
      </br>Finish: ${moment(row.end).format('L LTS')}
      </br>Duration: ${moment
        .utc(row.execution_time * 1000)
        .format('HH:mm:ss')}`;
  };

  const loadRows = () => {
    const { requests, loaddata } = data;

    if (requests.length > 0 && loaddata.length > 0) {
      const requestsRows = requests.map((request, i) => ({
        type: 'scattergl',
        mode: 'lines+markers',
        name: 'Requests',
        line: {
          color: '#0B6A22',
        },
        x: [request.start, request.finish],
        y: [i, i],
        showlegend: i === 0,
        legendgroup: 'Requests',
        hovertemplate: getHoverTemplate(request),
      }));

      const loaddataRows = loaddata.map((load, i) => ({
        type: 'scattergl',
        mode: 'lines+markers',
        name: 'Load Data',
        line: {
          color: '#0C7FCA',
        },
        x: [load.start, load.finish],
        y: [i, i],
        showlegend: i === 0,
        legendgroup: 'Load Data',
        hovertemplate: getHoverTemplate(load),
      }));
      return requestsRows.concat(loaddataRows);
    }
    return null;
  };

  useEffect(() => {
    const result = loadRows();
    if (result !== null) setRows(result);
  }, [data, loadRows]);

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

SkybotTimeProfile.propTypes = {
  data: PropTypes.shape({
    requests: PropTypes.arrayOf(
      PropTypes.shape({
        exposure: PropTypes.number,
        start: PropTypes.string,
        finish: PropTypes.string,
        execution_time: PropTypes.number,
        positions: PropTypes.number,
      })
    ),
    loaddata: PropTypes.arrayOf(
      PropTypes.shape({
        exposure: PropTypes.number,
        start: PropTypes.string,
        finish: PropTypes.string,
        execution_time: PropTypes.number,
        positions: PropTypes.number,
      })
    ),
  }).isRequired,
};

export default SkybotTimeProfile;
