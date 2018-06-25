import React, { Component } from 'react';
import { Grid, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PointingApi from './PointingApi';
import GetPointings from './GetPointings';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';


class Get extends Component {
  state = this.initialState;
  api = new PointingApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
    };
  }

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Tabs
                defaultActiveKey={1}
                animation={true}
                id="noanim-tab-example"
              >
                <Tab eventKey={1} title="Get">
                  {/* <GetPointings /> */}
                </Tab>
                <Tab eventKey={2} title="Pointings">
                  <GetPointings />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(Get);
