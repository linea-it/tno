import React, { Component } from 'react';
import { Tooltip, PieChart, Pie, Legend, Cell } from 'recharts';

class Piedyclass extends Component {
  render() {
    const propSet = this.props;
    const COLORS = propSet.colors;
    return (
      <PieChart width={600} height={300} onMouseEnter={this.onPieEnter}>
        <Pie
          data={propSet.data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={1}
        >
          {COLORS.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          iconSize={10}
          width={600}
          height={300}
          layout="horizontal"
          verticalAlign="middle"
        />
      </PieChart>
    );
  }
}

export default Piedyclass;
