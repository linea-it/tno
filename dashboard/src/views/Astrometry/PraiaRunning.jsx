import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Card from 'components/Card/Card.jsx';
import PraiaApi from './PraiaApi';
import { Tasks } from 'components/Tasks/Tasks.jsx';
class PraiaRunning extends Component {
  state = this.initialState;
  api = new PraiaApi();

  get initialState() {
    return {};
  }

  componentDidMount() {
    // console.log("Praia Config mount")
  }

  render() {
    return (
      <Card
        title="Running"
        category="Monitor the rounds Astrometry"
        content={<div />}
      />
    );
  }
}

export default PraiaRunning;
