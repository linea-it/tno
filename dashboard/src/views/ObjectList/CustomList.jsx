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

function externalLinkFormatter(cell, row) {
  return (
    <a href={row.externallink} target="_blank">
      <i className="fa fa-info-circle text-primary" />
    </a>
  );
}

function actionDetail(cell, row) {
  return (
    <a href={row.id} target="_blank">
      <i className="fa fa-arrow-right text-primary" />
    </a>
  );
}
// {
//   "id": 2,
//   "owner": "gverde",
//   "displayname": "teste",
//   "tablename": "teste",
//   "description": "",
//   "database": "postgres",
//   "schema": null,
//   "rows": 1229,
//   "n_columns": 29,
//   "columns": "id;num;name;dynclass;ra;dec;raj2000;decj2000;mv;errpos;d;dracosdec;ddec;dgeo;dhelio;phase;solelong;px;py;pz;vx;vy;vz;jdref;externallink;expnum;ccdnum;band;pointing_id",
//   "size": 425984,
//   "creation_date": "2018-06-04T19:49:26.936656Z",
//   "creation_time": 0.172658,
//   "sql": "SELECT tno_skybotoutput.name  FROM tno_skybotoutput  WHERE tno_skybotoutput.dynclass ILIKE 'Centaur' GROUP BY tno_skybotoutput.name, tno_skybotoutput.dynclass ORDER BY tno_skybotoutput.name",
//   "sql_creation": "CREATE TABLE teste AS SELECT tno_skybotoutput.id, tno_skybotoutput.num, tno_skybotoutput.name, tno_skybotoutput.dynclass, tno_skybotoutput.ra, tno_skybotoutput.dec, tno_skybotoutput.raj2000, tno_skybotoutput.decj2000, tno_skybotoutput.mv, tno_skybotoutput.errpos, tno_skybotoutput.d, tno_skybotoutput.dracosdec, tno_skybotoutput.ddec, tno_skybotoutput.dgeo, tno_skybotoutput.dhelio, tno_skybotoutput.phase, tno_skybotoutput.solelong, tno_skybotoutput.px, tno_skybotoutput.py, tno_skybotoutput.pz, tno_skybotoutput.vx, tno_skybotoutput.vy, tno_skybotoutput.vz, tno_skybotoutput.jdref, tno_skybotoutput.externallink, tno_skybotoutput.expnum, tno_skybotoutput.ccdnum, tno_skybotoutput.band, tno_skybotoutput.pointing_id  FROM tno_skybotoutput  WHERE tno_skybotoutput.name IN (SELECT tno_skybotoutput.name  FROM tno_skybotoutput  WHERE tno_skybotoutput.dynclass ILIKE 'Centaur' GROUP BY tno_skybotoutput.name, tno_skybotoutput.dynclass ORDER BY tno_skybotoutput.name)",
//   "filter_name": null,
//   "filter_dynclass": "Centaur",
//   "filter_magnitude": null,
//   "filter_diffdatenights": null,
//   "filter_morefilter": false,
//   "status": "success",
//   "error_msg": null,
//   "h_size": "426.0 kB"
// }

const columns = [
  {
    text: 'Id',
    dataField: 'id',
    width: 60,
    headerStyle: formatColumnHeader,
    events: {
      onClick: () => alert('Click on Product ID field'),
    },
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
  {
    text: 'Objects',
    dataField: 'id',
    width: 80,
    align: 'center',
    headerStyle: formatColumnHeader,
    formatter: actionDetail,
    events: {
      onClick: (event, row) => {
        console.log(event)
        // console.log(row.id);
      },
    },
  },
];

// toObjectList = (event, row) => {
//   this.props.history.push('/objects/' + row.id);
// };

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
