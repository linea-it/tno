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
    { label: 'Centaur', value: '1229' },
    { label: 'Hungaria', value: '3232' },
    { label: 'KBO', value: '3930' },
    { label: 'Mars-Crosser', value: '332' },
    { label: 'MB', value: '200' },
    { label: 'NEA', value: '4232' },
    { label: 'Trojan', value: '223' },
  ],

  band: [
    { label: 'u', value: '365' },
    { label: 'i', value: '4545' },
    { label: 'z', value: '567' },
    { label: 'r', value: '3344' },
    { label: 'Y', value: '5466' },
    { label: 'z', value: '889' },
  ],
};

class SkybotStats extends Component {
  state = this.initialState;
  api = new SkybotApi();

  get initialState() {
    return {
      totalSize: '11204',
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
        <ListGroupItem key={index}>
          {statistics.classes[index].label} :&nbsp;
          <strong>{statistics.classes[index].value} </strong>
        </ListGroupItem>,
      ]);
    }

    for (let index = 0; index < statistics.band.length; index++) {
      ListBand.push([
        <ListGroupItem key={index}>
          {statistics.classes[index].label} :&nbsp;
          <strong> {statistics.band[index].value} </strong>
        </ListGroupItem>,
      ]);
    }

    return (
      <Panel bsStyle="info">
        <Panel.Heading>
          <Panel.Title componentClass="h1">
            <strong>Statistics of skybot</strong>
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
                <ListGroupItem>
                  <h5>
                    Total number of objects (and observations) for each band (u,
                    g, r, i, z)
                    <br />
                    <br />
                    <ListGroup>{ListBand}</ListGroup>
                  </h5>
                </ListGroupItem>
              </Col>

              <Col md={6}>
                <ListGroup>
                  <ListGroupItem>
                    <h5>
                      Total number of identified objects&nbsp;:&nbsp;&nbsp;
                      <strong>11204</strong>
                    </h5>
                  </ListGroupItem>
                  {/* <ListGroupItem>
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
                  </ListGroupItem> */}
                  <ListGroupItem>
                    <h5>
                      Total number of observations of all identified
                      objects&nbsp;:&nbsp;&nbsp;
                      <strong>11204</strong>
                    </h5>
                  </ListGroupItem>

                  <ListGroupItem>
                    <h5>
                      <span>
                        object with the largest number of
                        observations&nbsp;:&nbsp;&nbsp;
                      </span>
                      <strong>11204</strong>
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
