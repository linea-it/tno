import React, { Component } from 'react';
import FormSkybot from './FormSkybot';
import HistoryRun from './HistoryRun';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';

class SkybotRun extends Component {
  state = {
    data: [],
  };
  insertHistory = res => {
    this.setState({ data: res.data });
  };
  render() {
    const { data } = this.state;
    return (
      <div className="p-dir-row">
        <div className="p-col-4">
          <PanelCostumize
            title="Skybot Run"
            content={<FormSkybot insertHistory={this.insertHistory} />}
          />
        </div>

        <div className="p-col-12">
          <PanelCostumize
            title="History"
            content={<HistoryRun data={data} />}
          />
        </div>
      </div>
    );
  }
}

export default SkybotRun;
