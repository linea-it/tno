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
import Card from 'components/Card/Card.jsx';
import SkybotApi from './SkybotApi';
import plotPointings from 'assets/img/plotPointings.png';

const statistics = {
  classes: [
    { label: 'Centaur', value: 'Centaur' },
    { label: 'Hungaria', value: 'Hungaria' },
    { label: 'KBO>Classical>Inner', value: 'KBO>Classical>Inner' },
    { label: 'KBO>Classical>Main', value: 'KBO>Classical>Main' },
    { label: 'KBO>Detached', value: 'KBO>Detached' },
    { label: 'KBO>Resonant>11:3', value: 'KBO>Resonant>11:3' },
    { label: 'KBO>Resonant>11:6', value: 'KBO>Resonant>11:6' },
    { label: 'KBO>Resonant>11:8', value: 'KBO>Resonant>11:8' },
    { label: 'KBO>Resonant>19:9', value: 'KBO>Resonant>19:9' },
    { label: 'KBO>Resonant>2:1', value: 'KBO>Resonant>2:1' },
    { label: 'KBO>Resonant>3:1', value: 'KBO>Resonant>3:1' },
    { label: 'KBO>Resonant>3:2', value: 'KBO>Resonant>3:2' },
    { label: 'KBO>Resonant>4:3', value: 'KBO>Resonant>4:3' },
    { label: 'KBO>Resonant>5:2', value: 'KBO>Resonant>5:2' },
    { label: 'KBO>Resonant>5:3', value: 'KBO>Resonant>5:3' },
    { label: 'KBO>Resonant>5:4', value: 'KBO>Resonant>5:4' },
    { label: 'KBO>Resonant>7:2', value: 'KBO>Resonant>7:2' },
    { label: 'KBO>Resonant>7:3', value: 'KBO>Resonant>7:3' },
    { label: 'KBO>Resonant>7:4', value: 'KBO>Resonant>7:4' },
    { label: 'KBO>Resonant>9:4', value: 'KBO>Resonant>9:4' },
    { label: 'KBO>Resonant>9:5', value: 'KBO>Resonant>9:5' },
    { label: 'KBO>SDO', value: 'KBO>SDO' },
    { label: 'Mars-Crosser', value: 'Mars-Crosser' },
    { label: 'MB>Cybele', value: 'MB>Cybele' },
    { label: 'MB>Hilda', value: 'MB>Hilda' },
    { label: 'MB>Inner', value: 'MB>Inner' },
    { label: 'MB>Middle', value: 'MB>Middle' },
    { label: 'MB>Outer', value: 'MB>Outer' },
    { label: 'NEA>Amor', value: 'NEA>Amor' },
    { label: 'NEA>Apollo', value: 'NEA>Apollo' },
    { label: 'NEA>Aten', value: 'NEA>Aten' },
    { label: 'Trojan', value: 'Trojan' },
  ],

  band: [
    { label: 'u', value: 'u' },
    { label: 'i', value: 'i' },
    { label: 'z', value: 'z' },
    { label: 'r', value: 'r' },
    { label: 'Y', value: 'y' },
    { label: 'z', value: 'z' },
  ],
};

class SkybotStats extends Component {
  state = this.initialState;
  api = new SkybotApi();

  get initialState() {
    return {
      bandValue: [
        {
          label: 'u',
          value: 0,
        },
        {
          label: 'i',
          value: 0,
        },
        {
          label: 'z',
          value: 0,
        },
        {
          label: 'r',
          value: 0,
        },
        {
          label: 'g',
          value: 0,
        },
        {
          label: 'y',
          value: 0,
        },
      ],
      // band_u: 0,
      // band_i: 0,
      // band_z: 0,
      // band_r: 0,
      // band_g: 0,
      // band_y: 0,
    };
  }
  componentDidMount() {

    // for (let i = 0; i < statistics.band.length; i++) {
    //   this.api.getPointingBand_u().then(res => {
    //     const r = res.data;
    //     this.setState({
    //       ...this.state.bandValue[i] r.count);
    //     console.log('value r', r);
    //   });
    // }

    console.log('valor de band', this.state.bandValue);
    // this.api.getPointingBand_u().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_u: r.count,
    //   });
    // });
    // this.api.getPointingBand_y().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_y: r.count,
    //   });
    // });
    // this.api.getPointingBand_g().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_g: r.count,
    //   });
    // });
    // this.api.getPointingBand_i().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_i: r.count,
    //   });
    // });
    // this.api.getPointingBand_z().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_z: r.count,
    //   });
    // });
    // this.api.getPointingBand_r().then(res => {
    //   const r = res.data;
    //   this.setState({
    //     band_r: r.count,
    //   });
    // });
  }

  render() {
    const ListClass = [];
    const ListBand = [];

    //const tamanho = statistics.classes;

    for (let index = 0; index < statistics.classes.length; index++) {
      ListClass.push([
        <ListGroupItem>
          {statistics.classes[index].label} :&nbsp;<strong />
        </ListGroupItem>,
      ]);
    }

    for (let index = 0; index < statistics.band.length; index++) {
      ListBand.push([
        <ListGroupItem key={index}>
          {statistics.band[index].label} :&nbsp;<strong />
        </ListGroupItem>,
      ]);
    }

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
                <ListGroupItem>
                  Total number of objects (and their observations) for each
                  principal dynamic class
                  <br />
                  <br />
                  <ListGroup>{ListClass}</ListGroup>
                </ListGroupItem>
              </Col>
              <Col md={6}>
                <ListGroup>
                  <ListGroupItem>
                    <h5>
                      Total number of identified objects&nbsp;:&nbsp;&nbsp;
                      <strong>{this.state.totalSize}</strong>
                    </h5>
                  </ListGroupItem>
                  <ListGroupItem>
                    <h5>
                      Total number of objects (and observations) for each band
                      (u, g, r, i, z)
                      <br />
                      <br />
                      <ListGroup>{ListBand}</ListGroup>
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
                        Number of CCDs not downloaded&nbsp;:&nbsp;&nbsp;
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
              {/* <Col md={6}>
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
              </Col> */}
            </Row>
          </Grid>
        </Panel.Body>
      </Panel>
    );
  }
}

export default SkybotStats;
