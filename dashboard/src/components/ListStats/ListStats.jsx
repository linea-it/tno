import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';

class ListStats extends Component {
  render() {
    const propSet = this.props;

    const { string, array } = PropTypes;

    ListStats.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
    };

    const columns = propSet.data.map((col, i) => {
      if (propSet.data[i].name === 'STATUS') {
        return (
          <div>
            <tr key={i}>
              <td className=" b-a-0">{propSet.data.name}</td>
              <td className=" b-a-0">{propSet.data.value}</td>
            </tr>
            <tr key={i}>
              <td className="text-white b-a-0">{propSet.data[i].name}</td>
              <td className="text-white b-a-0">{propSet.data[i].value}</td>
            </tr>
          </div>
        );
      } else {
        return (
          <tr key={i}>
            <td className="text-white b-a-0">{propSet.data[i].name}</td>
            <td className="text-white b-a-0">{propSet.data[i].value}</td>
          </tr>
        );
      }
    });

    return (
      <div>
        <Card subTitle={propSet.title}>
          <Table hover responsive>
            <tbody>{columns}</tbody>
          </Table>
        </Card>
      </div>
    );
  }
}

export default ListStats;
