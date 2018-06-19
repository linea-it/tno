import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
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

// https://github.com/zlargon/react-highlight
import Highlight from 'react-syntax-highlight';
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/atom-one-light.css';

// https://github.com/zeroturnaround/sql-formatter
import sqlFormatter from 'sql-formatter';

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
  { dataField: 'dynclass', text: 'Class' },
  { dataField: 'name', text: 'Name' },
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
    text: 'CCD',
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
      customList: {
        sql_creation: '',
        sql: '',
      },
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.api.getListStats({ id: params.id }).then(res => {
      const data = res.data.data;

      this.setState(
        {
          id: res.data.id,
          customList: data,
        },
        this.fetchData(data.tablename, this.state.page, this.state.sizePerPage)
      );
    });
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    // console.log('handleTableChange(%o, %o)', page, sizePerPage);

    const tablename = this.state.customList.tablename;
    this.fetchData(tablename, page, sizePerPage);
  };

  fetchData = (tablename, page, pageSize) => {
    // console.log('fetchData(%o, %o, %o)', tablename, page, pageSize);

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
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      customList,
    } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

    // Formating Create Date
    const date = new Date(customList.creation_date);
    const create_date = date.toUTCString();

    // Formating SQL
    const sql = sqlFormatter.format(customList.sql);
    const sql_create = sqlFormatter.format(customList.sql_creation);

    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-file-image-o text-success" />}
                statsText="Exposures"
                statsValue={this.state.customList.distinct_pointing}
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText={this.state.customList.size_ccdimages}
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="pe-7s-server text-warning" />}
                statsText="CCDs"
                statsValue={this.state.customList.rows}
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText={this.state.customList.h_size}
              />
            </Col>
            <Col lg={3} sm={6}>
              <StatsCard
                bigIcon={<i className="fa fa-download text-danger" />}
                statsText="Need to be Download"
                statsValue={this.state.customList.missing_pointing}
                statsIcon={<i className="fa fa-hdd-o" />}
                statsIconText={this.state.customList.size_pointing_missing}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card
                title={this.state.customList.displayname}
                category=""
                content={
                  <div>
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
                    <span>{totalSize} CCDs</span>
                  </div>
                }
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Card
                title="Detail"
                category=""
                content={
                  <div>
                    <span>
                      <b>Owner:</b> {customList.owner}
                    </span>
                    <br />
                    <span>
                      <b>Display Name:</b> {customList.displayname}
                    </span>
                    <br />
                    <span>
                      <b>Tablename:</b> {customList.tablename}
                    </span>
                    <br />
                    <span>
                      <b>Creation Date:</b> {create_date}
                    </span>
                    <br />
                    <span>
                      <b>Description:</b> {customList.description}
                    </span>
                    <br />
                    <span>
                      <b>Objects:</b> {customList.distinct_objects}
                    </span>
                    <br />
                    <span>
                      <b>Rows:</b> {customList.rows}
                    </span>
                    <br />
                    <span>
                      <b>Pointings:</b> {customList.distinct_pointing}
                    </span>
                    <br />
                    <span>
                      <b>Object Table:</b> {customList.filter_dynclass}
                    </span>
                    <br />
                    <span>
                      <b>Magnitude:</b> {customList.filter_magnitude}
                    </span>
                    <br />
                    <span>
                      <b>Minimun difference time between observations:</b>
                      {customList.filter_diffdatenights}
                    </span>
                    <br />
                    <span>
                      <b>More than one Filter:</b>{' '}
                      {customList.filter_morefilter}
                    </span>
                    <br />
                    <span>
                      <b>SQL:</b>
                    </span>
                    <Highlight lang="sql" value={sql} />
                    <span>
                      <b>SQL Create:</b>
                    </span>
                    <Highlight lang="sql" value={sql_create} />
                  </div>
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
