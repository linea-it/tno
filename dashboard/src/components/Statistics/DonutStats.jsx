import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
// import { Card } from 'primereact/card';
import Content from 'components/CardContent/CardContent.jsx';
import moment from 'moment';
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
  // onPieEnter = () => {
  //   this.props.controlInterval();

  // };

  // onPieLeave = () => {

  //   this.props.controlInterval();
  // };

  format = value => {
    //If who called the chart was execution time, convert to time
    //Else: use numbers.
    if (this.props.flag == 'execution_time') {
      const seconds = moment.duration(value);

      const finalTime = moment.utc(seconds * 1000).format('HH:mm:ss');

      return finalTime;
    } else {
      return value;
    }
  };

  render() {
    const propSet = this.props;

    const { string, array } = PropTypes;

    DonutStats.propTypes = {
      subTitle: string.isRequired,
      data: array.isRequired,
      fill: array.isRequired,
    };

    // const RADIAN = Math.PI / 180;

    return (
      <ResponsiveContainer width="100%" height="80%">
        <Content
          content={
            <PieChart width={450} height={130}>
              <Pie
                data={propSet.data}
                cx={60}
                cy={60}
                innerRadius={30}
                outerRadius={50}
                paddingAngle={0}
              >
                {propSet.fill.map((entry, index) => {
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={propSet.fill[index % propSet.fill.length]}
                    />
                  );
                })}
              </Pie>
              <Tooltip formatter={value => this.format(value)} />
              <Legend
                iconSize={10}
                width={160}
                height={100}
                layout="vertical"
                verticalAlign="middle"
              />
            </PieChart>
          }
        />
      </ResponsiveContainer>
    );
  }
}

export default DonutStats;
