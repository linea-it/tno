import React, { Component } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import Properties from './Properties';
import Observation from './Observation';
import OrbitalParameters from './OrbitalParameters';
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

  onDoubleClick = () => {
    console.log('foi clicado');
    this.props.history.goBack();
  };

  render() {
    const { record } = this.state;

    //console.log('Render: recodord(%o)', record);
    return (
      <div className="content">
        <Card
          title="Detail"
          category=""
          content={
            <Grid fluid>
              <Row>
                <Col mdOffset={11}>
                  <Button onClick={this.onDoubleClick}>back</Button>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Properties record={record} />
                </Col>
                <Col md={8}>
                  <Row>
                    <Col md={12}>
                      <OrbitalParameters />
                    </Col>
                    {/* <Col md={12}>
                      <PlotCCD />
                    </Col> */}
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Observation />
                    </Col>
                  </Row>
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
