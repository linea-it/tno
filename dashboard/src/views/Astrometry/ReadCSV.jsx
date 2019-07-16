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


export default class ReadCSV extends Component {

  state = {
    dataRows: [],
    columns: [],
    data: [],
    filename: null,
    loading: false,
    title: null
  }

  api = new PraiaApi();

  componentDidMount() {
    this.setState({ loading: true });

    const { match: { params }, } = this.props;

    const filepath = decodeURIComponent(params.filepath);
    const filename = decodeURIComponent(params.filename);
    const title = decodeURIComponent(params.title);



    this.setState({ filename: filename });
    this.setState({ title: title });

    this.api.getCSV(filepath).then(res => {
      this.setState({
        data: res.data.rows,
        columns: res.data.columns,
        loading: false,
      });

    });



  }

  onClickBackToAsteroidDetails = () => {
    const history = this.props.history;
    history.goBack();
  }

  create_tool_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onClickBackToAsteroidDetails()}
          />
        </div>
      </Toolbar>
    );
  }

  render() {

    const { data, columns, title, filename, loading } = this.state;

    console.log(loading);

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
        <Card title={title} subTitle={filename}>
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

      </div >
    );
  }
}