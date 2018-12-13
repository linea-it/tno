import React, { Component } from 'react';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Custom
import ListStats from 'components/Statistics/ListStats.jsx';
import StepStats from 'components/Statistics/StepStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import Content from 'components/CardContent/CardContent.jsx';

//Plot Rechart
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

class Void extends Component {
  render() {
    const propSet = this.props;
    return (
      <div>
        <PanelCostumize
          colorHead="ds"
          title="Exposure"
          content={
            <div className="p-grid p-dir-row">
              <div className="p-col-6 border-edit-right">
                <StepStats
                  disableCard="false"
                  // title=" CCDs frames downloaded"
                  info={propSet.exposure_info}
                  footer={
                    <div>
                      <ListStats title="dfs" data={propSet.data_exposures} />
                    </div>
                  }
                />
              </div>

              <div className="p-col-6">
                <Content
                  header={true}
                  title="Exposure per period (placeholder)"
                  className="step-title"
                  content={
                    // <div className="size-plot">
                    <BarChart
                      width={450}
                      height={250}
                      data={propSet.graph}
                      margin={{ top: 60, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis dataKey="band" />
                      <Bar barSize={10} dataKey="band" fill="#3c1e7e" />;
                    </BarChart>
                    // </div>
                  }
                />
              </div>
            </div>
          }
        />
      </div>
    );
  }
}
export default Void;
