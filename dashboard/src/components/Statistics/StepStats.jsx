import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import { Card } from 'primereact/card';
import { Tooltip } from 'primereact/tooltip';
import PropTypes from 'prop-types';

class StepStats extends Component {
  render() {
    const propSet = this.props;

    const { string, array, any } = PropTypes;

    StepStats.PropTypes = {
      title: string.isRequired,
      data: array.isRequired,
      columns: any.isRequired,
    };
    // Adaptação para Step com footer
    const footer = (
      <div>
        <span>Footer</span>
      </div>
    );

    return (
      <div className="wrap">
        <Card footer={footer} subTitle={propSet.title} style={{ width: '535' }}>
          <div className="ui-g">
            <div className="ui-md-6">
              <ul className="step-list">
                <li>
                  <i className="fa fa-fw fa-circle text-success" />
                  Execution
                </li>
                <li className="number">3789</li>
              </ul>
            </div>
            <div className="ui-md-6">
              <ul className="step-list">
                <li>
                  <i className="fa fa-fw fa-circle text-danger" />
                  Execution
                </li>
                <li className="number">5467</li>
              </ul>
            </div>
          </div>

          <ProgressBar>
            <Tooltip
              for="#inputId"
              title="Enter your username"
              tooltipPosition="bottom"
              tooltipEvent="hover"
            />
            <ProgressBar
              id="inputId"
              bsStyle=" progress-bar progress-bar-success "
              now={35}
              key={1}
            />
            <Tooltip
              for="#inputId2"
              title="Enter your username"
              tooltipPosition="bottom"
              tooltipEvent="hover"
            />
            <ProgressBar
              id="inputId2"
              bsStyle=" progress-bar progress-bar-danger "
              now={65}
              key={2}
            />
          </ProgressBar>
          <hr />
        </Card>
      </div>
    );
  }
}

export default StepStats;
