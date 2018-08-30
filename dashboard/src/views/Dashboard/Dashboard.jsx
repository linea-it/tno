import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import MiniCardStats from 'components/Statistics/MiniCardStats.jsx';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import plot1 from 'assets/img/plot1.png';
import plot2 from 'assets/img/plot2.png';
import plot3 from 'assets/img/plot3.png';
import ListStats from 'components/Statistics/ListStats.jsx';
import StepStats from 'components/Statistics/StepStats.jsx';
import StepStatsGroup from 'components/Statistics/StepStatsGroup.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

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
      { name: 'KBO', value: 200 },
    ];

    const graph = [
      { name: 'g', band: 1221 },
      { name: 'r', band: 21323 },
      { name: 'y', band: 5122 },
      { name: 'z', band: 4221 },
      { name: 'i', band: 1212 },
      { name: 'u', band: 32121 },
    ];

    const colors = ['rgba(255,255,255,0.2)', '#ffffff', '#ffffff', '#ffffff'];

    const textInfo = [
      {
        legend: 'Downloaded',
        label: '3232',
        value: 1,
        colorIcon: 'success',
        grid: ['6'],
      },
      {
        legend: 'Not Downloaded',
        label: '231',
        value: 2,
        colorIcon: 'danger',
        grid: ['6'],
      },
    ];

    const textInfo2 = [
      {
        legend: 'CCDs with objects',
        label: '6473',
        value: 1,
        colorIcon: 'success',
        grid: ['6'],
      },
      {
        legend: 'CCDs without objects',
        label: '333',
        value: 2,
        colorIcon: 'danger',
        grid: ['6'],
      },
    ];

    const textInfo = [
      { text: 'Download', number: 3232, colorIcon: 'success', grid: ['3'] },
      { text: 'NotDownload', number: 333, colorIcon: 'danger', grid: ['4'] },
      { text: 'NotDownload', number: 333, colorIcon: 'danger', grid: ['4'] },
    ];
    return (
      <div>
        <div className="ui-g">
          <div className="ui-md-4 ui-sm-2">
            <PanelCostumize
              colorHead="ds"
              title="SKYBOT"
              content={
                <div>
                  <StepStats
                    disableCard="false"
                    title=" CCDs frames downloaded"
                    info={textInfo}
                    footer={
                      <div>
                        <ul className="step-format">
                          <li>
                            <i className="pi pi-cloud-download step-icon" />
                            <a>Data do último update: 25/12/2018</a>
                          </li>
                          <li>
                            <i className="pi pi-cloud-download step-icon">
                              <a>Data do último update: 25/12/2018</a>
                            </i>
                          </li>
                        </ul>
                      </div>
                    }
                  />
                  <br />
                  <hr className="panel-hr" />
                  <StepStats
                    disableCard="false"
                    title=" CCDs with SSSO"
                    info={textInfo2}
                    footer={
                      <div>
                        <ul className="step-format">
                          <li>
                            <i className="pi pi-cloud-download step-icon" />
                            <a>Data do último update: 25/12/2018</a>
                          </li>
                          <li>
                            <i className="pi pi-cloud-download step-icon">
                              <a>Data do último update: 25/12/2018</a>
                            </i>
                          </li>
                        </ul>
                      </div>
                    }
                  />
                  <br />
                  <hr className="panel-hr" />
                  <StepStatsGroup
                    disableCard="false"
                    title="SSSO number per class"
                    data={stats2}
                  />
                  <hr className="panel-hr" />
                  <Card
                    subTitle="Exposure per period (placeholder)"
                    className="step-title"
                    style={{ border: 'none' }}
                  >
                    <BarChart
                      width={475}
                      height={198}
                      data={graph}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      {/* <Tooltip /> */}
                      {/* <Legend /> */}
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                    </BarChart>
                    {/* <figure>
                      <img width="300" height="151" alt="text" src={plot2} />
                    </figure> */}
                  </Card>
                </div>
              }
            />
          </div>

          <div className="ui-md-4 ui-sm-2">
            <PanelCostumize
              colorHead="ds"
              title="EXPOSURE"
              content={
                <div>
                  <br />
                  <StepStats
                    disableCard="false"
                    title=" CCDs frames downloaded"
                    info={textInfo2}
                    footer={
                      <div>
                        <ul className="step-format">
                          <li>
                            <i className="pi pi-cloud-download step-icon" />
                            <a>Data do último update: 25/12/2018</a>
                          </li>
                          <li>
                            <i className="pi pi-cloud-download step-icon">
                              <a>Data do último update: 25/12/2018</a>
                            </i>
                          </li>
                        </ul>
                      </div>
                    }
                  />
                  <br />
                  <hr className="panel-hr" />
                  <Card
                    subTitle="Exposure per period (placeholder)"
                    className="step-title"
                    style={{ border: 'none' }}
                  >
                    <BarChart
                      width={475}
                      height={198}
                      data={graph}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      {/* <Tooltip /> */}
                      {/* <Legend /> */}
                      <Bar barSize={10} dataKey="band" fill="#28CA71" />;
                      <Bar barSize={10} dataKey="band" fill="#28CA71" />;
                      <Bar barSize={10} dataKey="band" fill="#28CA71" />;
                      <Bar barSize={10} dataKey="band" fill="#28CA71" />;
                      <Bar barSize={10} dataKey="band" fill="#28CA71" />;
                    </BarChart>
                    {/* <figure>
                      <img width="300" height="151" alt="text" src={plot2} />
                    </figure> */}
                  </Card>
                </div>
              }
            />
            {/* */}
          </div>

          <div className="ui-md-4 ui-sm-2">
            <div className="ui-g">
              <div className="ui-md-12">
                <PanelCostumize
                  colorHead="ds"
                  title="LIST STATS"
                  content={<ListStats statstext="running" data={stats} />}
                />
              </div>
              <div className="ui-md-12">
                <PanelCostumize
                  colorHead="ds"
                  title="PROCESSING AND PERFORMANCE"
                  content={
                    <div>
                      <div className="ui-g">
                        <div className="ui-md-12">
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
                        <div className="ui-md-12">
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

                        <div className="ui-md-12">
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
                        <div className="ui-md-12">
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
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* <div className="ui-g">
          <div className="ui-md-4 ui-sm-2">
            <StepStats title="Exposures" info={textInfo} />
          </div>

          <div className="ui-md-4 ui-sm-2">
            <Card subTitle="Lorem Ipsum" width={{ maxWidth: '500px' }}>
              <figure>
                <img width="300" height="151" alt="text" src={plot1} />
              </figure>
            </Card>
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
            <Card />
          </div>
        </div>
        <ListStats statstext="running" title="List Stats" data={stats} /> */}
        <div className="ui-md-4" />
      </div>
    );
  }
}
export default Dashboard;
