import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import SkybotApi from './SkybotApi';
import SkybotList from './SkybotList';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import FilterSkybot from './FilterSkybot';
import Card from 'components/Card/Card.jsx';

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
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-success" />}
                statsText="ESTATISTICAS"
                statsValue=""
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-success" />}
                statsText="ESTATISTICAS"
                statsValue=""
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-success" />}
                statsText="ESTATISTICAS"
                statsValue=""
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-success" />}
                statsText="ESTATISTICAS"
                statsValue=""
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card
                title="SkyBot Output"
                category="complete list with all entries recorded in the database. can search for object name and number"
                content={<SkybotList />}
              />
            </Col>
          </Row>
        </Grid>
        <FilterSkybot />
      </div>
    );
  }
}

export default withRouter(SolarSystemsPanel);
