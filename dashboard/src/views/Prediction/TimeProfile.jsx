// React e Prime React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { style } from 'variables/Variables.jsx';
import Plot from 'react-plotly.js';
import moment from 'moment';
class PredictionTimeProfile extends Component {
  state = this.initialState;

  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  get initialState() {
    return {};
  }

  getDates = dates => {
    if (dates) {
      return {
        name: dates.label,
        x: [
          dates.start,
          moment(dates.start)
            .add(dates.duration, 'seconds')
            .format('YYYY-MM-DD HH:mm:ss'),
        ],
        y: [1, 1],
        type: 'line',
        mode: 'lines+markers',
        marker: {
          color: '#dc0d0e',
        },
        line: {
          color: '#f66364',
        },
      };
    } else {
      return null;
    }
  };

  render() {
    const { data, width, height } = this.props;

    if (data === {}) {
      return <div />;
    }

    const dates = this.getDates(data.dates);

    return (
      <div style={{ width: width, height: height }}>
        <Plot
          data={[dates]}
          layout={{
            width: width,
            height: height,
            title: 'Time Profile',
            xaxis: {
              title: 'Execution Time',
            },
            yaxis: {
              title: 'Asteroids',
            },
          }}
          config={{
            scrollZoom: true,
          }}
        />
      </div>
    );
  }
}

export default PredictionTimeProfile;
