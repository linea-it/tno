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

class SunDistance extends Component {
  render() {
    const propSet = this.props;
    return (
      <Content
        header={true}
        title="Histogram Asteroid-Sun distance"
        content={
          <div className="size-plot">
            <BarChart
              width={350}
              height={200}
              data={propSet.data}
              margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
            >
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bin">
                <Label
                  value="Heliocentric distance (AU)"
                  offset={0}
                  position="insideBottom"
                />
              </XAxis>
              <YAxis dataKey="count" scale="pow">
                <Label
                  value="N Asteroids"
                  offset={5}
                  angle={-90}
                  position="insideLeft"
                />
              </YAxis>
              <Bar barSize={10} dataKey="count" fill="#3CB1C6" />
            </BarChart>
          </div>
        }
      />
    );
  }
}

export default SunDistance;
