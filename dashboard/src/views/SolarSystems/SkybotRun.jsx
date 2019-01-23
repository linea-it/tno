import React, { Component } from 'react';
import { Button } from 'primereact/button';
import SkybotApi from './SkybotApi';
import PanelCostumize from 'components/Panel/PanelCostumize.jsx';
import Content from 'components/CardContent/CardContent.jsx';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';

class SkybotRun extends Component {
  apiSkybotRun = new SkybotApi();

  state = this.initialState;

  get initialState() {
    return {
      //   start: null,
      //   final: null,
      status: 'pending',
      exposure: 232,
      radioMark: '',
      displayDate: 'none',
      displayRegion: 'none',
      region: '',
    };
  }

  onClickSubmit = () => {
    const {
      start: start,
      final: final,
      status: status,
      exposure: exposure,
    } = this.state;

    this.apiSkybotRun
      .createSkybotRun({
        start: start,
        final: final,
        status: status,
        exposure: exposure,
      })
      .then(res => {
        this.onCreateSuccess(res.data);
      })
      .catch(error => {
        this.onCreateFailure(error);
      });
  };

  onVisible = checked => {
    this.setState({ radioMark: checked });
    if (checked == 'period') {
      this.setState({ displayDate: 'block' });
    } else {
      this.setState({ displayDate: 'none' });
    }

    if (checked == 'region') {
      this.setState({ displayRegion: 'block' });
    } else {
      this.setState({ displayRegion: 'none' });
    }
  };

  render() {
    return (
      <div className="p-grid">
        <div className="p-col-4">
          <PanelCostumize
            title="Skybot Run"
            content={
              <Content
                title="SubTitle"
                content={
                  <div>
                    <div
                      className="p-grid"
                      style={{ width: '', marginBottom: '10px' }}
                    >
                      <div className="p-col-12">
                        <RadioButton
                          inputId="rb1"
                          name="skybotRun"
                          value="exposure"
                          onChange={e => this.onVisible(e.value)}
                          checked={this.state.radioMark === 'exposure'}
                        />
                        <label
                          htmlFor="rb1"
                          className="p-radiobutton-label font-size-medium"
                        >
                          Select run for all exposure
                        </label>
                        <br />
                        <RadioButton
                          inputId="rb2"
                          name="skybotRun"
                          value="period"
                          onChange={e => this.onVisible(e.value)}
                          checked={this.state.radioMark === 'period'}
                        />
                        <label
                          htmlFor="rb2"
                          className="p-radiobutton-label font-size-medium"
                        >
                          Select run per Period
                        </label>

                        <div className="p-grid p-dir-row">
                          <div className="p-col-6">
                            <Calendar
                              style={{ display: `${this.state.displayDate}` }}
                              placeholder="Date initial"
                              value={this.state.date}
                              onChange={e => this.setState({ date: e.value })}
                            />
                          </div>
                          <div className="p-col-6">
                            <Calendar
                              style={{ display: `${this.state.displayDate}` }}
                              placeholder="Date Final"
                              value={this.state.date}
                              onChange={e => this.setState({ date: e.value })}
                            />
                          </div>
                        </div>
                        <RadioButton
                          inputId="rb3"
                          name="skybotRun"
                          value="region"
                          onChange={e => this.onVisible(e.value)}
                          checked={this.state.radioMark === 'region'}
                        />
                        <label
                          htmlFor="rb3"
                          className="p-radiobutton-label font-size-medium"
                        >
                          Select run per Region
                        </label>

                        <div className="p-grid p-dir-row">
                          <div className="p-col-6">
                            <RadioButton
                              style={{ display: `${this.state.displayRegion}` }}
                              inputId="rb4"
                              name="region"
                              value="circle"
                              onChange={e => this.setState({ region: e.value })}
                              checked={this.state.region === 'circle'}
                            />
                            <label
                              style={{ display: `${this.state.displayRegion}` }}
                              htmlFor="rb4"
                              className="p-radiobutton-label font-size-medium"
                            >
                              circle 
                            </label>
                          </div>

                          <div className="p-col-6">
                            <RadioButton
                              style={{ display: `${this.state.displayRegion}` }}
                              inputId="rb5"
                              name="region"
                              value="square"
                              onChange={e => this.setState({ region: e.value })}
                              checked={this.state.region === 'square'}
                            />
                            <label
                              style={{ display: `${this.state.displayRegion}` }}
                              htmlFor="rb5"
                              className="p-radiobutton-label font-size-medium"
                            >
                              square 
                            </label>
                          </div>
                        </div>
                      </div>
                      <Button
                        style={{
                          marginLeft: '75%',
                          width: '100px',
                          height: '30px',
                        }}
                        label="Run"
                        onClick={this.onClickSubmit}
                      />
                    </div>
                  </div>
                }
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default SkybotRun;
