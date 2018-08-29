import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import MiniCardStats from 'components/Statistics/MiniCardStats.jsx';
import { Card } from 'primereact/card';
import plot1 from 'assets/img/plot1.png';
import plot2 from 'assets/img/plot2.png';
import plot3 from 'assets/img/plot3.png';
import ListStats from 'components/Statistics/ListStats.jsx';
import StepStats from 'components/Statistics/StepStats.jsx';
import StepStatsGroup from 'components/Statistics/StepStatsGroup.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

class Dashboard extends Component {
  render() {
    const data = [
      { name: 'Executado', value: 400 },
      { name: 'Warning', value: 300 },
      { name: 'Não executado', value: 200 },
      { name: 'Fail', value: 300 },
    ];

    const stats = [
      { name: 'Active Projects', value: 400 },
      { name: 'Open Tasks', value: 300 },
      { name: 'Support Tickets', value: 200 },
      { name: 'Active Timers', value: 300 },
    ];

    const stats2 = [
      { name: 'TNO', value: 400 },
      { name: 'Centaur', value: 300 },
      { name: 'Troian', value: 200 },
    ];

    const colors = ['rgba(255,255,255,0.2)', '#ffffff', '#ffffff', '#ffffff'];

    const data2 = [
      { name: 'Group A', value: 400 },
      { name: 'Group B', value: 300 },
      { name: 'Group C', value: 300 },
      { name: 'Group D', value: 200 },
    ];
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const textInfo = [
      { text: 'Download', number: 3232, colorIcon: 'success', grid: ['3'] },
      { text: 'NotDownload', number: 333, colorIcon: 'danger', grid: ['4'] },
      { text: 'NotDownload', number: 333, colorIcon: 'danger', grid: ['4'] },
    ];
    return (
      <div>
        <div className="ui-g">
          <div className="ui-md-4 ui-sm-6">
            <Card subTitle="Lorem Ipsum">
              <figure>
                <img width="300" height="151" alt="text" src={plot1} />
              </figure>
            </Card>
          </div>
          <div className="ui-md-4 ui-sm-6">
            <Card subTitle="Lorem Ipsum">
              <ResponsiveContainer>
                <figure>
                  <img width="300" height="151" alt="text" src={plot3} />
                </figure>
              </ResponsiveContainer>
            </Card>
          </div>

          <div className="ui-md-4 ui-sm-6">
            <ListStats statstext="running" title="List Stats" data={stats} />
          </div>
        </div>

        <div className="ui-g">
          <div className="ui-md-4">
            <StepStats title="Exposures" info={textInfo} />
          </div>

          <div className="ui-md-4">
            <StepStats title="Step Stats" info={textInfo} />
          </div>

          <div className="ui-md-4">
            <StepStatsGroup title="Objetcs" data={stats2} />
          </div>
        </div>

        <div className="ui-g">
          <div className="ui-md-5">
            <Card subTitle="Lorem Ipsum">
              <figure>
                <img width="400" height="251" alt="text" src={plot2} />
              </figure>
            </Card>
          </div>
          <div className="ui-md-4">
            <Card>
              <PieChart width={800} height={400} onMouseEnter={this.onPieEnter}>
                <Pie
                  data={data}
                  cx={300}
                  cy={200}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {data.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </Card>
          </div>
        </div>

        <div className="ui-g">
          <div className="ui-md-3">
            <MiniCardStats
              color="yellow"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
              data={data}
              fill={colors}
              name="Memory"
              number="22 %"
            />
          </div>
          <div className="ui-md-3">
            <MiniCardStats
              color="green"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
              data={data}
              fill={colors}
              name="Traffic"
              number="2.4 KB"
            />
          </div>

          <div className="ui-md-3">
            <MiniCardStats
              color="orange"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
              data={data}
              fill={colors}
              name="Disk I/O"
              number="4.2 KB"
            />
          </div>
          <div className="ui-md-3">
            <MiniCardStats
              color="blue"
              bigIcon={<i className="pe-7s-graph1 text-danger" />}
              statsText="Errors"
              statsValue="23"
              statsIcon={<i className="fa fa-clock-o" />}
              statsIconText="In the last hour"
              data={data}
              fill={colors}
              name="Memory"
              number="5.2 KB"
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Dashboard;
