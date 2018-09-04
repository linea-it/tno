import React, { Component } from 'react';
import { Table, Badge } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import PropTypes from 'prop-types';

class ListStats extends Component {
  render() {
    const propSet = this.props;

    const { string, array, bool } = PropTypes;

    ListStats.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
      status: bool.isRequired,
    };

    const columns = propSet.data.map((col, i) => {
      if (propSet.badgeColumns) {
        return (
          <tr key={i}>
            <td className="text-white b-a-0">{propSet.data[i].name}</td>
            <td className="text-white b-a-0">
              <Badge className={`label-list label-${propSet.statstext}`}>
                {propSet.data[i].value}
              </Badge>
            </td>
          </tr>
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

    const status = [];
    if (propSet.status) {
      status.push(
        <tr>
          <td className="text-white b-a-0">
            <strong>Status</strong>
          </td>
          <td className="text-white b-a-0">
            <Badge className={`label label-outline label-${propSet.statstext}`}>
              {propSet.statstext}
            </Badge>
          </td>
        </tr>
      );
    }

    return (
      <div>
        <Card subTitle={propSet.title}>
          <Table responsive>
            <tbody>
              {status}
              {columns}
            </tbody>
          </Table>
        </Card>
      </div>
    );
  }
}

export default ListStats;
