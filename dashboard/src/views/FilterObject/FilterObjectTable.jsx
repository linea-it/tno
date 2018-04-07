import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

class FilterObjectTable extends Component {
    render () {

        const products = []
        const columns = [
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
        ];

        return (
            <BootstrapTable keyField='id' data={ products } columns={ columns } />
        )
    }
}

export default FilterObjectTable;
