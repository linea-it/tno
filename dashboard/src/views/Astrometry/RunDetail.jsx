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
import AstrometryTimeProfile from './TimeProfile';

class PraiaDetail extends Component {
  state = this.initialState;
  api = new PraiaApi();

  get initialState() {
    return {
      id: 0,
      data: {},
      time_profile: [],
      reload_interval: 3,
      interval_condition: false,
      count: 0,
      activeIndex: 0,
      status_data: null,
      data_execution_time: null,
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
    // return moment.utc(seconds * 1000).format('HH:mm:ss');

    console.log(duration);
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
          <div style={{ float: 'left' }}>
            <Button
              label="Back"
              icon="fa fa-undo"
              onClick={() => this.onClickBackToAstometry()}
            />
          </div>
          <div style={{ float: 'right' }}>
            <Button
              label="Help"
              className="p-button-raised"
              icon="fa fa-info-circle"
              iconPos="right"
              tooltip="info"
              onClick={this.info}
            />
          </div>
        </div>
      </Toolbar>
    );
  };

  info = () => {
    const history = this.props.history;
    history.push({ pathname: `/astrometry_info/` });
  };

  reload = () => {
    const { id } = this.state;

    this.api.getPraiaRunById({ id }).then(res => {
      const data = res.data;

      this.setState({
        data: data,
        interval_condition:
          data.status === 'running'
            ? true
            : data.status === 'pending'
              ? true
              : false,

        activeIndex: data.step,
        reload_interval: this.state.count < 5 ? 1 : 5,
      });
    });

    this.loadStatus(id);
    this.loadExecutionTime(id);

    // TODO deve sair daqui, so para testes
    this.api.checkJobStatus();
  };

  loadStatus = id => {
    // Get asteroids status Counts
    this.api.getAsteroidStatus({ id }).then(res => {
      const statusData = res.data;
      this.setState({ status_data: statusData.status });
    });
  };

  loadExecutionTime = id => {
    //Request for execution time
    this.api.getExecutionTimeById({ id }).then(res => {
      const execution_data = res.data.execution_time;
      this.setState({ data_execution_time: execution_data });
    });
  };

  // controlInterval = () => {
  //   //This function was created because when user needs to see the number of
  //   // the exectution on pie chart, the interval erase the showing.
  //   //This function may be used for other things but in this case when mouse enter
  //   //pie chart on DonutStats.jsx then turns off the interval. Else turns it on.

  //   this.setState({ interval_condition: this.state.interval_condition === true ? false : true });

  // };

  renderStatus = () => {
    const { status_data } = this.state;

    const colors = [
      '#4cae4c',
      '#FFD700',
      '#d43f3a',
      '#7d7d7d',
      '#3598e5',
      '#3598e5',
      '#3598e5',
    ];

    let sum_p_r_i = 0;
    if (status_data !== null && status_data.pending) {
      sum_p_r_i += status_data.pending;
    }
    if (status_data !== null && status_data.running) {
      sum_p_r_i += status_data.running;
    }
    if (status_data !== null && status_data.idle) {
      sum_p_r_i += status_data.idle;
    }
    const stats_status = [
      {
        name: 'Success',
        value: status_data !== null ? status_data.success : 0,
      },
      {
        name: 'Warning',
        value: status_data !== null ? status_data.warning : 0,
      },
      {
        name: 'Failure',
        value: status_data !== null ? status_data.failure : 0,
      },
      {
        name: 'Not Executed',
        value: status_data !== null ? status_data.not_executed : 0,
      },
      {
        name: 'Running/Idle',
        value: status_data !== null ? sum_p_r_i : 0,
      },
    ];

    return <DonutStats data={stats_status} fill={colors} />;
  };

  // reloadPie = () => {
  //   this.renderStatus();

  // };

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

  renderExecutionTime = () => {
    const execution_time = this.state.data_execution_time;

    const colors = ['#64b5f6', '#1e88e5', '#3949ab', '#311b92'];

    const stats_status = [
      {
        name: 'Ccd Images',
        value:
          execution_time !== null ? parseFloat(execution_time.ccd_images) : 0.0,
      },
      {
        name: 'Bsp_Jpl',
        value:
          execution_time !== null ? parseFloat(execution_time.bsp_jpl) : 0.0,
      },
      {
        name: 'Catalog',
        value:
          execution_time !== null ? parseFloat(execution_time.catalog) : 0.0,
      },
      {
        name: 'Astrometry',
        value:
          execution_time !== null ? parseFloat(execution_time.astrometry) : 0.0,
      },
    ];

    return (
      <DonutStats
        flag={'execution_time'}
        data={stats_status}
        controlInterval={this.controlInterval}
        fill={colors}
      />
    );
  };

  render() {
    const {
      data,
      reload_interval,
      interval_condition,
      activeIndex,
    } = this.state;

    console.log(data);

    const stats = [
      { name: 'Process', value: data.id },
      { name: 'Process Name', value: data.input_displayname },
      { name: 'Owner', value: data.owner },
      { name: 'Start', value: data.h_time },
      { name: 'Execution', value: data.h_execution_time },
      { name: 'Asteroids', value: data.count_objects },
      { name: 'Reference Catalog', value: data.catalog_name },
    ];

    const items = [
      { title: 'CCD Images' },
      { title: 'Bsp Jpl' },
      { title: 'Gaia Catalog' },
      { title: 'Praia Astrometry' },
      { title: 'Done' },
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
          <div className="ui-sm-3 ui-md-4 ui-lg-4 ui-xl-3">
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

          <div className="ui-sm-3 ui-md-4 ui-lg-4 ui-xl-3">
            <div>
              <PanelCostumize
                title="Execution Statistics"
                content={this.renderStatus()}
              />
            </div>

            <br />

            <div>
              <PanelCostumize
                title="Execution Time"
                content={this.renderExecutionTime()}
              />
            </div>
          </div>

          {/* <div className="ui-g-4 ui-md-12 ui-sm-1">
              <PanelCostumize
                title="Step Stats"
              // content={<StepStats info={execute_time} />}
              />
            </div> */}

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
