import React, { Component } from 'react';
import { Table, Badge } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import Content from 'components/CardContent/CardContent.jsx';
import PropTypes from 'prop-types';

class ListStats extends Component {
  render() {
    const propSet = this.props;

    const { array, bool } = PropTypes;

    ListStats.PropTypes = {
      //title: string.isRequired,
      data: array.isRequired,
      status: bool.isRequired,
    };

    const columns = propSet.data.map((col, i) => {
      if (propSet.badgeColumns) {
        return (
          <tr key={i}>
            <td className="font-format">{propSet.data[i].name}</td>
            <td>
              <Badge className={`label-list label-${propSet.statstext}`}>
                {propSet.data[i].value}
              </Badge>
            </td>
          </tr>
        );
      } else {
        return (
          <tr key={i}>
            <td className="list-text">
              <div>{propSet.data[i].name}:</div>
            </td>
            <td className="list-value">
              <div>{propSet.data[i].value} </div>
            </td>
          </tr>
        );
      }
    });

    const status = [];
    if (propSet.status) {
      status.push(
        <tr>
          <td className="list-text">
            <strong>Status</strong>
          </td>
          <td className="list-value">
            <Badge className={`label label-outline label-${propSet.statstext}`}>
              {propSet.statstext}
            </Badge>
          </td>
        </tr>
      );
    }

    return (
      <div>
        <Content
          content={
            <Table>
              <tbody>
                {status}
                {columns}
              </tbody>
            </Table>
          }
        />
      </div>
    );
  }
}

export default ListStats;
