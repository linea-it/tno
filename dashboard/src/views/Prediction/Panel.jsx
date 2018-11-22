import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PredictionHistory from './History';
import PredictionSubmit from './Submit';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import PropTypes from 'prop-types';
import Content from 'components/CardContent/CardContent.jsx';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

// import PredictionSelect from './PredictionSelect.jsx';

class PredictionPanel extends Component {
  state = this.initialState;
  static propTypes = {
    history: PropTypes.any,
  };

  get initialState() {
    return {
      // Praia Run recem criado e que esta em andamento ainda
      record: {},
      visible: false,
      msg: null,
      type: null,
    };
  }
  onShow = () => {
    this.setState({
      visible: true,
    });
  };

  onHide = () => {
    this.setState({
      visible: false,
    });
  };

  onCreateRun = record => {
    // Toda vez que cria um novo registro forca a execucao do metodo render()
    console.log('onCreateRun', record);
    this.setState({
      msg: 'Your registration has been successfully reviewed.',
      type: 'alert-success',
    });
    this.onShow();
    this.setState({ record: record });
  };

  onFailure = msg => {
    this.setState({
      msg: 'An error has occurred, contact your administrator.',
      type: 'alert-danger',
    });
    this.onShow();
    console.log('Falhou: ', msg);
  };

  onViewPrediction = id => {
    const history = this.props.history;
    history.push({ pathname: `/prediction_detail/${id}` });
  };

  render() {
    const { record } = this.state;

    const footer = (
      <div>
        <Button
          label="Ok"
          className={this.state.type}
          icon="pi pi-check"
          onClick={this.onHide}
        />
      </div>
    );

    return (
      <div className="grid template-predict-panel">
        <PanelCostumize
          title="Prediction Occultation"
          subTitle="Execute PRAIA Occultation"
          className="content1_predict_occult"
          content={
            <Content
              title=""
              content={
                <PredictionSubmit
                  onCreateRun={this.onCreateRun}
                  onFailure={this.onFailure}
                />
              }
            />
          }
        />
        {/* <PanelCostumize
          className="content2_predict_occult"
          content={<Content title="" content={<div />} />}
        /> */}
        <PanelCostumize
          className="history_predict_occult"
          content={
            <Content
              title="Manage PRAIA Occultation rounds"
              content={
                <PredictionHistory
                  view_prediction={this.onViewPrediction}
                  onRerun={this.onCreateRun}
                  record={record}
                />
              }
            />
          }
        />
        <Dialog
          header="Run Prediciton"
          visible={this.state.visible}
          footer={footer}
          minY={70}
          modal={true}
          onHide={this.onHide}
        >
          {this.state.msg}
        </Dialog>
      </div>
    );
  }
}

export default withRouter(PredictionPanel);
