import React, { Component } from 'react';
import {
  FormGroup,
  FormControl,
  InputGroup,
  ButtonToolbar,
} from 'react-bootstrap';

import { withRouter } from 'react-router-dom';
import Button from 'elements/CustomButton/CustomButton.jsx';
import SkybotApi from './SkybotApi';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatColumnHeader } from 'utils';
import SkybotDetail from './SkybotDetail';

const skybot_columns = [
  // {
  //   text: 'ID',
  //   dataField: 'id',
  //   width: 60,
  //   headerStyle: formatColumnHeader,
  // },

  {
    text: 'Name',
    dataField: 'name',
    width: 20,
    align: 'center',
    headerStyle: formatColumnHeader,
    helpText:
      '(ucd=“meta.id;meta.main”) Object name (official or provisional designation).',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Num',
    dataField: 'num',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText:
      '(ucd=“meta.id;meta.number”) Object number (not all objects have numbers assigned).',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'RA (deg)',
    dataField: 'raj2000',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText:
      '(ucd=“pos.eq.ra;meta.main”) Right ascension of the identified object in degrees.',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Dec (deg)',
    dataField: 'decj2000',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText:
      '(ucd=“pos.eq.dec;meta.main”) Declination of the identified object in degrees.',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Exposure',
    dataField: 'expnum',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Filter used to do the observation (u, g, r, i, z, Y).',
    headerTitle: column => `${column.helpText}`,
  },
];

class GetSkybot extends Component {
  state = this.initialState;

  api = new SkybotApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
    match: PropTypes.object.isRequired,
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
      record: '',
    };
  }

  componentDidMount() {
    // console.log('componentDidMount()');

    //   const {
    //     match: { params },
    //   } = this.props;

    //   this.api.getListStats({ id: params.id }).then(res => {
    //     const data = res.data.data;

    //     this.setState(
    //       {
    //         id: res.data.id,
    //         customList: data,
    //       },

    this.fetchData(this.state.page, this.state.sizePerPage);
    //     );
    //   });
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
    this.api.getSkybotLists(params).then(res => {
      // console.log('Carregou: %o', res);

      const r = res.data;

      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        loading: false,
      });
    });
  };

  // close = () => this.setState({ showCreate: false });

  onClose = () => {
    this.setState({ show: false });
  };

  showDetail = (index, row, rowindex) => {
    //console.log(row);
    this.setState({ record: row });
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

    const history = this.props.history;

    const rowEvents = {
      onDoubleClick: (e, row) => {
        history.push('/skybotdetail/' + row.id);
        // this.showDetail;
      },
    };

    return (
      <div className="content">
        <div>
          <ButtonToolbar>
            <FormGroup>
              <InputGroup>
                <FormControl
                  type="text"
                  placeholder="Search By name, number"
                  value={search}
                  onChange={this.onChangeSearch}
                  onKeyPress={this.onKeyPress}
                />

                <InputGroup.Button>
                  <Button onClick={this.handleSearch}>Search</Button>
                </InputGroup.Button>

                <InputGroup.Button>
                  <Button onClick={this.handlerClear}>Clear</Button>
                </InputGroup.Button>
              </InputGroup>
            </FormGroup>
          </ButtonToolbar>

          <div className="clearfix" />

          <BootstrapTable
            striped
            hover
            condensed
            remote
            bordered={false}
            keyField="id"
            noDataIndication="no results to display"
            data={data}
            columns={skybot_columns}
            pagination={pagination}
            onTableChange={this.handleTableChange}
            rowEvents={rowEvents}
            loading={loading}
            overlay={overlayFactory({
              spinner: true,

              background: 'rgba(192,192,192,0.3)',
            })}
          />
          <span>{totalSize} rows</span>
        </div>
      </div>
    );
  }
}

export default withRouter(GetSkybot);
