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
      return (
        <tr key={i}>
          <td className="text-white b-a-0">{propSet.data[i].name}</td>
          <td className="text-white b-a-0">{propSet.data[i].value}</td>
        </tr>
      );
    });

    return (
      <div>
        <Card subTitle={propSet.title}>
          <Table hover responsive>
            <tbody>
              <tr>
                <td className="text-white b-a-0">
                  <strong>Status</strong>
                </td>
                <td className="text-white b-a-0">
                  <Badge
                    className={`label label-outline label-${propSet.statstext}`}
                  >
                    {propSet.statstext}
                  </Badge>
                </td>
              </tr>
              {columns}
            </tbody>
          </Table>
        </Card>
      </div>
    );
  }
}

export default ListStats;
