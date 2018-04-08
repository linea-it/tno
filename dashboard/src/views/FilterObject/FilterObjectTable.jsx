import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
// import overlayFactory from 'react-bootstrap-table2-overlay';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class FilterObjectTable extends Component {

    constructor(props) {
      super(props);
      this.state = {
          columns: [
              {dataField: "object_table", text: "Table"},
              {dataField: "name", text: "Name"},
              {dataField: "freq", text: "Freq"},
              {dataField: "more_than_one_filter", text: "More Than One Filter"},
              {dataField: "filters", text: "Filters"},
              {dataField: "mag_min", text: "Mag Min"},
              {dataField: "mag_max", text: "Mag Max"},
              {dataField: "min_errpos", text: "Min errpos"},
              {dataField: "max_errpos", text: "Max errpos"},
              {dataField: "diff_nights", text: "Diff Nights"},
              {dataField: "diff_date_nights", text: "Diff Date Max"},
          ],

          records: []
      };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({"records":nextProps.records})
    }

    render () {
        return (
            <BootstrapTable
                striped
                hover
                remote
                keyField='id'
                noDataIndication="no results to display"
                data={ this.state.records }
                columns={ this.state.columns } />
        )
    }
}

export default FilterObjectTable;
