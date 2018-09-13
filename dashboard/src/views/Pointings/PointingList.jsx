import React, { Component } from 'react';

import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';

import { withRouter } from 'react-router-dom';
import PanelCostumize from 'components/Panel/PanelCostumize';
import { Card } from 'primereact/card';
import PointingApi from './PointingApi';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import FilterPointings from './FilterPointings';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatDateUTC, formatColumnHeader } from 'utils';

function exposureFormatter(_cell, row, _rowindex, formatExtraData) {
  if (row.downloaded) {
    return <i className={formatExtraData['success']} />;
  } else {
    return <i className={formatExtraData['failure']} />;
  }
}

const pointing_columns = [
  {
    text: 'Observation Date',
    dataField: 'date_obs',
    width: 180,
    headerStyle: formatColumnHeader,
    formatter: formatDateUTC,
    helpText: 'Date and time of observation',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'FileName',
    dataField: 'filename',
    width: 180,
    headerStyle: formatColumnHeader,
    helpText: 'Name of FITS file with a CCD image.',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'CDD Number',
    dataField: 'ccdnum',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'CCD Number (1, 2, ..., 62)',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Band',
    dataField: 'band',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Filter used to do the observation (u, g, r, i, z, Y).',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Exposure time',
    dataField: 'exptime',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Exposure time of observation.',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'RA_CENT',
    dataField: 'ra_cent',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Exposure time of observation.',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'DEC_CENT',
    dataField: 'dec_cent',
    align: 'center',
    width: 60,
    headerStyle: formatColumnHeader,
    helpText: 'Exposure time of observation.',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'downloaded',
    dataField: 'downloaded',
    align: 'center',
    formatter: exposureFormatter,
    helpText: 'flag indicating whether the image was downloaded from DES.',
    headerTitle: column => `${column.helpText}`,

    formatExtraData: {
      success: 'fa fa-check text-success',
      failure: 'fa fa-exclamation-triangle text-warning',
    },

    width: 80,
    headerStyle: formatColumnHeader,
  },
];

class PointingList extends Component {
  state = this.initialState;

