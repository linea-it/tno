import React, { Component } from 'react';
import { Grid, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import PraiaApi from './PraiaApi';
import PraiaHistory from './PraiaHistory';
import PraiaConfig from './PraiaConfig';
import PraiaRunning from './PraiaRunning';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatDateUTC, formatColumnHeader } from 'utils';

class Praia extends Component {
  state = this.initialState;
  api = new PraiaApi();

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
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    // console.log('handleTableChange(%o, %o)', page, sizePerPage);

    this.fetchData(page, sizePerPage);
  };

  fetchData = (page, pageSize) => {
    // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

    this.setState({ loading: true });

    this.api.getCustomLists({ page: page, pageSize: pageSize }).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        loading: false,
      });
    });
  };

  render() {
    const { data, sizePerPage, page, totalSize, loading } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

    const history = this.props.history;

    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Tabs
                defaultActiveKey={1}
                animation={true}
                id="noanim-tab-example"
              >
                <Tab eventKey={1} title="PRAIA">
                  <PraiaConfig />
                </Tab>
                <Tab eventKey={2} title="Runing">
                  <PraiaRunning />
                </Tab>
                <Tab eventKey={3} title="History">
                  <PraiaHistory />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(Praia);
