import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import { ProgressBar } from 'react-bootstrap';

import PropTypes from 'prop-types';
class StepStatsGroup extends Component {
  render() {
    const propSet = this.props;

    const { string, array, bool } = PropTypes;

    StepStatsGroup.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
      status: bool.isRequired,
    };

    const colors = ['success', 'warning', 'danger', 'primary'];
    const columns = propSet.data.map((col, i) => {
      return (
        <tbody>
          <tr key={i}>
            <div className="ui-g">
              <div className="ui-md-6 step-text-left">
                {propSet.data[i].name}
              </div>
              <div className="ui-md-6">
                <span className="step-text-right">{propSet.data[i].value}</span>
              </div>
            </div>

            <ProgressBar
              id="inputId"
              bsStyle={`progress-bar progress-bar-${colors[i]}`}
              now={35}
              key={1}
            />
          </tr>
        </tbody>
      );
    });

    return (
      <div>
        <Card
          className={`step-title ${propSet.disableCard}`}
          style={{ maxWidth: 'inherit' }}
          subTitle={propSet.title}
        >
          <Table hover responsive>
            {/* <tr>
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
              </tr> */}
            {columns}
          </Table>
        </Card>
      </div>
    );
  }
}
export default StepStatsGroup;
