import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from 'components/Card/Card.jsx';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatDateUTC, formatColumnHeader } from 'utils';

const pointing_columns = [
  {
    text: 'Date (UT)',
    dataField: 'date_obs',
    width: 60,
    headerStyle: formatColumnHeader,
    formatter: formatDateUTC,
    helpText: 'Date and time of observation',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'J2000 RA',
    dataField: 'filename',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Name of FITS file with a CCD image.',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'J2000 Dec',
    dataField: 'expnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText:
      'Unique identifier for each image, same function as pfw_attenp_id (it also recorded in the file name)',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Magn',
    dataField: 'ccdnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'CCD Number (1, 2, ..., 62)',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Location',
    dataField: 'band',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Filter used to do the observation (u, g, r, i, z, Y).',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Ref',
    dataField: 'exptime',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Exposure time of observation.',
    headerTitle: column => `${column.helpText}`,
  },
];

class Observation extends Component {
  state = this.initialState;

  //   api = new PointingApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
  };

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 3,
      loading: false,
      search: '',
      record: null,
    };
  }

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

    var rows = [];
    for (var i = 0; i < 13; i++) {
      rows.push(
        <tr key={i}>
          <td>{i}</td>
          <td>Lorem</td>
          <td>Ipsum</td>
          <td>Lorem</td>
        </tr>
      );
    }

    return (
      <div className="content">
        <div className="clearfix" />
        <Card
          title="Observation"
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
              columns={pointing_columns}
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
      </div>
    );
  }
}

export default withRouter(Observation);
