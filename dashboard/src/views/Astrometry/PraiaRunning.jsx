import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Card from 'components/Card/Card.jsx';
import PraiaApi from './PraiaApi';
import { Tasks } from 'components/Tasks/Tasks.jsx';
import PropTypes from 'prop-types';
class PraiaRunning extends Component {
  state = this.initialState;
  api = new PraiaApi();

  get initialState() {
    return {};
  }

  static propTypes = {
    record: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // console.log("Praia Config mount")
  }

  render() {
    const { record } = this.props;
    let id = '';

    if ('id' in record) {
      id = record.id;
    }
    return (
      <Card
        title="Running"
        category="Monitor the rounds Astrometry"
        content={<div className="content">PRAIA RUN ID: {id}</div>}
      />
    );
  }
}

export default PraiaRunning;
