import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import SkybotApi from './SkybotApi';
import GetSkybot from './GetSkybot';

class SolarSystemsPanel extends Component {
  state = this.initialState;
  api = new SkybotApi();

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
              <GetSkybot />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(SolarSystemsPanel);
