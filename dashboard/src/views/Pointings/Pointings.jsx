import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  Panel,
  ListGroup,
  ListGroupItem,
  Image,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PointingApi from './PointingApi';
import PointingList from './PointingList';
import PropTypes from 'prop-types';
import Card from 'components/Card/Card.jsx';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import plotPointings from 'assets/img/plotPointings.png';

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
      totalSize: 8137,
      sizePerPage: 10,
      loading: false,
      status: {
        qtdBits: 25,
        qtdDownloaded: 7012,
        qtdNotDownloaded: 1125,
        band_u: 64,
        band_i: 1772,
        band_z: 3072,
        band_r: 1574,
        band_g: 1595,
        band_y: 60,
        exp1: 3263,
        exp2: 2457,
        exp3: 1641,
        exp4: 2417,
        dateRecent: '2016-03-07',
      },
    };
  }

  componentDidMount() {
    this.api.getPointingCount().then(res => {
      const r = res.data;
      this.setState({
        totalSize: r.count,
      });
    });

    // this.api.getPointingCount().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_u: r.band_u,
    //   });

    //   // this.setState({ record: record });
    // });
  }
  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Panel bsStyle="info">
                <Panel.Heading>
                  <Panel.Title componentClass="h1">
                    <strong>List with all pointings</strong>
                  </Panel.Title>
                </Panel.Heading>
                <Card
                  //title="Pointings"
                  category="complete list with all entries recorded in the database. can search for expnum and filename"
                  content={<PointingList />}
                />
              </Panel>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Panel bsStyle="info">
                <Panel.Heading>
                  <Panel.Title componentClass="h1">
                    <strong>Statistics of pointings</strong>
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
                              <strong>{this.state.totalSize}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs for each band
                              <br />
                              <br />
                              <ListGroup>
                                <ListGroupItem>
                                  u :&nbsp;
                                  <strong>{this.state.status.band_u}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  r :&nbsp;{
                                    <strong>{this.state.status.band_r}</strong>
                                  }
                                </ListGroupItem>
                                <ListGroupItem>
                                  g :&nbsp;
                                  <strong>{this.state.status.band_g}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  i :&nbsp;
                                  <strong> {this.state.status.band_i}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  Y :&nbsp;
                                  <strong>{this.state.status.band_y}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  z :&nbsp;
                                  <strong> {this.state.status.band_z}</strong>
                                </ListGroupItem>
                              </ListGroup>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs in intervals of exposure time
                              (seconds)
                              <br />
                              <br />
                              <ListGroup>
                                <ListGroupItem>
                                  between 0 and 100 :&nbsp;
                                  <strong>{this.state.status.exp1}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  between 100 and 200:&nbsp;
                                  <strong>{this.state.status.exp2}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  between 200 and 300:&nbsp;
                                  <strong>{this.state.status.exp3}</strong>
                                </ListGroupItem>
                                <ListGroupItem>
                                  between 300 and 400:&nbsp;
                                  <strong>{this.state.status.exp4}</strong>
                                </ListGroupItem>
                              </ListGroup>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              Number of CCDs downloaded&nbsp;:&nbsp;&nbsp;
                              <strong>{this.state.status.qtdDownloaded}</strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              <span>
                                Number of CCDs don't
                                downloaded&nbsp;:&nbsp;&nbsp;
                              </span>
                              <strong>
                                {this.state.status.qtdNotDownloaded}
                              </strong>
                            </h5>
                          </ListGroupItem>
                          <ListGroupItem>
                            <h5>
                              <span>
                                Latest pointing data&nbsp;:&nbsp;&nbsp;
                              </span>
                              <strong>{this.state.status.dateRecent}</strong>
                            </h5>
                          </ListGroupItem>
                        </ListGroup>
                      </Col>
                      <Col md={6}>
                        <Card
                          title=" Pointings in sky"
                          category="placeholder - plot with the projection of pointings in sky"
                          content={
                            <div>
                              <br />
                              <figure>
                                <Image alt="text" src={plotPointings} />
                              </figure>
                            </div>
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
