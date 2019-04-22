import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Content extends Component {
  render() {
    const propSet = this.props;
    const body = [];

    if (propSet.header) {
      body.push(
        <div
          key={1}
          className={`content-main ${propSet.className} ${
            propSet.lineVertical
          }`}
        >
          <div className="content-header">
            <span className="content-title">{propSet.title}</span>
            <br />
            <span className="content-subtitle">{propSet.subTitle}</span>
          </div>
          <div className="content-body">{propSet.content}</div>
        </div>
      );
    } else {
      body.push(
        <div key={1} className={`content-main ${propSet.className}`}>
          <div className="content-body">{propSet.content}</div>
        </div>
      );
    }

    return <div>{body}</div>;
  }

  //  Validation PropType
  PropTypes = {
    header: PropTypes.bool,
    className: PropTypes.string,
    subTitle: PropTypes.string,
    content: PropTypes.any,
    title: PropTypes.string,
    lineVertical: PropTypes.string,
  };
}
export default Content;
