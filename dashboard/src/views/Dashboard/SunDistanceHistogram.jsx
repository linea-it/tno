import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';

class SunDistanceHistogram extends Component {
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
        x.push(row.bin);
        const a = Math.log(row.count) / Math.LN10;
        y.push(a.toExponential(4));
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
              legend: {},
              xaxis: {
                title: 'Heliocentric distance (AU)',
              },
              yaxis: {
                title: 'N Asteroids',
                tickprefix: '10^',
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
export default SunDistanceHistogram;
