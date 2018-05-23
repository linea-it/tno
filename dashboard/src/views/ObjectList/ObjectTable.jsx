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

const columns = [
  { dataField: 'name', text: 'Name' },
  { dataField: 'dynclass', text: 'Class' },
  { dataField: 'raj2000', text: 'RA' },
  { dataField: 'dec2000', text: 'Dec' },
  { dataField: 'mv', text: 'mv' },
  { dataField: 'errpos', text: 'errpos' },
  { dataField: 'jdref', text: 'jdref' },
  { dataField: 'band', text: 'band' },
];

class ObjectTable extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  static propTypes = {
    // searchPattern: PropTypes.string.isRequired,
    // filters: PropTypes.object.isRequired,
  };

  get initialState() {
    return {
      data: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 50,
      loading: false,
      filters: {},
      searchPattern: {},
      haveData: false,
    };
  }

  componentDidMount() {
    console.log();
  }

  loadObjects = () => {
    console.log('loadObjects()');
    console.log(this);
  };

  render() {
    const { data, sizePerPage, page, totalSize, loading } = this.state;
    const pagination = paginationFactory({
      page: page,
      sizePerPage: sizePerPage,
      totalSize: totalSize,
      // sizePerPageList: [50, 100, 200],
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
    });

    var rowsCount = '';
    if (totalSize > 0) {
      rowsCount = totalSize + ' Rows';
    }
    return (
      <div>
        <BootstrapTable
          striped
          hover
          remote
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
        <p className="text-left">{rowsCount}</p>
      </div>
    );
  }
}

export default ObjectTable;
