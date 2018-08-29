import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
// import RefineOrbitSubmit from './Submit';
// import RefineOrbitRunning from './Running';
// import RefineOrbitHistory from './History';
import PredictionHistory from './History';

import PropTypes from 'prop-types';
import { Card } from 'primereact/card';
class PredictionPanel extends Component {
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

  onViewPrediction = id => {
    const history = this.props.history;
    history.push({ pathname: `/prediction_detail/${id}` });
  };

  render() {
    // const { record } = this.state;
    return (
      <div className="content">
        <div className="ui-g">
          <div className="ui-g-4">
            <Card
              title="Prediction Occultation"
              subTitle={'Execute PRAIA Occultation'}
            />
          </div>
          <div className="ui-g-8">
            <Card title=" " subTitle=" " />
          </div>
        </div>
        <div className="ui-g">
          <div className="ui-g-12">
            <Card subTitle="Manage PRAIA Occultation rounds">
              <PredictionHistory view_prediction={this.onViewPrediction} />
            </Card>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PredictionPanel);
