import React, { Component } from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import SkybotApi from './SkybotApi';
import SkybotList from './SkybotList';
// import FilterSkybot from './FilterSkybot';
import Card from 'components/Card/Card.jsx';
import SkybotStats from './SkybotStats';

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
              <SkybotStats />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Panel bsStyle="info">
                <Panel.Heading>
                  <Panel.Title componentClass="h1">
                    <strong>List with all pointings</strong>
                  </Panel.Title>
                </Panel.Heading>
                <Card
                  title="SkyBot Output"
                  category="complete list with all entries recorded in the database. can search for object name and number"
                  content={<SkybotList />}
                />
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(SolarSystemsPanel);
