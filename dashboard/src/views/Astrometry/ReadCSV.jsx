import React, { Component } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import PraiaApi from './PraiaApi';


export default class ReadCSV extends Component {

  state = {
    data: []
  }

  api = new PraiaApi();

  componentDidMount() {
    const { match: { params }, } = this.props;
    const filepath = decodeURIComponent(params.filepath);

    this.api.getCSV(filepath).then(res => {
      console.log(res.data);
    });



  }

  render() {

    const { data } = this.state;

    return (
      <div>
        <Card title="">
          <DataTable
            value={data}
            sortField={''}
            sortOrder={1}
          >
            {/* //Columns */}

          </DataTable>
        </Card>

      </div>
    );
  }
}