import React, { Component } from 'react';
// import OrbitApi from 'RefineOrbit/OrbitApi';
import PredictionApi from './PredictionApi';

//primereact
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

//Components
import { Dropdown } from 'primereact/dropdown';
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
      atd: null,
      obj_leap: null,
      bsp_planeraty: null,
      message: '',
      actionButton: '',
      record: null,
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

    this.setState({ record : this.state.object });

  };


  onCheck = () => {
    if (
      this.state.atd === null &&
      this.state.obj_leap === null &&
      this.state.bsp_planeraty === null 
    ) {
     this.setState({ message : "Os Campos não foram preenchidos" });
    } else {
      if (
        this.state.atd !== null &&
        this.state.obj_leap !== null &&
        this.state.bsp_planeraty !== null )
        this.setState({ actionButton : true });
      }
    };

    onClickSubmit = () => {
      this.onCheck();
      const { record } = this.state;
      if (!record) {
        // TODO: Implementar notifacao de parametro faltante
        return;
      }
  
      this.orbit_api
        .createPredictRun({
          input_list: record.input_list,
          proccess: record.proccess,
        })
        .then(res => {
          console.log(res);
          this.onCreateSuccess(res.data);
        })
        .catch(this.onCreateFailure);
    };
  
    onCreateSuccess = record => {
      console.log('onCreateSuccess(%o)', record);
      this.setState(this.initialState, this.props.onCreateRun(record));
    };
  
    onCreateFailure = error => {
      // TODO: Criar uma Notificacao de falha.
      console.log('onCreateFailure(%o)', error);
    };
  

  onChangeAsteorid = (value) => {
    console.log("O campo object foi modificado, valor:", value);
    if (value !== '') {
      this.setState({ message : "O campo object foi modificado" });
    } 
    this.onCheck();
  };

  onChangeLeap= (value) => {
    if (value !== '') {
      console.log("O campo Leap foi modificado, valor:", value);
      this.setState({ message : "O campo Leap foi modificado" });
    } 
    this.onCheck();
  };

  onChangeBsp = (value) => {
    if (value !== '') {
      console.log("O campo Bsp fois modificado, valor:", value);
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
    console.log("request", this.state.object);
    let asteroid = this.state.object;
    const elementos = [];
    asteroid.map((el, i) => {
        elementos.push({ label: `el.proccess_displayname${i}`, value: el.id});
        return console.log("elementos: ", elementos);
    });
    
    let leap = this.state.leapSeconds;
    const el_leap = [];
    leap.map((fl, i) => {
      el_leap.push({ label: fl.display_name, value: fl.id});
      return console.log("leap_second", el_leap);
    });

    let bsp = this.state.bspPlaneraty;
    const el_bsp = [];
    bsp.map((gl, i) => {
      el_bsp.push({ label: gl.display_name, value: gl.id});
      return console.log("el_bsp",el_bsp);
    });
   
    return (
      <div>
          <div className="flex-layout">
            <Dropdown
              key={1}
              className="item-prediction"
              value={this.state.asteroid}
              options={elementos}
              onChange={e => { 
                this.setState({asteroid: e.value },this.onChangeAsteorid(e.value));
              }}
              placeholder="Select a object"
            />

            <Dropdown
              key={2}
              className="item-prediction"
              value={this.state.obj_leap}
              options={el_leap}
              onChange={f => {
                this.setState({ obj_leap: f.value }, this.onChangeLeap(f.value));
              }}
              placeholder="Select a Leap"
            />

            <Dropdown
              key={3}
              className="item-prediction"
              value={this.state.bsp_planeraty}
              options={el_bsp}
              onChange={g => {
                this.setState({ bsp_planeraty: g.value }, this.onChangeBsp(g.value));
              }}
              placeholder="Select a BSP Planetary"
            />
          </div>

          <Button label="Submit" disabled={this.state.actionButton} onClick={this.onClick} className=" button-TNO button-prediction" />
          <br />
          <p>{this.state.message}</p>

        </div>
     
      );
    };
  }

export default PredicitionSelect;
