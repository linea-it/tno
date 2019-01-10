import React, { Component } from 'react';
import Content from 'components/CardContent/CardContent.jsx';

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Label,
  Tooltip,
} from 'recharts';

import SunDistanceHistogram from './SunDistanceHistogram';

class SunDistance extends Component {
  render() {
    const propSet = this.props;
    return (
      <Content
        header={true}
        title="Histogram Asteroid-Sun distance"
        content={
          <SunDistanceHistogram
            data={propSet.data.histogram}
            width={480}
            height={360}
          />
        }
      />
    );
  }
}
export default SunDistance;
