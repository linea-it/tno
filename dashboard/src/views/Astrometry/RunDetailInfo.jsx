import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import Marked from 'marked';


class RunDetailInfo extends Component {



  componentDidMount() {

    // const readmePath = require("./Readme.md");
  };



  onClickBackToRunDetail = () => {
    const history = this.props.history;
    history.goBack();

  };


  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar">
          <div style={{ float: "left" }}>
            <Button
              label="Back"
              icon="fa fa-undo"
              onClick={this.onClickBackToRunDetail}
            />
          </div>
        </div>
      </Toolbar>
    );

  };

  render() {
    return (

      <div>
        {this.create_nav_bar()}
        <h3>Help Page</h3>
      </div>
    );
  }

}

export default withRouter(RunDetailInfo);