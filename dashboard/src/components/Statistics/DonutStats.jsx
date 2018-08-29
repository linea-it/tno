import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

class DonutStats extends Component {
  render() {
    const propSet = this.props;
    const { string, array } = PropTypes;

    DonutStats.PropTypes = {
      subTitle: string.isRequired,
      data: array.isRequired,
      fill: array.isRequired,
    };

    const RADIAN = Math.PI / 180;

    return (
      <ResponsiveContainer width={450} height="80%">
        <Card subTitle={propSet.title} style={{ height: '200px' }}>
          <PieChart width={450} height={150} onMouseEnter={this.onPieEnter}>
            <Pie
              data={propSet.data}
              cx={60}
              cy={60}
              innerRadius={30}
              outerRadius={50}
              paddingAngle={0}
            >
              {propSet.fill.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={propSet.fill[index % propSet.fill.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              iconSize={10}
              width={120}
              height={100}
              layout="vertical"
              verticalAlign="middle"
            />
          </PieChart>
        </Card>
      </ResponsiveContainer>
    );
  }
}

export default DonutStats;
