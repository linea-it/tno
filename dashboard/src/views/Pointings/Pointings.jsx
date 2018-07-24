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
import PointingsStats from './PointingsStats';
import PointingList from './PointingList';
import PropTypes from 'prop-types';
import Card from 'components/Card/Card.jsx';
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
              <PointingsStats />
            </Col>
          </Row>
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
        </Grid>
      </div>
    );
  }
}

export default withRouter(PointingsPanel);
