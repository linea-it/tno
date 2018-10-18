import React, { Component } from 'react';
// import OrbitApi from 'RefineOrbit/OrbitApi';
import PredictionApi from './PredictionApi';
import {Calendar} from 'primereact/calendar';
import {Slider} from 'primereact/slider';
import {Spinner} from 'primereact/spinner';

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
      number: 0,
      data1: '01/01/2018',
      data2: '01/01/2018',
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

    onClick = () => {
      this.setState({ record : this.state.object });

      console.log("fui clicado");

      const { record } = this.state;
      if (!record) {
        // TODO: Implementar notifacao de parametro faltante
        console.log("Não veio nada na requisição");
        return;
      } else  {
        console.log(this.state.record);
      }
  
      this.apiPrediction
        .createPredictRun({
          input_list: record.input_list,
          proccess: record.proccess,
        })
        .then(res => {
          console.log("Eu sou a resposta do predict:", res);
          this.onCreateSuccess(res.data);
        })
        .catch(this.onCreateFailure("sim"));
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
        return;
    });
    
    let leap = this.state.leapSeconds;
    const el_leap = [];
    leap.map((fl, i) => {
      el_leap.push({ label: fl.display_name, value: fl.id});
      return;
    });

    let bsp = this.state.bspPlaneraty;
    const el_bsp = [];
    bsp.map((gl, i) => {
      el_bsp.push({ label: gl.display_name, value: gl.id});
      return;
    });
   
    return (
      <div>
          <div className="flex-row">
          <div className="item-prediction">
            <p className="label-prediction">Asteorid</p>
            <Dropdown
              className="drop"
              key={1}
              value={this.state.asteroid}
              options={elementos}
              onChange={e => { 
                this.setState({asteroid: e.value },this.onChangeAsteorid(e.value));
              }}
              placeholder="Select a object"
            />
            <p className="label-prediction">Leap</p>
            <Dropdown
              className="drop"
              key={2}
              value={this.state.obj_leap}
              options={el_leap}
              onChange={f => {
                this.setState({ obj_leap: f.value }, this.onChangeLeap(f.value));
              }}
              placeholder="Select a Leap"
            />
            <p className="label-prediction">BSP Planetary</p>    
            <Dropdown
              className="drop"
              key={3}
              value={this.state.bsp_planeraty}
              options={el_bsp}
              onChange={g => {
                this.setState({ bsp_planeraty: g.value }, this.onChangeBsp(g.value));
              }}
              placeholder="Select a BSP Planetary"
            />
          </div>

          <div className="item-prediction drop">
            <p className="label-prediction">BSP Planetary</p>    
              <Spinner             
                    value={this.state.number} onChange={(e) => this.setState({number: e.value})} min={0} max={5} step={0.15}/>
              
              <p className="label-prediction">BSP Planetary</p>          
              <Calendar               
                    value={this.state.date1} onChange={(e) => this.setState({date1: e.value})} yearRange="2018" placeholder="Select a BSP Planetary"/>

              <p className="label-prediction">BSP Planetary</p>          
              <Calendar               
                    value={this.state.date2}  onChange={(e) => this.setState({date2: e.value})} yearRange="2018"/>
          </div>
  
          </div>
         
          <br />

          <Button label="Submit" disabled={this.state.actionButton} onClick={this.onClick} className=" button-TNO button-prediction" />
          <p>{this.state.message}</p>

      </div>          
      );
    };
  }

export default PredicitionSelect;
