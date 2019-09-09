import React, { useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  // ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
} from 'recharts';

export function Donut({ data, fill }) {
  // const format = (value) => {
  //   // If who called the chart was execution time, convert to time
  //   // Else: use numbers.
  //   if (flag == 'execution_time') {
  //     const seconds = (moment.duration(value));
  //     const finalTime = moment.utc(seconds * 1000).format('HH:mm:ss');

  //     return finalTime;
  //   }
  //   return value;
  // };

  useEffect(() => {
    // console.log(data);
  }, [data]);

  return (
    <>
      <PieChart width={336} height={200}>
        <Pie
          data={data}
          dataKey={20}
          cx={60}
          cy={60}
          innerRadius={30}
          outerRadius={50}
          paddingAngle={0}
        >
          {fill.map((entry, index) => (
            <Cell
              key={index}
              fill={fill[index % fill.length]}
            />
          ))}
        </Pie>
        {/* <Tooltip formatter={(value) => format(value)} /> */}
        <Tooltip />
        <Legend
          iconSize={10}
          width={120}
          height={100}
          layout="vertical"
          verticalAlign="middle"
        />
      </PieChart>
    </>
  );
}

Donut.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  fill: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export function TimeProfile({ data, size }) {
  const [dimension, setDimension] = useState({});

  useEffect(() => {
    let { height } = size;
    if (size.height === 0) {
      height = size.width / 2;
    }

    setDimension({
      width: size.width,
      height,
    });
  }, []);

  return (
    <>
      <ScatterChart
        width={dimension.width}
        height={dimension.height}
        margin={{
          top: 20, right: 20, bottom: 20, left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis
          domain={[0, 'dataMax']}
          type="number"
          dataKey="x"
          name="Execution Time"
          unit="s"
          tickCount={10}
        />
        <YAxis
          domain={[0, 'dataMax +1']}
          type="number"
          dataKey="y"
          name="Asteroids"
          tick={false}
        />
        <ZAxis range={[10, 10]} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {data.map((asteroid, index) => (
          <Scatter
            key={index}
            name={asteroid.name}
            data={asteroid.points}
            line={{ strokeWidth: 1 }}
            shape="circle"
          />
        ))}
      </ScatterChart>
    </>
  );
}

TimeProfile.defaultProps = {
  size: {
    width: 336,
    height: 200,
  },
};

TimeProfile.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
};
