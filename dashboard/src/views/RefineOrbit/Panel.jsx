import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import RefineOrbitSubmit from './Submit';
import RefineOrbitRunning from './Running';
import RefineOrbitHistory from './History';
import PropTypes from 'prop-types';
import Card from 'components/Card/Card.jsx';
class RefineOrbitPanel extends Component {
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
    this.setState(this.state);
  };

  render() {
    const { record } = this.state;
    return (
      <div className="content">
        <Card
          title="Refine Orbit (NIMA)"
          category="DESCRIÇÃO SOBRE A ETAPA"
          content={
            <Grid fluid>
              <Row>
                <Col md={4}>
                  <RefineOrbitSubmit onCreateRun={this.onCreateRun} />
                </Col>
                <Col md={8}>
                  <RefineOrbitRunning record={record} />
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <RefineOrbitHistory />
                </Col>
              </Row>
            </Grid>
          }
        />
      </div>
    );
  }
}

export default withRouter(RefineOrbitPanel);
