import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import ObjectTable from './ObjectTable';
import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';

class ObjectList extends Component {
  state = this.initialState;
  api = new ObjectApi();

  static propTypes = {
    match: PropTypes.object.isRequired,
  };

  get initialState() {
    return {
      id: null,
      customList: {},
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.api.getList({ id: params.id }).then(res => {
      this.setState(
        {
          id: res.data.id,
          customList: res.data,
        },
        this.loadObjects
      );
    });
  };

  render() {
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-warning" />}
                statsText="Rows"
                statsValue={this.state.customList.rows}
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText={this.state.customList.h_size}
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-file-image-o text-success" />}
                statsText="Exposures"
                statsValue="1345"
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText="TAMANHO DAS EXPOSURES"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-graph1 text-danger" />}
                statsText="Errors"
                statsValue="23"
                statsIcon={<i className="fa fa-clock-o" />}
                statsIconText="In the last hour"
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-twitter text-info" />}
                statsText="Followers"
                statsValue="+45"
                statsIcon={<i className="fa fa-refresh" />}
                statsIconText="Updated now"
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card
                title={this.state.customList.displayname}
                category=""
                content={<ObjectTable />}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(ObjectList);
