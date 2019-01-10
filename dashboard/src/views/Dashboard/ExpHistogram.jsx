import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { style } from 'variables/Variables.jsx';
import Plot from 'react-plotly.js';
import moment from 'moment';

class ExpHistogram extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
  };

  render() {
    const { data, width, height } = this.props;

    if (typeof data !== 'undefined' && data.length > 0) {
      var x = [];
      var y = [];

      data.forEach(function(row) {
        x.push(moment(row['date']).format('YYYY-MM'));
        y.push(row.count);
      });

      return (
        <div style={{ width: width, height: height }}>
          <Plot
            data={[
              {
                x: x,
                y: y,
                type: 'bar',
                marker: {
                  color: 'purple',
                },
              },
            ]}
            layout={{
              width: width,
              height: height,
              title: 'Exposure per period (placeholder)',
              xaxis: {
                title: 'Period',
              },
              yaxis: {
                title: 'Exposures',
              },
            }}
            config={{
              scrollZoom: true,
            }}
          />
        </div>
      );
    } else {
      return <div />;
    }
  }
}
export default ExpHistogram;
