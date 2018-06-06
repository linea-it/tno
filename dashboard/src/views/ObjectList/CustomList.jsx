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
import { formatDateUTC, formatColumnHeader } from 'utils';

// https://github.com/zlargon/react-highlight
import Highlight from 'react-syntax-highlight';
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/atom-one-light.css';

// https://github.com/zeroturnaround/sql-formatter
import sqlFormatter from 'sql-formatter';

const columns = [
  {
    text: 'Id',
    dataField: 'id',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Owner',
    dataField: 'owner',
    width: 120,
    headerStyle: formatColumnHeader,
  },
  { text: 'Name', dataField: 'displayname' },
  {
    text: 'Rows',
    dataField: 'rows',
  },
  {
    text: 'Size',
    dataField: 'h_size',
  },
  {
    text: 'Date',
    dataField: 'creation_date',
    formatter: formatDateUTC,
  },
  {
    text: 'Status',
    dataField: 'status',
    width: 80,
    headerStyle: formatColumnHeader,
  },
];

class CustomList extends Component {
  state = this.initialState;
  api = new ObjectApi();

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

    const rowEvents = {
      onClick: (e, row) => {
        history.push('/objects/' + row.id);
      },
    };

    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="Custom Lists"
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
                      rowEvents={rowEvents}
                    />
                    <span>{totalSize} rows</span>
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

export default withRouter(CustomList);
