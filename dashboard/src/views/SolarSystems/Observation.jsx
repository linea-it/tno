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
  // {
  //   text: 'ID',
  //   dataField: 'id',
  //   width: 60,
  //   headerStyle: formatColumnHeader,
  // },

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

  componentDidMount() {
    // console.log('componentDidMount()');

    this.fetchData(this.state.page, this.state.sizePerPage);
  }

  handleTableChange = (_type, { page, sizePerPage }) => {
    // console.log('handleTableChange(%o, %o)', page, sizePerPage);

    this.fetchData(page, sizePerPage);
  };

  onChangeSearch = event => {
    this.setState({ search: event.target.value });

    //if (this.setState({ search: event.target.value }) !== ''){ this.fetchData(); console.log('teste')};
  };

  onKeyPress = event => {
    if (event.charCode === 13) this.handleSearch();
  };

  handleSearch = () => {
    // event.preventDefault();
    if (this.state.search) {
      // console.log('fazer a busca');
      // TO DO ver como passar o estado da paginação nas pesquisa de mais de um registro
      this.setState(
        { page: 1 },
        this.fetchData(this.state.page, this.state.pageSize, this.state.search)
      );
    } else {
      this.fetchData(this.state.page, this.state.pageSize);
    }
  };

  handlerClear = () => {
    this.setState({ search: '' }, this.fetchData());
  };

  fetchData = (page, pageSize, search) => {
    // console.log('fetchData(%o, %o, %o)', page, pageSize, search);
    this.setState({ loading: true });

    const params = {
      pageSize: pageSize,
    };

    if (search) {
      params.search = search;
    } else {
      params.page = page;
    }
  };

  showDetail = (index, row, rowindex) => {
    //console.log(row);
    this.setState({ show: true, record: row });
  };

  // close = () => this.setState({ showCreate: false });

  onClose = () => {
    this.setState({ show: false });
  };

  render() {
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      search,
      record,
    } = this.state;

    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

    const rowEvents = {
      onClick: this.showDetail,
      // onClick: (e, row, rowIndex) => {
      //   //this.setState({ show: true });
      //   //alert(`clicked on row with index: ${rowIndex}`);
      // },
    };

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
                rowEvents={rowEvents}
                // loading={loading}
                overlay={overlayFactory({
                  spinner: true,

                  background: 'rgba(192,192,192,0.3)',
                })}
              />
              <span>{totalSize} rows</span>
            </div>
          }
        />
      </div>
    );
  }
}

export default withRouter(Observation);
