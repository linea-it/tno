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
    return {
      inputs: [],
    };
  }

  componentDidMount() {

  }

  render() {
    const { inputs } = this.state;
    return (
      <div className="content">
        <Tabs defaultActiveKey={1} animation={true}>
          <Tab eventKey={1} title="PRAIA">
            <Card
              title=""
              category="Manage and monitor the rounds Praia"
              content={
                <Grid fluid>
                  <Row>
                    <Col md={12}>
                      <PraiaSubmit />
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <PraiaConfig />
                    </Col>
                  </Row>
                </Grid>
              }
            />
          </Tab>
          <Tab eventKey={2} title="Runing">
            <PraiaRunning />
          </Tab>
          <Tab eventKey={3} title="History">
            <PraiaHistory />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withRouter(Praia);
