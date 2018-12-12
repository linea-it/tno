import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import Content from 'components/CardContent/CardContent.jsx';
import PropTypes from 'prop-types';

class StepStats extends Component {
  get_value = (value, total) => {
    return 100 * value / total;
  };

  render() {
    const propSet = this.props;
    const { string, array } = PropTypes;

    StepStats.PropTypes = {
      title: string.isRequired,
      info: array.isRequired,
      grid: array,
    };
    // Adaptação para Step com footer
    const footer = <div>{propSet.footer}</div>;

    const areaIcon = propSet.info.map((col, i) => {
      return (
        <div className={`ui-md-${propSet.info[i].grid}`}>
          <ul key={i} className="step-list">
            <li key={i}>
              <i
                className={`fa fa-fw fa-circle progress-bar-${
                  propSet.info[i].colorIcon
                }`}
              />
              {propSet.info[i].legend}
            </li>
            <li className="number">{propSet.info[i].label}</li>
          </ul>
        </div>
      );
    });

    // Descobrindo o total
    let total = 0;
    propSet.info.map((col, i) => {
      return (total += col.value);
    });

    const areaProgress = propSet.info.map((col, i) => {
      return (
        <ProgressBar
          id="inputId"
          bsStyle={`progress-bar progress-bar-${propSet.info[i].colorIcon}`}
          now={this.get_value(col.value, total)}
          key={i}
        />
      );
    });

    return (
      <div>
        <Content
          className={`step-title ${propSet.disableCard}`}
          //footer={footer}
          subTitle={propSet.title}
          style={{ maxWidth: 'inherit' }}
          content={
            <div className="ui-g">
              <div className="ui-lg-12 ui-md-12">
                <div className="ui-g">{areaIcon}</div>
                <ProgressBar>{areaProgress}</ProgressBar>
              </div>
              <div className="ui-lg-12 ui-md-12">{footer}</div>
            </div>
          }
        />
      </div>
    );
  }
}

export default StepStats;
