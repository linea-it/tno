import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PanelCostumize from 'components/Panel/PanelCostumize';

class PraiaRun extends Component {
  state = this.initialState;

  get initialState() {
    return {
      id: null,
    };
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.setState({ id: params.id });
  }

  render() {

    return (
      <PanelCostumize
        content={
          <div />
          // <div className="">
          //   <Card
          //     className="none"
          //     title={title}
          //     subTitle="MOSTRAR TODAS AS INFORMACOES SOBRE A EXECUCAO DA ASTROMETRIA"
          //   >
          //     <div />
          //   </Card>
          // </div>
        }
      />
    );
  }

  static propTypes = {
    //match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };
}



export default PraiaRun;
