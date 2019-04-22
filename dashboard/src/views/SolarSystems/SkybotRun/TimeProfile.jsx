// React e Prime React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';

class SkybotTimeProfile extends Component {
  state = this.initialState;

  static propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  idx = 1;

  get initialState() {
    return {};
  }

  render() {
    const { data, width, height } = this.props;

    if (data === []) {
      return <div />;
    }

    let count = 0;
    const rows = [];
    data.map(row => {
      count += 1;
      if (row[1] === 1) {
        rows.push({
          name: row[0],
          x: [row[2], row[3]],
          y: [count, count],
          legendgroup: 'Download',
          type: 'scatter',
          mode: 'lines+markers',
          marker: {
            color: '#2196F3',
          },
          line: {
            color: '#64B5F6',
          },
          showlegend: false,
        });
      } else if (row[1] === 2) {
        rows.push({
          name: row[0],
          x: [row[2], row[3]],
          y: [count, count],
          legendgroup: 'Import',
          type: 'scatter',
          mode: 'lines+markers',
          marker: {
            color: '#009688',
          },
          line: {
            color: '#4DB6AC',
          },
          showlegend: false,
        });
      } else {
        rows.push({
          name: row[0],
          x: [row[2], row[3]],
          y: [count, count],
          legendgroup: 'Associate CCD',
          type: 'scatter',
          mode: 'lines+markers',
          marker: {
            color: '#900C3F',
          },
          line: {
            color: '#C70039',
          },
          showlegend: false,
        });
      }
      return row;
    })

    return (
      <div style={{ width: width, height: height }}>
        <Plot
          data={rows}
          layout={{
            width: width,
            height: height,
            title: 'Time Profile',
            xaxis: {
              title: 'Execution Time',
            },
            yaxis: {
              title: '',
            },
            hovermode: false,
          }}
          config={{
            scrollZoom: true,
          }}
        />
      </div>
    );
  }
}

export default SkybotTimeProfile;
