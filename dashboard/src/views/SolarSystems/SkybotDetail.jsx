import React, { Component } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import Observation from './Observation';
import PropTypes from 'prop-types';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import SkybotApi from './SkybotApi';
import PropertiesSkybot from './Properties';

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
      sizePerPage: '',
      loading: false,
      record: {},
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.api.getSkybotRecord({ id: params.id }).then(res => {
      const record = res.data;

      this.setState({ record: record });
    });
  }

  onClick = () => {
    this.props.history.goBack();
  };

  render() {
    const { record } = this.state;

    return (
      <div className="content">
        <Card
          title="Detail"
          category="These are the details of the object of name Lorem Ipsum and number 000"
          content={
            <Grid fluid>
              <Row>
                <Col mdOffset={11}>
                  <Button onClick={this.onClick}>back</Button>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <PropertiesSkybot record={record} />
                </Col>
                <Col md={8}>
                  <Row>
                    {/* <Col md={12}>
                      <OrbitalParameters />
                    </Col> */}
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Observation />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col mdOffset={11}>
                  <Button onClick={this.onClick}>back</Button>
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
