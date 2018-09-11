import React, { Component } from 'react';

class Content extends Component {
  render() {
    const propSet = this.props;
    const body = [];

    if (propSet.header) {
      body.push(
        <div className={`content-main ${propSet.lineVertical}`}>
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
        <div className="content-main">
          <div className="content-body">{propSet.content}</div>
        </div>
      );
    }

    return <div>{body}</div>;
  }
}
export default Content;
