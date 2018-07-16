import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  Panel,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PointingApi from './PointingApi';
import PointingList from './PointingList';
import PropTypes from 'prop-types';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import Card from 'components/Card/Card.jsx';
import ChartistGraph from 'react-chartist';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

class PointingsPanel extends Component {
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
      status: {
        totalSizeTable: 8137,
        qtdBits: 25,
        qtdDownloaded: 312,
        band_u: 3002,
        band_i: 2353,
        band_z: 1243,
        band_r: 2222,
        band_g: 434,
        band_y: 4332,
      },
    };
  }

  render() {
    //const stats = this.state;
    return (
      <div className="content">
        <Grid fluid>
          {/* </Grid>

        <Grid fluid> */}
          <Row>
            <Col md={12}>
              <Card
                title="Pointings"
                category="complete list with all entries recorded in the database. can search for expnum and filename"
                content={<PointingList />}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Panel bsStyle="info">
                <Panel.Heading>
                  <Panel.Title componentClass="h1">
                    <strong>Estatísticas</strong>
                  </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                  <Grid fluid>
                    <Row>
                      <Col md={6}>
                        <ListGroup>
                          <ListGroupItem>
                            <h5>
                              Total of CCDs&nbsp;:&nbsp;&nbsp;
                              <strong>
                                {this.state.status.totalSizeTable}
                              </strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs for each band
                              <strong> ( u )</strong>, &nbsp;:&nbsp;&nbsp;
                              <strong>{this.state.status.band_u}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs for each band
                              <strong> ( r )</strong>, &nbsp;:&nbsp;&nbsp;
                              <strong>{this.state.status.band_r}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs for each band ( g )
                              &nbsp;:&nbsp;&nbsp;
                              <strong>{this.state.status.band_g}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs for each band ( i )
                              &nbsp;:&nbsp;&nbsp;
                              <strong>{this.state.status.band_i}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>Number of CCDs for each band</h5>
                            &nbsp;:&nbsp;&nbsp;
                            <ListGroup>
                              <ListGroupItem>g : 100</ListGroupItem>
                              <ListGroupItem>r : 1000</ListGroupItem>
                              {/* <strong>{this.state.status.band_z}</strong> */}
                            </ListGroup>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs for each band ( Y )
                              &nbsp;:&nbsp;&nbsp;
                              <strong>{this.state.status.band_y}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs in intervals of exposure
                              time&nbsp;:&nbsp;&nbsp;
                              <strong>
                                {this.state.status.totalSizeTable}
                              </strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs downloaded&nbsp;:&nbsp;&nbsp;
                              <strong>
                                {this.state.status.totalSizeTable}
                              </strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs don't downloaded&nbsp;:&nbsp;&nbsp;
                              <strong>
                                {this.state.status.totalSizeTable}
                              </strong>
                            </h5>
                          </ListGroupItem>
                        </ListGroup>
                      </Col>
                      <Col md={6}>
                        <Card
                          title=" Pointings in sky"
                          category="placeholder - plot with the projection of pointings in sky"
                          content={
                            <div id="chartPreferences" className="ct-chart" />
                          }
                        />
                      </Col>
                    </Row>
                  </Grid>
                </Panel.Body>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(PointingsPanel);
