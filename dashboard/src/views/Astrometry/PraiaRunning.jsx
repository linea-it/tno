import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Card from 'components/Card/Card.jsx';
import PraiaApi from './PraiaApi';
import PropTypes from 'prop-types';
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
          title=""
          category="Monitor the rounds Praia"
          content={
            <Grid fluid>
              <Row>
                <Col md={6}>
                  <Card
                    id="chartActivity"
                    title="2014 Sales"
                    category="All products including Taxes"
                    stats="Data information certified"
                    statsIcon="fa fa-check"
                    content={
                      <div className="ct-chart">
                        {/* <ChartistGraph
                          data={dataBar}
                          type="Bar"
                          options={optionsBar}
                          responsiveOptions={responsiveBar}
                        /> */}
                      </div>
                    }
                  />
                </Col>
                <Col md={6}>
                  <Card
                    title="Tasks"
                    category="Backend development"
                    stats="Updated 3 minutes ago"
                    statsIcon="fa fa-history"
                    content={
                      <div className="table-full-width">
                        <table className="table">
                          <Tasks />
                        </table>
                      </div>
                    }
                  />
                </Col>
              </Row>
          </Grid>
        }
      />
    );
  }
}

export default PraiaRunning;
