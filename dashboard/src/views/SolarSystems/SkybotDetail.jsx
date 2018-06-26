import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  ButtonToolbar,
  ButtonGroup,
  Button,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import Properties from './Properties';
import Observation from './Observation';
import OrbitalParameters from './OrbitalParameters';
import PlotCCD from './PlotCCD';
// import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';

import SkybotApi from './SkybotApi';

class SkybotDetail extends Component {
  state = this.initialState;
  api = new SkybotApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
    record: PropTypes.object,
    history: PropTypes.any.isRequired,
  };

  //   record_properties = [
  //     {
  //       text: 'ID',
  //       dataField: 'id',
  //       helpText:
  //         'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //     },
  //     {
  //       text: 'Pointings',
  //       dataField: 'pointing',
  //       helpText:
  //         'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //     },
  //     {
  //       text: 'Name',
  //       dataField: 'name',
  //       helpText:
  //         'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //     },
  //     {
  //       text: 'Object classification',
  //       dataField: 'dynclass',
  //       helpText:
  //         'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //     },
  //     {
  //       text: 'Object classification',
  //       dataField: 'id',
  //       helpText:
  //         'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //     },
  //   {
  //     text: 'ID',
  //     dataField: 'id',
  //     helpText:
  //       'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //   },
  //   {
  //     text: 'ID',
  //     dataField: 'id',
  //     helpText:
  //       'Unique identifier for each image (1 image is composed by 62 CCDs)',
  //   },
  //   ];

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      record: {},
    };
  }

  componentDidMount() {
    //console.log('componentDidMount');
    const {
      match: { params },
    } = this.props;
    // console.log('ID: ', params.id);

    this.api.getSkybotRecord({ id: params.id }).then(res => {
      const record = res.data;
      //console.log(record);

      this.setState({ record: record });
    });
  }

  onClick = () => {
    console.log('foi clicado');
    this.props.history.goBack();
  };

  render() {
    const { record } = this.state;

    console.log('Render: recodord(%o)', record);

    // const body = [];

    // if (record) {
    //   this.record_properties.forEach((p, i) => {
    //     const { text, dataField } = p;

    //     body.push(
    //       <span key={i}>
    //         <b> {text} </b>:
    //         {record[dataField].toString()}
    //         <br />
    //       </span>
    //     );
    //   });
    // }
    return (
      <div className="content">
        <Card
          title="Detail"
          category=""
          content={
            <Grid fluid>
              <Row>
                <Col mdOffset={11}>
                  <Button onClick={this.onClick}>back</Button>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Properties record={record} />
                </Col>
                <Col md={4}>
                  <OrbitalParameters />
                </Col>
                <Col md={4}>
                  <PlotCCD />
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Observation />
                </Col>
              </Row>
            </Grid>
          }
        />
      </div>
    );
  }
}

export default withRouter(SkybotDetail);
