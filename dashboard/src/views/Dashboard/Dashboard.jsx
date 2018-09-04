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
  Label,
} from 'recharts';

import DashboardApi from './DashboardApi';

class Dashboard extends Component {
  state = this.initialState;
  api = new DashboardApi();

  get initialState() {
    return {
      exposures: {
        count_pointings: 0,
        downloaded: 0,
        not_downloaded: 0,
        last: '',
        first: '',
        exposures: 0,
        updated: '',
        size: '',
      },
      ccds: {
        count_asteroids: 0,
        unique_ccds: 0,
        asteroids_by_class: [
          {
            class_name: 'KBO',
            count: 0,
          },
          {
            class_name: 'Centaur',
            count: 0,
          },
          {
            class_name: 'Trojan',
            count: 0,
          },
          {
            class_name: 'MB',
            count: 0,
          },
        ],
        asteroids_by_dynaclass: [],
        histogram: [],
      },
    };
  }

  componentDidMount() {
    this.api.getExposuresInfo().then(res => {
      const exposures = res.data;

      this.setState({
        exposures: exposures,
      });

      this.api.getSkybotInfo().then(res => {
        const ccds = res.data;

        this.setState({
          ccds: ccds,
        });
      });
    });
  }

  render() {
    const { exposures, ccds } = this.state;

    const data = [
      { name: 'Executado', value: 400 },
      { name: 'Warning', value: 300 },
      { name: 'Não executado', value: 200 },
      { name: 'Fail', value: 300 },
    ];

    const proccess_stats = [
      { name: 'Proccess', value: 'xxx - xxxxxxx xxxxx' },
      { name: 'Owner', value: 'xxxxxxxxx' },
      { name: 'Start', value: 'xxxx-xx-xx xx:xx:xx' },
      { name: 'Asteroids', value: 'xxx' },
    ];

    const graph = [
      { name: '2013', band: 2500 },
      { name: '2014', band: 4500 },
      { name: '2015', band: 3500 },
      { name: '2016', band: 3000 },
    ];

    const colors = ['rgba(255,255,255,0.2)', '#ffffff', '#ffffff', '#ffffff'];

    const exposure_info = [
      {
        legend: 'Downloaded',
        label: exposures.downloaded,
        value: exposures.downloaded,
        colorIcon: 'primary',
        grid: ['6'],
      },
      {
        legend: 'not Downloaded',
        label: exposures.not_downloaded,
        value: exposures.not_downloaded,
        colorIcon: 'muted',
        grid: ['6'],
      },
    ];

    // const ccd_info = [
    //   {
    //     legend: 'With SSSO',
    //     label: ccds.count_asteroids,
    //     value: ccds.count_asteroids,
    //     colorIcon: 'info',
    //     grid: ['6'],
    //   },
    //   {
    //     legend: 'Without',
    //     label: '231',
    //     value: 30,
    //     colorIcon: 'danger',
    //     grid: ['6'],
    //   },
    // ];

    const ssso_class = [];

    ccds.asteroids_by_class.map(record => {
      ssso_class.push({
        name: record.class_name,
        value: record.count,
        color: 'primary',
      });
    });

    let heliocentric_histogram = null;
    if (ccds.histogram.length > 0) {
      heliocentric_histogram = (
        <Card
          subTitle="Histogram Asteroid-Sun distance"
          className="step-title"
          style={{ border: 'none' }}
        >
          <BarChart
            width={350}
            height={200}
            data={ccds.histogram}
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
            <Bar barSize={10} dataKey="count" fill="#3c1e7e" />
          </BarChart>
        </Card>
      );
    }

    return (
      <div className="content">
        <div className="ui-g">
          {/* <div className="ui-g-4 ui-md-4 ui-sm-2"> */}
          <div className="ui-g-4">
            <PanelCostumize
              colorHead="ds"
              title="EXPOSURE"
              content={
                <div>
                  <br />
                  <StepStats
                    disableCard="false"
                    // title=" CCDs frames downloaded"
                    info={exposure_info}
                    footer={
                      <div>
                        <ul className="step-format">
                          <li>
                            <a>Pointings: {exposures.count_pointings}</a>
                          </li>
                          <li>
                            <a>Exposures: {exposures.exposures}</a>
                          </li>
                          <li>
                            <a>
                              Most recent: {exposures.last} Oldest:{' '}
                              {exposures.first}
                            </a>
                          </li>
                          <li>
                            <a>Updated: {exposures.updated}</a>
                          </li>
                          <li>
                            <a>Size: {exposures.size}</a>
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
                      width={350}
                      height={200}
                      data={graph}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis dataKey="band" />
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                    </BarChart>
                  </Card>
                </div>
              }
            />
            {/* */}
          </div>
          <div className="ui-md-4 ui-sm-2">
            <PanelCostumize
              colorHead="ds"
              title="SKYBOT"
              content={
                <div>
                  {/* <StepStats
                    disableCard="false"
                    title=" CCDs with SSSO"
                    info={exposure_info}
                    footer={
                      <div>
                        <ul className="step-format">
                          <li>
                            <a>CCDs: {ccds.unique_ccds}</a>
                          </li>
                          <li>
                            <a>Asteroids: {ccds.count_asteroids}</a>
                          </li>
                          <li>
                            <a>Updated: xxxx-xx-xx</a>
                          </li>
                          <li>
                            <a>Skybot Version: vx.x.x</a>
                          </li>
                        </ul>
                      </div>
                    }
                  /> */}
                  <div>
                    <ul className="step-format">
                      <li>
                        <a>CCDs: {ccds.unique_ccds}</a>
                      </li>
                      <li>
                        <a>Asteroids: {ccds.count_asteroids}</a>
                      </li>
                      <li>
                        <a>Updated: xxxx-xx-xx</a>
                      </li>
                      <li>
                        <a>Skybot Version: vx.x.x</a>
                      </li>
                    </ul>
                  </div>
                  <br />
                  <hr className="panel-hr" />
                  <StepStatsGroup
                    disableCard="false"
                    title="SSSO number per class"
                    data={ssso_class}
                  />
                  <hr className="panel-hr" />
                  <Card
                    subTitle="SSSO number per dynclass"
                    className="step-title"
                    style={{ border: 'none' }}
                  >
                    <BarChart
                      width={350}
                      height={200}
                      data={ccds.asteroids_by_dynaclass}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <Tooltip />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dynclass" />
                      <YAxis dataKey="count" />
                      <Bar barSize={10} dataKey="count" fill="#3c1e7e" />;
                    </BarChart>

                    {heliocentric_histogram}
                  </Card>
                </div>
              }
            />
          </div>

          <div className="ui-md-4 ui-sm-2">
            <div className="ui-g">
              <div className="ui-md-12">
                <PanelCostumize
                  colorHead="ds"
                  title="Last Proccess Stats"
                  content={
                    <ListStats
                      status={false}
//                      statstext="running"
                      data={proccess_stats}
                    />
                  }
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
                            number="60 %"
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
                            name="Traffic"
                            number="2.4 KB"
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
        {/* <div className="ui-md-4" /> */}
      </div>
    );
  }
}
export default Dashboard;
