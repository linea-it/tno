import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PraiaApi from './PraiaApi';
import PraiaSubmit from './PraiaSubmit';
import PraiaHistory from './PraiaHistory';
import PraiaRunning from './PraiaRunning';
import PropTypes from 'prop-types';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';

class Praia extends Component {
  state = this.initialState;
  api = new PraiaApi();

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
    this.setState(record);
  };

  onRerun = record => {
    this.setState(record);
  };

  render() {
    const { record } = this.state;
    return (
      <div className="grid template-predict-astromery">
        <PanelCostumize
          className="exec_astrometry"
          title="Execute"
          subTitle="Descrição sobre a execução"
          content={<PraiaSubmit onCreateRun={this.onCreateRun} />}
        />
        <PanelCostumize
          title="Run time monitor"
          className="running_astrometry"
          subTitle=""
          content={<PraiaRunning record={record} />}
        />

        <PanelCostumize
          title="History"
          className="history_astrometry"
          subTitle="Manage the completed Astrometry rounds"
          content={
            <PraiaHistory
              onRerun={this.onRerun}
              handleOnViewDetail={this.onViewDetail}
            />
          }
        />
      </div>
    );
  }

  onViewDetail = id => {
    const history = this.props.history;
    history.push({ pathname: `/astrometry_run/${id}` });
  };
}

export default withRouter(Praia);
