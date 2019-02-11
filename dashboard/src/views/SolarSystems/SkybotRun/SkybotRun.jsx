import React, { Component } from 'react';
import FormSkybot from './FormSkybot';
import HistoryRun from './HistoryRun';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';

class SkybotRun extends Component {
  render() {
    return (
      <div className="p-dir-row">
        <div className="p-col-4">
          <PanelCostumize
            // className="panel-height-skybot"
            title="Skybot Run"
            content={<FormSkybot />}
          />
        </div>

        <div className="p-col-12">
          <PanelCostumize title="History" content={<HistoryRun />} />
        </div>
      </div>
    );
  }
}

export default SkybotRun;
