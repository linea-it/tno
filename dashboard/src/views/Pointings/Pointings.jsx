import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import PointingApi from './PointingApi';
import PointingList from './PointingList';
import PropTypes from 'prop-types';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
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
      status: {
        totalSizeTable: 8137,
        qtdBits: 25,
        qtdDownloaded: 312,
      },
    };
  }

  render() {
    const stats = this.state;
    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col lg={3} md={1} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-graph2 text-success" />}
                statsText="CCDs"
                statsValue={stats.status.totalSizeTable}
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText="Total quantity of CCDs"
              />
            </Col>

            <Col lg={3} md={1} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-success" />}
                statsText="Bits Size"
                statsValue={[stats.status.qtdBits, ' bits']}
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText="Number of CCDs for each band (u, g, r, i, z)"
              />
            </Col>
          </Row>

          {/* <Col lg={3} sm={6} md={8}>
              <Card
                title="Stats Images"
                category=""
                content={
                  <div />
                  // <Grid fluid>

                  //   <Row>

                  //     <Col md={6}>
                  //       <StatsCard
                  //         //bigIcon={<i className="pe-7s-server text-success" />}
                  //         statsText="Amount Downloaded"
                  //         statsValue={stats.status.qtdDownloaded}
                  //         statsIcon={<i className="fa fa-hdd-o" />}
                  //         statsIconText=""
                  //       />
                  //     </Col>

                  //     <Col md={6}>
                  //       <StatsCard
                  //         //bigIcon={<i className="pe-7s-server text-success" />}
                  //         statsText="Amount Downloaded"
                  //         statsValue={stats.status.qtdDownloaded}
                  //         statsIcon={<i className="fa fa-hdd-o" />}
                  //         statsIconText=""
                  //       />
                  //     </Col>

                  //   </Row>

                  // </Grid>
                }
              />
            </Col> */}
          <Row>
            <Col lg={3} md={1} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-success" />}
                statsText="ESTATISTICAS ESSA AQUI"
                statsValue=""
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col>
            {/* <Col lg={3} md={4} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-file-image-o" />}
                statsText="ESTATISTICAS"
                statsValue=""
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col> */}
            <Col lg={3} md={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-cloud-download" />}
                statsText="Amount already downloaded"
                statsValue="230"
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText=""
              />
            </Col>
          </Row>
          <Row>
            {/* <Col lg={3} md={3} sm={6}>
              <Card content={<p> to aqui </p>} />
            </Col> */}
            <Col md={12}>
              <Card
                title="Pointings"
                category="complete list with all entries recorded in the database. can search for expnum and filename"
                content={<PointingList />}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(PointingsPanel);
