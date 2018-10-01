import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PredictionHistory from './History';
// import PredictionSubmit from './Submit';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import PropTypes from 'prop-types';
import { Card } from 'primereact/card';
import PredictionSelect from './PredictionSelect.jsx';

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
      <div className="content">
        <div className="ui-g">
          <div className="ui-g-4">
            <Card title=" " subTitle=" " />
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
