import React, { Component } from 'react';
import { Table } from 'react-bootstrap';

class FilterObjectTable extends Component {

    constructor(props) {
      super(props);
      this.state = {
          columns: [
              {name: "object_table", displayName: "Table"},
              {name: "name", displayName: "Object Name"},
              {name: "freq", displayName: "Freq"},
              {name: "more_than_one_filter", displayName: "More Than One Filter"},
              {name: "filters", displayName: "Num Filters"},
              {name: "mag_min", displayName: "Mag Min"},
              {name: "mag_max", displayName: "Mag Max"},
              {name: "min_errpos", displayName: "Min errpos"},
              {name: "max_errpos", displayName: "Max errpos"},
              {name: "diff_nights", displayName: "Diff Nights"},
              {name: "diff_date_nights", displayName: "Diff Date Max"},
          ],

          // {"diff_date_max": null, "filters": null, "freq": 22, "mag_max": null, "mag_min": null, "name": "2002 TP36", "nights": null}
          records: []

      };
    }


    componentWillReceiveProps(nextProps) {
        console.log("componentWillReceiveProps")
        this.setState({"records":nextProps.records})
    }

    generateRow(key, record) {
        // Iterate in columns to generate a row for a record
        // its is necessary because record is a object not a array
        return (
            <tr key={key}>
                {
                    this.state.columns.map((prop, key) => {
                        return (
                            <td key={key}>{record[prop.name]}</td>
                        )
                    })
                }
            </tr>
        )
    }

    render() {
        return (
            <Table striped hover>
                <thead>
                    <tr>
                        {
                            this.state.columns.map((prop, key) => {
                                return (
                                <th  key={key}>{prop.displayName}</th>
                                );
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.records.map((record,key) => {
                            return (
                                this.generateRow(key, record)
                            )
                        })
                    }
                </tbody>
            </Table>
        );
    }
}

export default FilterObjectTable;
