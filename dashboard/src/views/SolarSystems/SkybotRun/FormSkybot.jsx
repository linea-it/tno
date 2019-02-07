import React, { Component } from 'react';
import { Button } from 'primereact/button';
import Content from 'components/CardContent/CardContent.jsx';
import { Dropdown } from 'primereact/dropdown';

class FormSkybot extends Component {
  state = {
    opt: null,
  };

  options = [
    { label: 'exposure', value: 'exposure' },
    { label: 'period', value: 'period' },
    { label: 'area', value: 'area' },
  ];

  getExposureFields = () => {
    const { opt } = this.state;

    if (opt === 'exposure') {
      return <input placeholder="Exposure" />;
    } else {
      return null;
    }
  };

  getPeriodFields = () => {
    const { opt } = this.state;

    if (opt === 'period') {
      return <input placeholder="Period" />;
    } else {
      return null;
    }
  };

  render() {
    const { opt } = this.state;

    return (
      <Content
        header={false}
        content={
          <div>
            <Dropdown
              value={this.state.opt}
              options={this.options}
              style={{ width: '150px' }}
              onChange={e => {
                this.setState({ opt: e.value });
              }}
              placeholder="Select a option"
            />
            {this.getExposureFields()}
            {this.getPeriodFields()}
          </div>
        }
      />
    );
  }
}

export default FormSkybot;
