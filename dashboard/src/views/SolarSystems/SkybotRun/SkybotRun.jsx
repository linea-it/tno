import React, { Component } from 'react';
import FormSkybot from './FormSkybot';
import HistoryRun from './HistoryRun';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
class SkybotRun extends Component {
  state = {
    data: [],
  };

  static propTypes = {
    history: PropTypes.any,
  };

  insertHistory = res => {
    this.setState({ data: res.data });
  };

  handleView = id => {
    const history = this.props.history;
    history.push({ pathname: `/skybotrun_detail/${id}` });
  };

  handleRerun = res => {
    this.setState({ data: res.data });
  };

  handleCancel = res => {
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
            content={
              <HistoryRun
                data={data}
                handleView={this.handleView}
                onRerun={this.handleRerun}
                handleCancel={this.handleCancel}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default withRouter(SkybotRun);
