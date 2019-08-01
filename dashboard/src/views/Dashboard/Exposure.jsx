import React, { Component } from 'react';

//primereact
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Custom
import ListStats from 'components/Statistics/ListStats.jsx';
import StepStats from 'components/Statistics/StepStats.jsx';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';

import ExpHistogram from './ExpHistogram';

class Void extends Component {
  state = {
    x: [],
    y: [],
  };
  render() {
    const propSet = this.props;

    let gridCol = '';
    window.innerWidth <= 998 ? (gridCol = '12') : (gridCol = '6');

    return (
      <div>
        <div className="p-grid p-dir-row">
          <div className={`p-col-${gridCol}`}>

            <PanelCostumize
              colorHead="ds"
              title="Data Exposure"
              content={
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
              }
            />
          </div>

          <br />

          <div className={`p-col-${gridCol}`}>
            <PanelCostumize
              colorHead="ds"
              title="Plot exposure"
              content={
                <ExpHistogram
                  data={this.props.data_histogram}
                  width={420}
                  height={300}
                />
              }
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Void;
