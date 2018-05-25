import React, { Component } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import ObjectApi from './ObjectApi';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { coordinateFormater, formatColumnHeader } from 'utils';

function exposureFormatter(cell, row, rowindex, formatExtraData) {
  if (parseFloat(row.file_size) > 0) {
    return <i className={formatExtraData['success']} />;
  } else {
    return <i className={formatExtraData['failure']} />;
  }
}

function externalLinkFormatter(cell, row) {
  return (
    <a href={row.externallink} target="_blank">
      <i className="fa fa-info-circle text-primary" />
    </a>
  );
}

const columns = [
  { dataField: 'name', text: 'Name' },
  { dataField: 'dynclass', text: 'Class' },
  {
    dataField: 'raj2000',
    text: 'RA',
    formatter: coordinateFormater,
    width: 80,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'decj2000',
    text: 'Dec',
    formatter: coordinateFormater,
    width: 80,
    headerStyle: formatColumnHeader,
  },
  { dataField: 'mv', text: 'mv', width: 60, headerStyle: formatColumnHeader },
  {
    dataField: 'errpos',
    text: 'errpos',
    width: 70,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'jdref',
    text: 'jdref',
    width: 80,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'band',
    text: 'band',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'filename',
    text: 'Exposure',
    align: 'center',
    formatter: exposureFormatter,
    formatExtraData: {
      success: 'fa fa-check text-success',
      failure: 'fa fa-exclamation-triangle text-warning',
    },
    width: 80,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'externallink',
    text: 'VizieR',
    align: 'center',
    formatter: externalLinkFormatter,
    width: 60,
    headerStyle: formatColumnHeader,
  },
];

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
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
    };
  }

  componentDidMount() {
    console.log('componentDidMount()');
    const {
      match: { params },
    } = this.props;

    this.api.getList({ id: params.id }).then(res => {
      this.setState(
        {
          id: res.data.id,
          customList: res.data,
        },
        this.fetchData(
          res.data.tablename,
          this.state.page,
          this.state.sizePerPage
        )
      );
    });
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    console.log('handleTableChange(%o, %o)', page, sizePerPage);

    const tablename = this.state.customList.tablename;
    this.fetchData(tablename, page, sizePerPage);
  };

  fetchData = (tablename, page, pageSize) => {
    console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

    this.setState({ loading: true });

    this.api
      .listObjects({ tablename: tablename, page: page, pageSize: pageSize })
      .then(res => {
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
                content={
                  <BootstrapTable
                    striped
                    hover
                    condensed
                    remote
                    bordered={false}
                    keyField="id"
                    noDataIndication="no results to display"
                    data={data}
                    columns={columns}
                    pagination={pagination}
                    onTableChange={this.handleTableChange}
                    loading={loading}
                    overlay={overlayFactory({
                      spinner: true,
                      background: 'rgba(192,192,192,0.3)',
                    })}
                  />
                }
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default withRouter(ObjectList);
