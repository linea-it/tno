// React e Prime React
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sizeMe from 'react-sizeme';
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

class RefineOrbitTimeProfile extends Component {
  state = this.initialState;

  static propTypes = {
    data: PropTypes.array.isRequired,
    size: PropTypes.array,
  };

  get initialState() {
    return {
      width: 200,
      height: 200,
    };
  }

  componentDidMount() {
    const { width } = this.props.size;
    let { height } = this.props.size;

    if (height === 0) {
      height = width / 2;
    }
    this.setState({
      width: width,
      height: height,
    });
  }

  render() {
    const { data } = this.props;

    if (data === {}) {
      return <div />;
    }
    return (
      <div>
        <ScatterChart
          width={this.state.width}
          height={this.state.height}
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
          {data.map(function(asteroid, index) {
            return (
              <Scatter
                key={index}
                name={asteroid.name}
                data={asteroid.points}
                fill={style.colors.primary}
                line={{ stroke: style.colors.info, strokeWidth: 1 }}
                shape="circle"
              />
            );
          })}
        </ScatterChart>
      </div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(RefineOrbitTimeProfile);
