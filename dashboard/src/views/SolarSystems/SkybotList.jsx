import React, { Component } from 'react';
import {
  FormGroup,
  FormControl,
  InputGroup,
  ButtonToolbar,
} from 'react-bootstrap';
import FilterSkybot from './FilterSkybot';
import { withRouter } from 'react-router-dom';
import Button from 'elements/CustomButton/CustomButton.jsx';
import SkybotApi from './SkybotApi';
import PropTypes from 'prop-types';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import { formatColumnHeader, coordinateFormater } from 'utils';

const skybot_columns = [
  {
    text: 'Object Name',
    dataField: 'name',
    width: 20,
    align: 'center',
    headerStyle: formatColumnHeader,
    helpText: 'Object name (official or provisional designation).',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Number',
    dataField: 'num',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Object number (not all objects have numbers assigned).',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'RA (deg)',
    dataField: 'raj2000',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    formatter: coordinateFormater,
    helpText: 'Right ascension of the identified object in degrees.',
    headerTitle: column => `${column.helpText}`,
  },

  {
    text: 'Dec (deg)',
    dataField: 'decj2000',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    formatter: coordinateFormater,
    helpText: 'Declination of the identified object in degrees.',
    headerTitle: column => `${column.helpText}`,
  },

  // {
  //   text: 'Exposure',
  //   dataField: 'expnum',
  //   align: 'center',
  //   width: 20,
  //   headerStyle: formatColumnHeader,
  //   helpText: 'Filter used to do the observation (u, g, r, i, z, Y).',
  //   headerTitle: column => `${column.helpText}`,
  // },

  {
    text: 'Dynamic class ',
    dataField: 'dynclass',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Object class (TNO, Centaur, Trojan, etc.).',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'Visual magnitude',
    dataField: 'mv',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Visual magnitude',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'Dynamic class ',
    dataField: 'dynclass',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Object class (TNO, Centaur, Trojan, etc.).',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'Visual magnitude',
    dataField: 'mv',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Visual magnitude',
    headerTitle: column => `${column.helpText}`,
  },
  {
    text: 'Error on the position',
    dataField: 'errpos',
    align: 'center',
    width: 20,
    headerStyle: formatColumnHeader,
    helpText: 'Uncertainty on the (RA,DEC) coordinates',
    headerTitle: column => `${column.helpText}`,
  },
];

class SkybotList extends Component {
  state = this.initialState;

  api = new SkybotApi();

  static propTypes = {
    history: PropTypes.any.isRequired,
    match: PropTypes.object.isRequired,
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
      record: '',
      show: false,
      filtered: null,
    };
  }

  componentDidMount() {
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
    // event.preventDefault();
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
    //console.log('fetchData(%o, %o, %o)', page, sizePerPage, search);
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

    this.api.getSkybotLists(params).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        page: page,
        loading: false,
        sizePerPage: sizePerPage,
      });
    });
  };

  showDetail = () => {
    this.setState({ show: true });
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
        history.push('/skybotdetail/' + row.id);
        //console.log('fetchData(%o, %o, %o)', page, sizePerPage, search);
      },
    };

    return (
      <div className="content">
        <div>
          <ButtonToolbar>
            <FormGroup>
              <InputGroup>
                <InputGroup.Button>
                  <Button onClick={this.showDetail}>Filter</Button>
                </InputGroup.Button>
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
        </div>
        <FilterSkybot
          onFilter={this.onFilter}
          show={this.state.show}
          onHide={this.closeCreate}
        />
      </div>
    );
  }
}

export default withRouter(SkybotList);
