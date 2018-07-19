import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  Panel,
  Button,
  ListGroup,
  ListGroupItem,
  Image,
} from 'react-bootstrap';
import Card from 'components/Card/Card.jsx';
import PointingApi from './PointingApi';
import plotPointings from 'assets/img/plotPointings.png';

class Statistics extends Component {
  state = this.initialState;
  api = new PointingApi();

  get initialState() {
    return {
      totalSize: 0,
      qtdBits: 25,
      qtdDownloaded: false,
      qtdNotDownloaded: false,
      band_u: 0,
      band_i: 0,
      band_z: 0,
      band_r: 0,
      band_g: 0,
      band_y: 0,
      exp1: 0,
      exp2: 0,
      exp3: 0,
      exp4: 0,
      dateConv: '',
      dateRecent: '',
    };
  }

  componentDidMount() {
    this.api.getPointingCount().then(res => {
      const r = res.data;
      this.setState({
        totalSize: r.count,
      });
    });
    this.api.getPointingBand_u().then(res => {
      const r = res.data;
      this.setState({
        band_u: r.count,
      });
    });
    this.api.getPointingBand_y().then(res => {
      const r = res.data;
      this.setState({
        band_y: r.count,
      });
    });
    this.api.getPointingBand_g().then(res => {
      const r = res.data;
      this.setState({
        band_g: r.count,
      });
    });
    this.api.getPointingBand_i().then(res => {
      const r = res.data;
      this.setState({
        band_i: r.count,
      });
    });
    this.api.getPointingBand_z().then(res => {
      const r = res.data;
      this.setState({
        band_z: r.count,
      });
    });
    this.api.getPointingBand_r().then(res => {
      const r = res.data;
      this.setState({
        band_r: r.count,
      });
    });
    this.api.getPointingBetween1().then(res => {
      const r = res.data;
      this.setState({
        exp1: r.count,
      });
    });
    this.api.getPointingBetween2().then(res => {
      const r = res.data;
      this.setState({
        exp2: r.count,
      });
    });
    this.api.getPointingBetween3().then(res => {
      const r = res.data;
      this.setState({
        exp3: r.count,
      });
    });
    this.api.getPointingBetween4().then(res => {
      const r = res.data;
      this.setState({
        exp4: r.count,
      });
    });
    this.api.getPointingDowloaded().then(res => {
      const r = res.data;
      this.setState({
        qtdDownloaded: r.count,
      });
    });

    this.api.getPointingNotDowloaded().then(res => {
      const r = res.data;
      this.setState({
        qtdNotDownloaded: r.count,
      });
    });
    this.api.getPointingDataRecent().then(res => {
      const r = res.data;
      const result = r.results[0].date_obs;
      this.setState({ dateRecent: result });
    });
  }

  render() {
    return (
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
                          <strong>{this.state.band_u}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          r :&nbsp;{<strong>{this.state.band_r}</strong>}
                        </ListGroupItem>
                        <ListGroupItem>
                          g :&nbsp;
                          <strong>{this.state.band_g}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          i :&nbsp;
                          <strong> {this.state.band_i}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          Y :&nbsp;
                          <strong>{this.state.band_y}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          z :&nbsp;
                          <strong> {this.state.band_z}</strong>
                        </ListGroupItem>
                      </ListGroup>
                    </h5>
                  </ListGroupItem>
                  <ListGroupItem>
                    <h5>
                      Number of CCDs in intervals of exposure time (seconds)
                      <br />
                      <br />
                      <ListGroup>
                        <ListGroupItem>
                          between 0 and 100 :&nbsp;
                          <strong>{this.state.exp1}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          between 100 and 200:&nbsp;
                          <strong>{this.state.exp2}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          between 200 and 300:&nbsp;
                          <strong>{this.state.exp3}</strong>
                        </ListGroupItem>
                        <ListGroupItem>
                          between 300 and 400:&nbsp;
                          <strong>{this.state.exp4}</strong>
                        </ListGroupItem>
                      </ListGroup>
                    </h5>
                  </ListGroupItem>
                  <ListGroupItem>
                    <h5>
                      Number of CCDs downloaded&nbsp;:&nbsp;&nbsp;
                      <strong>{this.state.qtdDownloaded}</strong>
                    </h5>
                  </ListGroupItem>
                  <ListGroupItem>
                    <h5>
                      <span>
                        Number of CCDs don't downloaded&nbsp;:&nbsp;&nbsp;
                      </span>
                      <strong>{this.state.qtdNotDownloaded}</strong>
                    </h5>
                  </ListGroupItem>
                  <ListGroupItem>
                    <h5>
                      <span>Latest pointing data&nbsp;:&nbsp;&nbsp;</span>
                      <strong>{this.state.dateRecent}</strong>
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
    );
  }
}

export default Statistics;
