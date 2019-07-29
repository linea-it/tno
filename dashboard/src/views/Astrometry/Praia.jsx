import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PraiaApi from './PraiaApi';
import PraiaSubmit from './PraiaSubmit';
import PraiaHistory from './PraiaHistory';
import PraiaRunning from './PraiaRunning';
import PropTypes from 'prop-types';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

class Praia extends Component {
  state = this.initialState;
  api = new PraiaApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      // Praia Run recem criado e que esta em andamento ainda
      msg: null,
      msg_type: null,
      dialogVisible: false,
    };
  }

  onCreateRun = record => {
    // Toda vez que cria um novo registro forca a execucao do metodo render()

    this.onViewDetail(record.id);

  };

  onCreateFailure = error => {

    this.setState({ dialogVisible: true, msg: "Fail on run creation execution", msg_type: "alert-danger" });

  };

  onMissingParameter = (option) => {

    this.setState({ msg: `Select  ${option} option.   All execute options to be selected.` });
    this.setState({ msg_type: "alert-danger" });
    this.setState({ dialogVisible: true });

  };


  onRerun = record => {
    this.setState(record);
  };


  onHide = () => {
    this.setState({ dialogVisible: false });
  }


  render() {
    const { record, dialogVisible, msg, msg_type } = this.state;

    // console.log(record);

    const footer = (
      <div>
        <Button
          label="Ok"
          className={msg_type}
          icon="pi pi-check"
          onClick={this.onHide}
        />

      </div>
    );


    return (
      <div className="grid template-predict-astromery">
        <PanelCostumize
          className="exec_astrometry"
          title="Execute"
          subTitle="Description about execution"
          content={<PraiaSubmit onMissingParameter={this.onMissingParameter} onCreateRun={this.onCreateRun} onCreateFailure={this.onCreateFailure} />}
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

        <Dialog
          header="Astrometry Run"
          visible={dialogVisible}
          footer={footer}
          minY={70}
          modal={true}
          onHide={this.onHide}
        >
          {msg}
        </Dialog>
      </div>

    );
  }


  //Method to open view detail screen
  onViewDetail = id => {
    const history = this.props.history;
    history.push({ pathname: `/astrometry_run/${id}` });
  };
}

export default withRouter(Praia);
