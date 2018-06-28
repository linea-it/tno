import React, { Component } from 'react';
import Card from 'components/Card/Card.jsx';
import PropTypes from 'prop-types';

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
    const { id } = this.state;

    const title = 'Astrometry Run ' + id;
    return (
      <div className="content">
        <Card
          title={title}
          category="MOSTRAR TODAS AS INFORMACOES SOBRE A EXECUCAO DA ASTROMETRIA"
          content={<div />}
        />
      </div>
    );
  }
}

export default PraiaRun;
