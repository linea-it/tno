import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';

import OccultationApi from './OccultationApi';
import AboutMap from './AboutMap';
import Circumstances from './Circumstances';
import OccultedStar from './OccultedStar';
import Asteroid from './Asteroid';
import Skymap from './Skymap';

import moment from 'moment';

class OccultationDetail extends Component {
  state = this.initialState;
  api = new OccultationApi();

  get initialState() {
    return {
      id: null,
      prev: null,
      next: null,
    };
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.any.isRequired,
  };

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.fetchData(params.id);
  }

  fetchData = id => {
    this.api.getOccultationById({ id: id }).then(res => {
      const occultation = res.data;

      if (occultation.id) {
        this.setState({
          id: id,
          occultation: occultation,
        });
      }
    });
  };

  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar-group-left">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onBack()}
          />
          <Button
            label="Download"
            icon="pi pi-cloud-download"
            className="ui-button-info"
            onClick={() => this.onDownload(this.state.id)}
          />
          <Button
            label="Campaign"
            tooltip="Participate in this campaign"
            className="ui-button-success"
            onClick={() => this.onCampaing(this.state.id)}
          />
        </div>

        <div className="ui-toolbar-group-right">
          <Button
            label="Prev"
            icon="fa fa-arrow-left"
            disabled={this.state.prev ? false : true}
            onClick={() => this.onPrev(this.state.prev)}
          />
          <Button
            label="Next"
            icon="fa fa-arrow-right"
            iconPos="right"
            disabled={this.state.next ? false : true}
            onClick={() => this.onNext(this.state.next)}
          />
        </div>
      </Toolbar>
    );
  };

  onBack = () => {
    const history = this.props.history;
    history.push({ pathname: `/occultations/` });
  };

  onPrev = prev => {
    const history = this.props.history;
    history.push({ pathname: `${prev}` });
    // TODO nao deveria usar reload aqui.
    window.location.reload();
  };

  onNext = next => {
    const history = this.props.history;
    history.push({ pathname: `${next}` });
    // TODO nao deveria usar reload aqui.
    window.location.reload();
  };

  onDownload = id => {
    console.log('onDonload: ', id);
  };

  onCampaing = id => {
    console.log('onCampaing: ', id);
  };

  contentTitle = (name, date) => {
    return (
      <div className="p-col-12">
        <h3
          style={{
            color: '#333333',
            fontFamily: 'Helvetica,Arial,sans-serif',
            paddingTop: '15px',
          }}
        >
          Occultation by {name} ({date})
        </h3>
      </div>
    );
  };

  contentMap = image => {
    const src = this.api.api + image;
    return (
      <Card subTitle="Occultation Map">
        <img
          src={src}
          alt=""
          style={{
            width: '640px',
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
        <AboutMap />
      </Card>
    );
  };

  contentOccCircumstances = data => {
    return (
      <Card subTitle="Occultation circumstances">
        <Circumstances data={data}/>
      </Card>
    );
  };

  contentOccStar = data => {
    return (
      <Card subTitle="Occulted star">
        <OccultedStar />
      </Card>
    );
  };

  contentAsteroid = data => {
    return (
      <Card subTitle="Object">
        <Asteroid />
      </Card>
    );
  };

  contentSkymap = (ra, dec) => {
    return (
      <Card subTitle="Sky map (Aladin)">
        <Skymap ra={ra} dec={dec} />
      </Card>
    );
  };

  render() {
    const { occultation } = this.state;
    if (occultation) {
      const date = moment(occultation.date_time).format('YYYY-MM-DD');

      return (
        <div className="content">
          {this.create_nav_bar()}
          <div className="p-grid">
            {this.contentTitle(occultation.asteroid_name, date)}
            <div className="p-col-12"> {this.contentMap(occultation.src)} </div>
            <div className="p-col-12">
              {this.contentOccCircumstances(occultation)}
            </div>
            <div className="p-col-12"> {this.contentOccStar(null)} </div>
            <div className="p-col-12"> {this.contentAsteroid(null)} </div>
            <div className="p-col-12">
              {this.contentSkymap(
                occultation.ra_star_candidate,
                occultation.dec_star_candidate
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return <div className="content" />;
    }
  }
}

export default withRouter(OccultationDetail);
