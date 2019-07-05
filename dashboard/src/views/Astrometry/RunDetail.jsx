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



class PraiaDetail extends Component {

  state = this.initialState;
  api = new PraiaApi();


  get initialState() {
    return {
      id: 0,
      data: {},
      time_profile: [],
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    // console.log('Orbit Run Id: %o', params.id);

    this.api.getPraiaRunById({ id: params.id }).then(res => {
      const data = res.data;


      this.setState({
        id: parseInt(params.id, 10),
        data: data,
      });

      // if (data.status === 'success') {
      //   this.api.getPraiaRunTimeProfile({ id: params.id }).then(res => {
      //     this.setState({
      //       time_profile: res.data.data,
      //     });
      //   });

      // }
    });
  }


  format_execution_time = duration => {
    var seconds = Math.round(moment.duration(duration).asSeconds());
    return moment.utc(seconds * 1000).format('HH:mm:ss');
  };

  onViewAsteroid = asteroid_id => {
    const history = this.props.history;
    // history.push(`/refined_asteroid/${asteroid_id}`);
  };

  onClickBackToAstometry = () => {
    const history = this.props.history;
    history.push(`/astrometry/`);
  };

  create_nav_bar = () => {
    return (
      <div className="ui-toolbar">
        <Button
          label="Back"
          icon="fa fa-undo"
          onClick={() => this.onClickBackToAstometry()}
        />
      </div>
    );
  };

  render() {

    const { data } = this.state;
    console.log(data);

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

    return (

      < div >
        {this.create_nav_bar()}
        < div className="ui-g" >
          <div className="ui-g-4 ui-md-4 ui-sm-1">
            <PanelCostumize
              title={`Astrometry - ${data.id}`}
              content={
                <ListStats
                  statstext={this.state.data.status}
                  status={true}
                  title={`Aastrometry - ${data.id}`}
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
        </div >

        <div className="ui-g">
          <div className="ui-g-12">
            <PanelCostumize
              title="Asteroids"
              content={
                <AsteroidList
                  praia_run={this.state.id}
                  view_asteroid={this.onViewAsteroid}
                />
              }
            />
          </div>
        </div>
      </div >
    );
  }

}

export default withRouter(PraiaDetail);