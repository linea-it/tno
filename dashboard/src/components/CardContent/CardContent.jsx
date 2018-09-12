import React, { Component } from 'react';

class Content extends Component {
  render() {
    const propSet = this.props;
    const body = [];

    if (propSet.header) {
      // body.map((e, i) => {
      body.push(
        <div
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
      // });
    } else {
      // body.map((e, i) => {
      body.push(
        <div className={`content-main ${propSet.className}`}>
          <div className="content-body">{propSet.content}</div>
        </div>
      );
      // });
    }

    return <div>{body}</div>;
  }
}
export default Content;
