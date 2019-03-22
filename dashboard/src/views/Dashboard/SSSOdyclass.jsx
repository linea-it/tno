import React, { Component } from 'react';
import Content from 'components/CardContent/CardContent.jsx';
import SSSOHistogram from './SSSOHistogram';

class SSSOdyclass extends Component {
  render() {
    const propSet = this.props;

    return (
      <Content
        header={true}
        title="SSSO number per dynclass"
        className="step-title"
        content={
          <SSSOHistogram
            data={propSet.data.asteroids_by_dynaclass}
            width={480}
            height={360}
          />
        }
      />
    );
  }
}

export default SSSOdyclass;
