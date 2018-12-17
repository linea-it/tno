// React e Prime React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { style } from 'variables/Variables.jsx';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

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
      let points = [
        {
          x: 1,
          y:1
        },
        {
          x: 2,
          y: 1
        },
      ]
  
      return (
        <Scatter
          key={0}
          name={dates.label}
          data={points}
          fill={style.colors.primary}
          line={{ stroke: style.colors.info, strokeWidth: 1 }}
          shape="circle"
        />
      );
    } else {
      return null;
    }

  };

  render() {
    const { data, width, height } = this.props;

    if (data === {}) {
      return <div />;
    }
    return (
      <div>
        <ScatterChart
          width={width}
          height={height}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid />
          <XAxis
            domain={[0, 'dataMax']}
            type="number"
            dataKey={'x'}
            name="Execution Time"
            unit="s"
            tickCount={10}
          />
          <YAxis
            domain={[0, 'dataMax +1']}
            type="number"
            dataKey={'y'}
            name="Asteroids"
            tick={false}
          />
          <ZAxis range={[10, 10]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          {this.getDates(data.dates)}
        </ScatterChart>
      </div>
    );
  }
}

export default PredictionTimeProfile;
