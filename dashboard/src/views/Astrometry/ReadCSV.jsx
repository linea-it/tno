import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import PraiaApi from './PraiaApi';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';

export default class ReadCSV extends Component {

  state = {
    dataRows: [],
    columns: [],
    data: [],
    filename: null,
    filepath: null,
    loading: false,
    title: null,
    sizePerPage: 16,
    totalSize: 0,
    firstPage: 0,
    page: 1,
  }

  api = new PraiaApi();

  componentDidMount() {
    this.setState({ loading: true });

    const { match: { params }, } = this.props;
    const filepath = decodeURIComponent(params.filepath);
    const filename = decodeURIComponent(params.filename);
    const title = decodeURIComponent(params.title);

    this.setState({ filename, filepath, title }, () => {
      this.fetchData();
    });
  }

  fetchData = () => {
    //filepath param comes from props.params(router) but page and sizePerPage are local ones
    this.api.getCSV(this.state.filepath, this.state.page, this.state.sizePerPage)
      .then(res => {
        console.log(res.data.rows[0].solution_id);
        let rows = this.checkArray(res.data.rows);
        this.setState({
          data: rows,
          columns: res.data.columns,
          loading: false,
          totalSize: res.data.count,
        });
      });
  };


  //This function(checkArray) prevents a bug. When the paginator comes back to the first position 
  // it repeats the title at the first position of the array. 
  //The solution was to delete the first position of the field solution_id
  // case its type is string instead numbers.  

  checkArray = (rows) => {
    if (typeof rows[0].solution_id === "string") {
      rows.shift();
    }
    return rows;
  };

  onPageChange = e => {
    this.setState({ page: e.page, firstPage: e.first }, () => {
      this.fetchData();
    });
  };


  onClickBackToAsteroidDetails = () => {
    const history = this.props.history;
    history.goBack();
  }

  create_tool_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar" style={{ float: "left" }}>
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onClickBackToAsteroidDetails()}
          />
        </div>

      </Toolbar >
    );
  }


  render() {

    const { data, columns, title, filepath,
      loading, sizePerPage, totalSize, firstPage } = this.state;

    const acolumns = columns.map((col) => {
      return (
        <Column
          key={col}
          field={col}
          header={col}
          sortable={true}
          style={{ width: '295px', textAlign: 'center' }}
        />
      );
    });


    return (
      < div >
        {this.create_tool_bar()}
        <Card title={title} subTitle={filepath}>
          <DataTable
            value={data}
            sortField={''}
            sortOrder={1}
            scrollable={true}
            loading={loading}
            scrollHeight="500px"
            responsive={true}
          >
            {acolumns}
          </DataTable>
        </Card>
        <Paginator
          rows={sizePerPage}
          totalRecords={totalSize}
          first={firstPage}
          onPageChange={this.onPageChange}
        />

      </div >
    );
  }
}