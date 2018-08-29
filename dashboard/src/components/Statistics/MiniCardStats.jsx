import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';

import { PieChart, Pie, Cell } from 'recharts';

class MiniCardStats extends Component {
  render() {
    const propSet = this.props;
    const { string, array } = PropTypes;

    MiniCardStats.PropTypes = {
      subTitle: string.isRequired,
      data: array.isRequired,
      fill: array.isRequired,
      name: string.isRequired,
    };
    // const RADIAN = Math.PI / 180;

    return (
      <div>
        <Card className={`mini-card-stats ${propSet.color}`}>
          <div className="ui-g">
            <div className="ui-md-6">
              <div className="title-statistics">{propSet.name}</div>
              <div className="number-statistics"> {propSet.number}</div>
            </div>

            <div className="ui-md-6">
              <div className="plot">
                <PieChart
                  width={120}
                  height={100}
                  onMouseEnter={this.onPieEnter}
                >
                  <Pie
                    data={propSet.data}
                    cx={60}
                    cy={60}
                    innerRadius={28}
                    outerRadius={34}
                    paddingAngle={0}
                  >
                    {propSet.fill.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={propSet.fill[index % propSet.fill.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}
export default MiniCardStats;
