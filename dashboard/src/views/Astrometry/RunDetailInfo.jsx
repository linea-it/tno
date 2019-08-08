import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import MarkDown from 'react-markdown';
import runHelp from '../Astrometry/docs/run_detail_info.md';
import PanelCostumize from 'components/Panel/PanelCostumize';
import { Card } from 'primereact/card';
import image from './docs/run_detail_image.png';




class RunDetailInfo extends Component {


  state = {
    terms: null,
  }


  componentDidMount() {

    fetch(runHelp).then((response) => response.text()).then((text) => {
      this.setState({ terms: text })
    })
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

    console.log(image);
    return (

      <div>
        {this.create_nav_bar()}
        <div className="content">
          <Card>
            <MarkDown source={this.state.terms} />
          </Card>
        </div>
      </div>
    );
  }

}

export default withRouter(RunDetailInfo);