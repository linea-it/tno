import React, { Component } from 'react';
import Content from 'components/CardContent/CardContent.jsx';
import { Tooltip, PieChart, Pie, Legend, Cell } from 'recharts';

class Piedyclass extends Component {
  render() {
    const COLORS = [
      '#0088FE',
      '#00C49F',
      '#FFBB28',
      '#FF8042',
      '#0088FE',
      '#00C49F',
      '#FFBB28',
      '#FF8042',
    ];

    const asteroids_by_class = [
      {
        name: 'Vulcanoid',
        count: 0,
      },
      {
        name: 'NEA',
        value: 7079,
      },
      {
        name: 'Mars-crosser',
        value: 10223,
      },
      {
        name: 'Hungaria',
        value: 23515,
      },
      {
        name: 'MB',
        value: 671461,
      },
      {
        name: 'Trojan',
        value: 8559,
      },
      {
        name: 'Centaur',
        value: 1229,
      },
      {
        name: 'KBO',
        value: 9975,
      },
      {
        name: 'IOC',
        value: 0,
      },
    ];

    // const legend = asteroids_by_class.map((el, i) => {
    //   return <li key={`item-${i}`}>{el.name}</li>;
    // });

    return (
      <Content
        header={true}
        title="SSSO exposures per objects"
        content={
          <div id="pie-container">
            <PieChart width={600} height={200} onMouseEnter={this.onPieEnter}>
              <Pie
                data={asteroids_by_class}
                cx={100}
                cy={100}
                innerRadius={40}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={0.5}
              >
                {COLORS.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" iconSize="10" verticalAlign="middle" />
            </PieChart>
          </div>
        }
      />
    );
  }
}

export default Piedyclass;
