import React, { Component } from 'react';
// import OrbitApi from 'RefineOrbit/OrbitApi';
import PredictionApi from './PredictionApi';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Components
import { Dropdown } from 'primereact/dropdown';
import { Alert } from 'react-bootstrap';
import { Button } from 'primereact/button';

class PredicitionSelect extends Component {
  state = this.initialState;
  // apiOrbit = new OrbitApi();
   apiPrediction = new PredictionApi();

  get initialState() {
    return {
      dataOrbit: [],
      object: [],
      leapSeconds: [],
      bspPlaneraty: [],
      asteroid: null,
      obj_leap: null,
      bsp_planeraty: null,
      message: '',
      actionButton: '',
    };
  }
  componentDidMount() {

    this.apiPrediction.getPrediction().then(res => {
      const r = res.data;
      this.setState({
        object: r.results
      });
    });

    this.apiPrediction.getLeapSeconds().then(res => {
      const r = res.data;
      this.setState({
        leapSeconds: r.results
      });
    });

    this.apiPrediction.getBspPlanetary().then(res => {
      const r = res.data;
      this.setState({
        bspPlaneraty: r.results
      });
    });
  };

  onCheck = () => {
    if (
      this.state.asteroid === null &&
      this.state.obj_leap === null &&
      this.state.bsp_planeraty === null 
    ) {
     this.setState({ message : "Os Campos não foram preenchidos" });
    } else {
      if (
        this.state.asteroid !== null &&
        this.state.obj_leap !== null &&
        this.state.bsp_planeraty !== null )
        this.setState({ actionButton : true });
      }
    };

  onClick = () => {
    this.onCheck();
  };

  onChangeAsteorid = (value) => {
    console.log(value);
    if (value !== '') {
      this.setState({ message : "O campo object foi modificado" });
    } 
    this.onCheck();
  };

  onChangeLeap= (value) => {
    if (value !== '') {
      this.setState({ message : "O campo Leap foi modificado" });
    } 
    this.onCheck();
  };

  onChangeBsp = (value) => {
    if (value !== '') {
      this.setState({ message : "O campo Bsp fois modificado" });
    } 
    this.onCheck();
  };

  OrbitName = () => {
    this.api.getRefineOrbits().then(res => {
      const r = res.data;
      this.setState({
        dataOrbit: r.results,
      });
    });
  };

  render() {

    let asteroid = this.state.object;
    const elementos = [];
    asteroid.map((el, i) => {
        elementos.push({ label: el.proccess_displayname, value: el.id});
    });
    
    let leap = this.state.leapSeconds;
    const el_leap = [];
    leap.map((el, i) => {
      el_leap.push({ label: el.display_name, value: el.id});
    });
    console.log(el_leap);
    let bsp = this.state.bspPlaneraty;
    const el_bsp = [];
    bsp.map((el, i) => {
      el_bsp.push({ label: el.display_name, value: el.id});
    });
   
    return (
      <div>
          <div className="flex-layout">
            <Dropdown
              className="item-prediction"
              value={this.state.asteroid}
              options={elementos}
              onChange={e => { 
                this.setState({asteroid: e.value },this.onChangeAsteorid(e.value));
              }}
              placeholder="Select a object"
            />

            <Dropdown
              className="item-prediction"
              value={this.state.obj_leap}
              options={el_leap}
              onChange={e => {
                this.setState({ obj_leap: e.value }, this.onChangeLeap());
              }}
              placeholder="Select a Leap"
            />

            <Dropdown
              className="item-prediction"
              value={this.state.bsp_planeraty}
              options={el_bsp}
              onChange={e => {
                this.setState({ bsp_planeraty: e.value }, this.onChangeBsp());
              }}
              placeholder="Select a BSP Planetary"
            />
          </div>

          <Button label="Submit" disabled={!this.state.actionButton} onClick={this.onClick} className=" button-TNO button-prediction" />
          <br />
          <p>{this.state.message}</p>
          {/* <Alert>
            OLa
         </Alert> */}
        </div>
     
      );
    };
  }

export default PredicitionSelect;
