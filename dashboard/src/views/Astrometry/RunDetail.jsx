import React, { Component } from 'react';
import PraiaApi from './PraiaApi';
import PanelCostumize from 'components/Panel/PanelCostumize';
import ListStats from 'components/Statistics/ListStats';
import { Button } from 'primereact/button';
import DonutStats from 'components/Statistics/DonutStats';
import StepStats from 'components/Statistics/StepStats';
import moment from 'moment';
import { Card } from 'primereact/card';
import PraiaTimeProfile from './TimeProfile';
import AsteroidList from './AsteroidList';
import { withRouter } from 'react-router-dom';
import { Toolbar } from 'primereact/toolbar';
import ReactInterval from 'react-interval';
import Stepper from 'react-stepper-horizontal';

class PraiaDetail extends Component {
  state = this.initialState;
  api = new PraiaApi();

  get initialState() {
    return {
      id: 0,
      data: {},
      time_profile: [],
      reload_interval: 1,
      interval_condition: false,
      count: 0,
      activeIndex: 0,
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    this.setState(
      {
        id: parseInt(params.id, 10),
      },
      () => this.reload()
    );

  }

  format_execution_time = duration => {
    var seconds = Math.round(moment.duration(duration).asSeconds());
    return moment.utc(seconds * 1000).format('HH:mm:ss');
  };



  onViewAsteroid = asteroid_id => {
    const proccess = this.state.data.proccess_displayname;
    const history = this.props.history;
    history.push(`/asteroid_run_detail/${asteroid_id}`);
  };

  onClickBackToAstometry = () => {
    const history = this.props.history;
    history.push(`/astrometry/`);
  };

  create_nav_bar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar">
          <Button
            label="Back"
            icon="fa fa-undo"
            onClick={() => this.onClickBackToAstometry()}
          />
        </div>
      </Toolbar>
    );
  };

  reload = () => {

    const { id } = this.state;

    this.api.getPraiaRunById({ id }).then(res => {
      const data = res.data;

      this.setState({
        data: data,
        // interval_condition: data.status === 'running' ? true : false,

        interval_condition: data.status === 'running' ? true : data.status === 'pending' ? true : false,


        activeIndex: data.step,

      });

    });

  };

  interval = () => {

    const { data, count } = this.state;

    if (data.status === 'running' || data.status === 'pending') {
      this.setState(
        {
          count: count + 1,
        },
        () => {
          this.reload();
        }
      );
    }
  };

  render() {
    const { data, reload_interval, interval_condition, activeIndex } = this.state;

    const colors = ['#1D3747', '#305D78', '#89C8F7', '#A8D7FF'];

    // const execute_time = [
    //   {
    //     legend: 'Download',
    //     label: this.format_execution_time(data.execution_download_time),
    //     value: Math.round(
    //       moment.duration(data.execution_download_time).asSeconds()
    //     ),
    //     colorIcon: 'primary',
    //     grid: ['6'],
    //   },
    //   {
    //     legend: 'NIMA',
    //     label: this.format_execution_time(data.execution_nima_time),
    //     value: Math.round(
    //       moment.duration(data.execution_nima_time).asSeconds()
    //     ),
    //     colorIcon: 'info',
    //     grid: ['6'],
    //   },
    // ];

    const stats = [
      { name: 'Proccess', value: data.proccess_displayname },
      { name: 'Owner', value: data.owner },
      { name: 'Start', value: data.h_time },
      { name: 'Execution', value: data.h_execution_time },
      { name: 'Asteroids', value: data.count_objects },
    ];

    const stats_status = [
      { name: 'Success', value: data.count_success },
      { name: 'Warning', value: data.count_warning },
      { name: 'Failure', value: data.count_failed },
      { name: 'not Executed', value: data.count_not_executed },
    ];

    // (0,'CCD Images'),
    // (1,'Bsp Jpl'),
    // (2,'Gaia Catalog'),
    // (3,'Praia Astrometry'),
    // (4,'Registered'))

    const items = [
      { title: 'CCD Images' },
      { title: 'Bsp Jpl' },
      { title: 'Gaia Catalog' },
      { title: 'Praia Astrometry' },
      { title: 'Registered' }
    ];

    return (
      <div>
        <ReactInterval
          timeout={reload_interval * 1000}
          enabled={interval_condition}
          callback={this.interval}
        />

        {this.create_nav_bar()}
        <div className="ui-g">
          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <PanelCostumize
              title={`Astrometry - ${data.id}`}
              content={
                <ListStats
                  statstext={this.state.data.status}
                  status={true}
                  title={`Astrometry - ${data.id}`}
                  data={stats}
                />
              }
            />
          </div>

          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <PanelCostumize
                title="Execution Statistics"
              // content={<DonutStats data={stats_status} fill={colors} />}
              />
            </div>
            <div className="ui-g-4 ui-md-12 ui-sm-1">
              <PanelCostumize
                title="Step Stats"
              // content={<StepStats info={execute_time} />}
              />
            </div>
          </div>
          <div className="ui-g-4 ui-md-4">
            <PanelCostumize
              title="Execution Time"
              content={
                <Card>
                  {/* <RefineOrbitTimeProfile data={this.state.time_profile} /> */}
                </Card>
              }
            />
          </div>

          <div className="ui-g-12">
            <Stepper steps={items} activeStep={activeIndex} />
          </div>

          <div className="ui-g-12">
            <PanelCostumize
              title="Asteroids"
              content={
                <AsteroidList
                  praia_run={this.state.id}
                  view_asteroid={this.onViewAsteroid}
                  reload_flag={this.state.count}
                />
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PraiaDetail);
