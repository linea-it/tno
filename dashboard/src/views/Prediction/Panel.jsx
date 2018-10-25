import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PredictionHistory from './History';
import PredictionSubmit from './Submit';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import PropTypes from 'prop-types';
import Content from 'components/CardContent/CardContent.jsx';
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
    };
  }

  onCreateRun = record => {
    // Toda vez que cria um novo registro forca a execucao do metodo render()
    this.setState({ record: record });
  };

  onViewPrediction = id => {
    const history = this.props.history;
    history.push({ pathname: `/prediction_detail/${id}` });
  };

  render() {
    // const { record } = this.state;
    return (
      <div className="grid template-predict-panel">
        <PanelCostumize
          title="Prediction Occultation"
          subTitle="Execute PRAIA Occultation"
          className="content1_predict_occult"
          content={
            <Content
              title=""
              content={<PredictionSubmit onCreateRun={this.onCreateRun} />}
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
                />
              }
            />
          }
        />
      </div>
    );
  }
}

export default withRouter(PredictionPanel);
