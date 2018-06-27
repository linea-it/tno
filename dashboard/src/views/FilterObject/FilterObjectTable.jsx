import React, { Component } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import Button from 'elements/CustomButton/CustomButton.jsx';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import axios from 'axios';
import PropTypes from 'prop-types';
import { formatColumnHeader } from 'utils';

const api = process.env.REACT_APP_API;

const columns = [
  // { dataField: 'object_table', text: 'Table' },
  {
    dataField: 'name',
    text: 'Name',
    width: 100,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'freq',
    text: 'Freq',
    align: 'center',
    width: 30,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'more_than_one_filter',
    text: 'More Than One Filter',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'filters',
    text: 'Filters',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'mag_min',
    text: 'Mag Min',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'mag_max',
    text: 'Mag Max',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'min_errpos',
    text: 'Min errpos',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'max_errpos',
    text: 'Max errpos',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'diff_nights',
    text: 'Diff Nights',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
  {
    dataField: 'diff_date_nights',
    text: 'Diff Date Max',
    align: 'center',
    width: 40,
    headerStyle: formatColumnHeader,
  },
];

class FilterObjectTable extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  static propTypes = {
    saveList: PropTypes.func.isRequired,
    searchPattern: PropTypes.string.isRequired,
    filters: PropTypes.object.isRequired,
  };

  get initialState() {
    return {
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 3,
      loading: false,
      filters: {},
      searchPattern: {},
      haveData: false,
    };
  }

  // TODO: Alterar esse metodo que vai ser depreciado:
  // https://rocketseat.com.br/blog/context-api-react-16-ciclo-de-vida/
  // getDerivedStateFromProps
  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps(%o)', nextProps);
    this.setState({
      filters: nextProps.filters,
      searchPattern: nextProps.searchPattern,
    });

    this.fetchData({
      filters: nextProps.filters,
      page: this.state.page,
      sizePerPage: this.state.sizePerPage,
      pattern: nextProps.searchPattern,
    });
  }

  handleTableChange = (type, { page, sizePerPage }) => {
    this.fetchData({
      filters: this.state.filters,
      pattern: this.state.searchPattern,
      page: page,
      sizePerPage: sizePerPage,
    });
  };

  fetchData = ({ filters = {}, page = 1, pattern, sizePerPage }) => {
    if (Object.keys(filters).length === 0 && !pattern) {
      // Se nao tiver filtro nao executa o request
      this.setState(this.initialState);
    } else {
      this.setState({ loading: true });

      filters.page = page;
      filters.pageSize = sizePerPage;

      if (pattern) {
        filters.name = pattern;
      }

      axios
        .get(`${api}/skybotoutput/objects`, {
          params: filters,
        })
        .then(res => {
          var r = res.data;
          if (r.success) {
            // Add a Fake ID for suppres warning
            r.results.forEach(function(row, i) {
              row.fake_id = i;
            });
            this.setState({
              data: r.results,
              totalSize: r.count,
              page: page,
              sizePerPage: sizePerPage,
              loading: false,
              haveData: true,
            });
          }
        });
    }
  };

  render() {
    const {
      data,
      sizePerPage,
      page,
      totalSize,
      loading,
      haveData,
    } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      hidePageListOnlyOnePage: true,
    });

    var rowsCount = '';
    if (totalSize > 0) {
      rowsCount = totalSize + ' Rows';
    }
    return (
      <div>
        <ButtonToolbar>
          <Button
            bsStyle="info"
            fill
            disabled={!haveData}
            onClick={this.props.saveList}
          >
            Save
          </Button>
        </ButtonToolbar>
        <BootstrapTable
          striped
          hover
          remote
          keyField="fake_id"
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
        <p className="text-left">{rowsCount}</p>
      </div>
    );
  }
}

export default FilterObjectTable;