  api = new PointingApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
    record: PropTypes.object,
    filters: PropTypes.array,
  };

  get initialState() {
    return {
      id: null,
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 10,
      loading: false,
      search: '',
      record: {},
      show: false,
      filtered: null,
      searchPattern: {},
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
  };

  onKeyPress = event => {
    if (event.charCode === 13) this.handleSearch();
  };

  handleSearch = () => {
    if (this.state.search) {
      // TO DO ver como passar o estado da paginação nas pesquisa de mais de um registro
      this.setState(
        { page: 1 },
        this.fetchData(
          this.state.page,
          this.state.sizePerPage,
          this.state.search
        )
      );
    } else {
      this.fetchData(this.state.page, this.state.sizePerPage);
    }
  };

  handlerClear = () => {
    this.setState(
      { search: '' },
      this.fetchData(this.state.page, this.state.sizePerPage)
    );
  };

  fetchData = (page, sizePerPage, search, Arrayfilters = []) => {
    this.setState({ loading: true });

    const params = {
      pageSize: sizePerPage,
      filters: [],
    };

    if (search) {
      params.search = search;
    } else {
      params.page = page;
    }

    if (Object.keys(Arrayfilters).length === 0) {
      this.setState(this.initialState);
    } else {
      params.filters = Arrayfilters;
    }

    this.api.getPointingLists(params).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        sizePerPage: sizePerPage,
        loading: false,
      });
    });
  };

  showDetail = (index, row, rowindex) => {
    this.setState({ show: true, record: row });
  };

  onFilter = filter => {
    this.setState(
      { filtered: filter },
      this.fetchData(
        this.state.page,
        this.state.sizePerPage,
        this.state.search,
        filter
      )
    );
  };

  closeCreate = () => {
    this.setState({ show: false });
  };

  render() {
    const { data, sizePerPage, page, totalSize, loading, search } = this.state;

    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hidePageListOnlyOnePage: true,
      showTotal: true,
    });

    const history = this.props.history;

    const rowEvents = {
      onDoubleClick: (e, row) => {
        history.push('/pointingsdetail/' + row.id);
      },
    };

    return (
      <div className="flex-container flex-wrap">
        <PanelCostumize
          className="item grow1"
          title="List with all pointings"
          content={
            <Card>
              <Toolbar>
                <div className="ui-toolbar">
                  <div className="ui-g ui-fluid">
                    <div className="ui-lg-8 ui-md-6">
                      <div className="ui-inputgroup">
                        <InputText
                          placeholder="Search By expnum, filename"
                          value={search}
                          onChange={this.onChangeSearch}
                          onKeyPress={this.onKeyPress}
                        />
                        <Button
                          className="ui-button-primary"
                          label="Search"
                          onClick={this.handleSearch}
                        />
                      </div>
                    </div>
                    <div className="ui-lg-4 ui-md-6">
                      <div>
                        <Button
                          label="Clear"
                          onClick={e => {
                            this.handlerClear();
                          }}
                          style={{
                            border: ' 1px solid #95a5a6',
                            backgroundColor: '#95a5a6',
                            width: '100px',
                          }}
                        />
                        <Button
                          label="Filters"
                          onClick={e => {
                            this.setState({ show: true });
                          }}
                          style={{
                            border: ' 1px solid #7f8c8d',
                            backgroundColor: '#7f8c8d',
                            width: '190px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Toolbar>

              <div className="flex-container" />
              <BootstrapTable
                responsive
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
                loading={loading}
                overlay={overlayFactory({
                  spinner: true,

                  background: 'rgba(192,192,192,0.3)',
                })}
              />

              <FilterPointings
                onFilter={this.onFilter}
                show={this.state.show}
                onHide={this.closeCreate}
              />
            </Card>
          }
        />
      </div>
      // <div className="ui-g">
      //   <div className="ui-lg-12 ui-md-12 ui-sm-12">
      //     <PanelCostumize
      //       title="List with all pointings"
      //       content={
      //         <Card>
      //           <Toolbar>
      //             <div className="ui-toolbar">
      //               <div className="ui-g ui-fluid">
      //                 <div className="ui-lg-8 ui-md-6">
      //                   <div className="ui-inputgroup">
      //                     <InputText
      //                       placeholder="Search By expnum, filename"
      //                       value={search}
      //                       onChange={this.onChangeSearch}
      //                       onKeyPress={this.onKeyPress}
      //                     />
      //                     <Button
      //                       className="ui-button-primary"
      //                       label="Search"
      //                       onClick={this.handleSearch}
      //                     />
      //                   </div>
      //                 </div>
      //                 <div className="ui-lg-4 ui-md-6">
      //                   <div>
      //                     <Button
      //                       label="Clear"
      //                       onClick={e => {
      //                         this.handlerClear();
      //                       }}
      //                       style={{
      //                         border: ' 1px solid #95a5a6',
      //                         backgroundColor: '#95a5a6',
      //                         width: '100px',
      //                       }}
      //                     />
      //                     <Button
      //                       label="Filters"
      //                       onClick={e => {
      //                         this.setState({ show: true });
      //                       }}
      //                       style={{
      //                         border: ' 1px solid #7f8c8d',
      //                         backgroundColor: '#7f8c8d',
      //                         width: '190px',
      //                       }}
      //                     />
      //                   </div>
      //                 </div>
      //               </div>
      //             </div>
      //           </Toolbar>

      //           <div className="clearfix" />
      //           <BootstrapTable
      //             striped
      //             hover
      //             condensed
      //             remote
      //             bordered={false}
      //             keyField="id"
      //             noDataIndication="no results to display"
      //             data={data}
      //             columns={pointing_columns}
      //             pagination={pagination}
      //             onTableChange={this.handleTableChange}
      //             rowEvents={rowEvents}
      //             loading={loading}
      //             overlay={overlayFactory({
      //               spinner: true,

      //               background: 'rgba(192,192,192,0.3)',
      //             })}
      //           />

      //           <FilterPointings
      //             onFilter={this.onFilter}
      //             show={this.state.show}
      //             onHide={this.closeCreate}
      //           />
      //         </Card>
      //       }
      //     />
      //   </div>
      // </div>
    );
  }
}

export default withRouter(PointingList);
