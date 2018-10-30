import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import RefineOrbitSubmit from './Submit';
import RefineOrbitRunning from './Running';
import RefineOrbitHistory from './History';
import PropTypes from 'prop-types';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';

class RefineOrbitPanel extends Component {
  state = this.initialState;
  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      // Praia Run recem criado e que esta em andamento ainda
      record: {},
    };
  }

  onCreateRun = record => {
    // Toda vez que cria um novo registro forca a execucao do metodo render()
    this.setState({ record: record });
  };

  render() {
    const { record } = this.state;
    return (
      <div className="grid template-refine-orbit">
        <PanelCostumize
          className="submit_refine"
          title="Execute"
          subTitle="Descrição sobre execução"
          content={<RefineOrbitSubmit onCreateRun={this.onCreateRun} />}
        />

        <PanelCostumize
          className="running_refine"
          title="Running"
          subTitle="Monitor the rounds NIMA"
          content={<RefineOrbitRunning record={record} />}
        />
        <PanelCostumize
          className="history_refine"
          title="History"
          subTitle="Manage the completed NIMA rounds"
          content={<RefineOrbitHistory onRerun={this.onCreateRun} />}
        />
      </div>
    );
  }
}

export default withRouter(RefineOrbitPanel);
