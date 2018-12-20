import React, { Component } from 'react';
import Content from 'components/CardContent/CardContent.jsx';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

class SSSOdyclass extends Component {
  render() {
    const propSet = this.props;
    return (
      <Content
        header={true}
        title="SSSO number per dynclass"
        className="step-title"
        content={
          <div className="size-plot">
            <BarChart
              width={350}
              height={200}
              data={propSet.data.asteroids_by_dynclass}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dynclass" />
              <YAxis scale="log" dataKey="count" />
              <Bar barSize={10} dataKey="count" fill="#3c1e7e" />;
            </BarChart>
          </div>
        }
      />
    );
  }
}

export default SSSOdyclass;
