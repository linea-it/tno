import React, { Component } from 'react';

import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Icon, Statistic } from 'semantic-ui-react';
// import Card from 'components/Card/Card.jsx';
import { Card } from 'primereact/card';

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
    { label: 'g', value: '365' },
    { label: 'r', value: '4545' },
    { label: 'Y', value: '567' },
    { label: 'z', value: '3344' },
    { label: 'i', value: '5466' },
    { label: 'u', value: '889' },
  ],
};

const band = [
  { name: 'g', objects: 590, observations: 800, amt: 1400 },
  { name: 'r', objects: 868, observations: 967, amt: 1506 },
  { name: 'Y', objects: 1397, observations: 1098, amt: 989 },
  { name: 'z', objects: 1480, observations: 1200, amt: 1228 },
  { name: 'i', objects: 1520, observations: 1108, amt: 1100 },
  { name: 'u', objects: 1400, observations: 680, amt: 1700 },
];

const objects = [
  { name: 'Hungaria', objects: 590, observations: 800, Media: 1400 },
  { name: 'KBO', objects: 868, observations: 967, Media: 1506 },
  { name: 'Mars-Crosser', objects: 1397, observations: 1098, Media: 989 },
  { name: 'MB', objects: 1480, observations: 1200, Media: 1228 },
  { name: 'NEA', objects: 1520, observations: 1108, Media: 1100 },
  { name: 'Trojan', objects: 1400, observations: 680, Media: 1700 },
];

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
    // const ListClass = [];
    // const ListBand = [];

    //const tamanho = statistics.classes;

    // for (let index = 0; index < statistics.classes.length; index++) {
    //   ListClass.push([
    //     <ListGroupItem key={index}>
    //       {statistics.classes[index].label} :&nbsp;
    //       <strong>{statistics.classes[index].value} </strong>
    //     </ListGroupItem>,
    //   ]);
    // }

    // for (let index = 0; index < statistics.band.length; index++) {
    //   ListBand.push([
    //     <ListGroupItem key={index}>
    //       {statistics.classes[index].label} :&nbsp;
    //       <strong> {statistics.band[index].value} </strong>
    //     </ListGroupItem>,
    //   ]);
    // }

    return (
      // <Panel bsStyle="info">
      //   <Panel.Heading>
      //     <Panel.Title componentClass="h1">
      //       <strong>Statistics of skybot</strong>
      //     </Panel.Title>
      //   </Panel.Heading>
      //   <Panel.Body>
      //     <Grid fluid>
      //       <Row>
      //         <Col md={6}>
      //           <ListGroupItem>
      //             Total number of objects (and their observations) for each
      //             principal dynamic class
      //             <br />
      //             <br />
      //             <ListGroup>{ListClass}</ListGroup>
      //           </ListGroupItem>
      //           <ListGroupItem>
      //             <h5>
      //               Total number of objects (and observations) for each band (u,
      //               g, r, i, z)
      //               <br />
      //               <br />
      //               <ListGroup>{ListBand}</ListGroup>
      //             </h5>
      //           </ListGroupItem>
      //         </Col>

      //         <Col md={6}>
      //           <ListGroup>
      //             <ListGroupItem>
      //               <h5>
      //                 Total number of identified objects&nbsp;:&nbsp;&nbsp;
      //                 <strong>11204</strong>
      //               </h5>
      //             </ListGroupItem>
      //             {/* <ListGroupItem>
      //               <h5>
      //                 Number of CCDs in intervals of exposure time (seconds)
      //                 <br />
      //                 <br />
      //                 <ListGroup>
      //                   <ListGroupItem>
      //                     between 0 and 100 :&nbsp;
      //                     <strong>{this.state.exp1}</strong>
      //                   </ListGroupItem>
      //                   <ListGroupItem>
      //                     between 100 and 200:&nbsp;
      //                     <strong>{this.state.exp2}</strong>
      //                   </ListGroupItem>
      //                   <ListGroupItem>
      //                     between 200 and 300:&nbsp;
      //                     <strong>{this.state.exp3}</strong>
      //                   </ListGroupItem>
      //                   <ListGroupItem>
      //                     between 300 and 400:&nbsp;
      //                     <strong>{this.state.exp4}</strong>
      //                   </ListGroupItem>
      //                 </ListGroup>
      //               </h5>
      //             </ListGroupItem> */}
      //             <ListGroupItem>
      //               <h5>
      //                 Total number of observations of all identified
      //                 objects&nbsp;:&nbsp;&nbsp;
      //                 <strong>11204</strong>
      //               </h5>
      //             </ListGroupItem>

      //             <ListGroupItem>
      //               <h5>
      //                 <span>
      //                   object with the largest number of
      //                   observations&nbsp;:&nbsp;&nbsp;
      //                 </span>
      //                 <strong>11204</strong>
      //               </h5>
      //             </ListGroupItem>
      //           </ListGroup>
      //         </Col>
      //       </Row>
      //     </Grid>
      //   </Panel.Body>
      // </Panel>
      <div className="ui-g">
        <div className="ui-g-12">
          <div className="ui-g-6">
            <Card subTitle="Total number of objects (and their observations) for each">
              <ComposedChart
                width={600}
                height={400}
                data={objects}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend className="legend-chart" />
                <Area
                  type="monotone"
                  dataKey="Media"
                  fill="#007892"
                  stroke="#8884d8"
                />
                <Bar dataKey="observations" barSize={20} fill="#6435c9" />
                <Line type="monotone" dataKey="objects" stroke="#ff7300" />
              </ComposedChart>
            </Card>
          </div>

          <div className="ui-g-6">
            <Card subTitle="Total number of objects (and observations) for each band (u,g, r, i, z)">
              <ComposedChart
                width={600}
                height={400}
                data={band}
                margin={{ top: 20, right: 80, bottom: 20, left: 20 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <CartesianGrid stroke="#f5f5f5" />
                <Area
                  type="monotone"
                  dataKey=""
                  fill="#00b5ad"
                  stroke="#00b5ad"
                />
                <Bar dataKey="objects" barSize={20} fill="#6435c9" />
                <Line type="monotone" dataKey="observations" stroke="#ff7300" />
              </ComposedChart>
            </Card>
          </div>
        </div>

        <div className="ui-g-4">
          <Card title="" subTitle="">
            <div className="ui horizontal teal statistic">
              <div className="value">
                <Icon name="database" /> {this.state.totalSize}
              </div>
              <div className="label">Total of CCDs</div>
            </div>
            {/* <p>
                Total of CCDs&nbsp;:&nbsp;&nbsp;
                <strong>{this.state.totalSize}</strong>
              </p> */}
          </Card>
        </div>

        <div className="ui-g-4">
          <Card title="" subTitle="">
            <div className="ui horizontal  violet statistic">
              <div className="value">
                <Icon name="search" />
                {this.state.totalSize}
              </div>
              <div className="label">
                Total number of observations <br /> of all identified object
              </div>
            </div>
          </Card>
        </div>

        <div className="ui-g-4">
          <Card title="" subTitle="">
            <div className="ui horizontal teal statistic">
              <div className="value ">
                <Icon
                  name="flag checkered
"
                />
                2013 RR98
              </div>
              <div className="label">
                object with the largest <br /> number of observations
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

export default SkybotStats;
