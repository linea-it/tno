import React, { Component } from 'react';
import { Grid,
         Row, 
         Col, 
         Button
       } from 'react-bootstrap';
import { StatsCard } from 'components/StatsCard/StatsCard.jsx';
import { withRouter } from 'react-router-dom';
import Card from 'components/Card/Card.jsx';
import PointingApi from './PointingApi';
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

// function exposureFormatter(cell, row, rowindex, formatExtraData) {
//   if (parseFloat(row.file_size) > 0) {
//     return <i className={formatExtraData['success']} />;
//   } else {
//     return <i className={formatExtraData['failure']} />;
//   }
// }

function exposureFormatter(cell, row, rowindex, formatExtraData) {
  console.log(row)
  console.log(row.downloaded)
  if (row.downloaded) {
    return <i className={formatExtraData['success']} />;
  } else {
    return <i className={formatExtraData['failure']} />;
  }
}

const pointing_columns = [
  {
    text: 'ID',
    dataField: 'id',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Data de Observação',
    dataField: 'date_obs',
    width: 180,
    headerStyle: formatColumnHeader,
    formatter: formatDateUTC,

  },
  {
    text: 'Exposure',
    dataField: 'expnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'CDD',
    dataField: 'ccdnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'Filter',
    dataField: 'band',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
  },
  {
    text: 'downloaded',
    dataField: 'downloaded',
    align: 'center',
    formatter: exposureFormatter,
    formatExtraData: {
      success: 'fa fa-check text-success',
      failure: 'fa fa-exclamation-triangle text-warning',
    },
    width: 80,
    headerStyle: formatColumnHeader,
  },
];

class GetPointings extends Component {
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
    console.log('componentDidMount()')
    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    console.log('handleTableChange(%o, %o)', page, sizePerPage);

    this.fetchData(page, sizePerPage);
  };

  fetchData = (page, pageSize) => {
    console.log('fetchData(%o, %o, %o)', page, pageSize);

    this.setState({ loading: true });

    this.api.getPointingLists({ page: page, pageSize: pageSize }).then(res => {
      console.log("Carregou: %o", res)
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
        //history.push('/objects/' + row.id);
      },
    };

    return (
      <div className="content">
        <Grid fluid>
          <Row>
            <Col md={12}>
              <Card
                title="GetPointings"
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
                      columns={pointing_columns}
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

export default withRouter(GetPointings);



// import React, { Component } from 'react';
// import {
//     Grid, Row, Col } from 'react-bootstrap';
//
// import Card from 'components/Card/Card.jsx'
//
// class GetPointings extends Component {
//     render() {
//         return (
//             <div className="content">
//                 <Grid fluid>
//                     <Row>
//                         <Col md={4}>
//                             <Card
//                                 title="Get Pointings"
//                                 category=""
//                                 content={
//                                     <div/>
//                                 }
//                             />
//                         </Col>
//                         <Col md={8}>
//                             <Card
//                                 title="Tasks"
//                                 category=""
//                                 content={
//                                     <div/>
//                                 }
//                             />
//                         </Col>
//                     </Row>
//                 </Grid>
//             </div>
//         );
//     }
// }
//
// export default GetPointings;
