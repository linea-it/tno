import React, { Component } from 'react';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Custom
import StepStatsGroup from 'components/Statistics/StepStatsGroup.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import ListStats from 'components/Statistics/ListStats.jsx';
import Content from 'components/CardContent/CardContent.jsx';

//Plot Rechart
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label,
} from 'recharts';

class Skybot extends Component {
  render() {
    const propSet = this.props;
    const ssso_class = [];

    propSet.ccds.asteroids_by_class.map(record => {
      ssso_class.push({
        name: record.class_name,
        value: record.count,
        color: 'primary',
      });
    });

    let heliocentric_histogram = null;
    if (propSet.ccds.histogram.length > 0) {
      heliocentric_histogram = (
        <Content
          header={true}
          title="Histogram Asteroid-Sun distance"
          content={
            <div className="size-plot">
              <BarChart
                width={350}
                height={200}
                data={propSet.ccds.histogram}
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
                <Bar barSize={10} dataKey="count" fill="#3CB1C6" />
              </BarChart>
            </div>
          }
        />
      );
    }
    return (
      <div>
        <PanelCostumize
          colorHead="ds"
          title="Skybot"
          content={
            <div>
              <ListStats data={propSet.data} />
              {/* <div>
                <ul className="step-format">
                  <li>
                    <a>CCDs: {propSet.ccds.unique_ccds}</a>
                  </li>
                  <li>
                    <a>Asteroids: {propSet.ccds.count_asteroids}</a>
                  </li>
                  <li>
                    <a>Updated: xxxx-xx-xx</a>
                  </li>
                  <li>
                    <a>Skybot Version: vx.x.x</a>
                  </li>
                </ul>
              </div> */}
              <br />
              <hr className="panel-hr" />
              <StepStatsGroup
                disableCard="false"
                title="SSSO number per class"
                data={ssso_class}
              />
              <hr className="panel-hr" />
              <Content
                header={true}
                title="SSSO number per dynclass"
                className="step-title"
                content={
                  <div className="size-plot">
                    <BarChart
                      width={300}
                      height={150}
                      data={propSet.ccds.asteroids_by_dynclass}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <Tooltip />
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dynclass" />
                      <YAxis dataKey="count" />
                      <Bar barSize={10} dataKey="count" fill="#3c1e7e" />;
                    </BarChart>
                  </div>
                }
              />
              <br />
              <hr className="panel-hr" />
              {heliocentric_histogram}
            </div>
          }
        />
      </div>
    );
  }
}
export default Skybot;
