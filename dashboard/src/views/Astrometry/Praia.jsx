import React, { Component } from 'react';
import { Tabs, Tab, Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PraiaApi from './PraiaApi';
import PraiaSubmit from './PraiaSubmit';
import PraiaHistory from './PraiaHistory';
import PraiaConfig from './PraiaConfig';
import PraiaRunning from './PraiaRunning';
import PropTypes from 'prop-types';
import Card from 'components/Card/Card.jsx';
class Praia extends Component {
  state = this.initialState;
  api = new PraiaApi();
  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {};
  }

  componentDidMount() {}

  render() {
    return (
      <div className="content">
        <Card
          title="Astrometry"
          category="DESCRIÇÃO SOBRE A ETAPA DE ASTROMETRY"
          content={
            <Grid fluid>
              <Row>
                <Col md={4}>
                  <PraiaSubmit />
                </Col>
                <Col md={8}>
                  <PraiaRunning />
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <PraiaHistory />
                </Col>
              </Row>
            </Grid>
          }
        />
      </div>
    );
  }
}

export default withRouter(Praia);
