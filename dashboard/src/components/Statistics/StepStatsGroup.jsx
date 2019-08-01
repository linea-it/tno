import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import { ProgressBar } from 'react-bootstrap';

import PropTypes from 'prop-types';
class StepStatsGroup extends Component {
  get_value = (value, total) => {
    return 100 * value / total;
  };

  render() {
    const propSet = this.props;

    const { string, array, bool } = PropTypes;

    StepStatsGroup.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
      status: bool.isRequired,
    };

    // Descobrindo o total
    let total = 0;
    propSet.data.map(col => {
      total += col.value;
    });

    return (
      <div>
        <Card
          className={`step-title ${propSet.disableCard}`}
          style={{ maxWidth: 'inherit' }}
          subTitle={propSet.title}
        >
          <Table hover responsive>
            {propSet.data.map((col, i) => {
              return (
                <tbody>
                  <tr key={i}>
                    <div className="ui-g">
                      <div className="ui-md-6 step-text-left">
                        {propSet.data[i].name}
                      </div>
                      <div className="ui-md-6">
                        <span className="step-text-right">
                          {propSet.data[i].value}
                        </span>
                      </div>
                    </div>

                    <ProgressBar
                      id="inputId"
                      bsStyle={`progress-bar-${col.color}`}
                      now={this.get_value(col.value, total)}
                      key={1}
                    />
                  </tr>
                </tbody>
              );
            })}
          </Table>
        </Card>
      </div>
    );
  }
}
export default StepStatsGroup;
