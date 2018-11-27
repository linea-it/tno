import React, { Component } from 'react';

import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { CarService } from './CarService';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

class OccultationsDataView extends Component {
  constructor() {
    super();
    this.state = {
      cars: [],
      layout: 'list',
      selectedCar: null,
      visible: false,
      sortKey: null,
      sortOrder: null,
    };
    this.carservice = new CarService();
    this.itemTemplate = this.itemTemplate.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
  }

  componentDidMount() {
    // this.carservice.getCarsLarge().then(data => this.setState({ cars: data }));
    this.setState({ cars: this.carservice.getCarsLarge() })
  }

  onSortChange(event) {
    const value = event.value;

    if (value.indexOf('!') === 0) {
      this.setState({
        sortOrder: -1,
        sortField: value.substring(1, value.length),
        sortKey: value,
      });
    } else {
      this.setState({
        sortOrder: 1,
        sortField: value,
        sortKey: value,
      });
    }
  }

  renderListItem(car) {
    return (
      <div
        className="p-col-12"
        style={{ padding: '2em', borderBottom: '1px solid #d9d9d9' }}
      >
        <div className="p-col-12 p-md-3">
          <img
            src={'showcase/resources/demo/images/car/${car.brand}.png'}
            alt={car.brand}
          />
        </div>
        <div className="p-col-12 p-md-8 car-details">
          <div className="p-grid">
            <div className="p-col-2 p-sm-6">Vin:</div>
            <div className="p-col-10 p-sm-6">{car.vin}</div>

            <div className="p-col-2 p-sm-6">Year:</div>
            <div className="p-col-10 p-sm-6">{car.year}</div>

            <div className="p-col-2 p-sm-6">Brand:</div>
            <div className="p-col-10 p-sm-6">{car.brand}</div>

            <div className="p-col-2 p-sm-6">Color:</div>
            <div className="p-col-10 p-sm-6">{car.color}</div>
          </div>
        </div>

        <div
          className="p-col-12 p-md-1 search-icon"
          style={{ marginTop: '40px' }}
        >
          <Button
            icon="pi pi-search"
            onClick={e => this.setState({ selectedCar: car, visible: true })}
          />
        </div>
      </div>
    );
  }

  renderGridItem(car) {
    return (
      <div style={{ padding: '.5em' }} className="p-col-12 p-md-3">
        <Panel header={car.vin} style={{ textAlign: 'center' }}>
          <img
            src={'showcase/resources/demo/images/car/${car.brand}.png'}
            alt={car.brand}
          />
          <div className="car-detail">
            {car.year} - {car.color}
          </div>
          <hr className="ui-widget-content" style={{ borderTop: 0 }} />
          <Button
            icon="pi pi-search"
            onClick={e => this.setState({ selectedCar: car, visible: true })}
          />
        </Panel>
      </div>
    );
  }

  itemTemplate(car, layout) {
    if (!car) {
      return;
    }

    if (layout === 'list') return this.renderListItem(car);
    else if (layout === 'grid') return this.renderGridItem(car);
  }

  renderCarDialogContent() {
    if (this.state.selectedCar) {
      return (
        <div
          className="p-grid"
          style={{ fontSize: '16px', textAlign: 'center', padding: '20px' }}
        >
          <div className="p-col-12" style={{ textAlign: 'center' }}>
            <img
              src={
                'showcase/resources/demo/images/car/${this.state.selectedCar.brand}.png'
              }
              alt={this.state.selectedCar.brand}
            />
          </div>

          <div className="p-col-4">Vin: </div>
          <div className="p-col-8">{this.state.selectedCar.vin}</div>

          <div className="p-col-4">Year: </div>
          <div className="p-col-8">{this.state.selectedCar.year}</div>

          <div className="p-col-4">Brand: </div>
          <div className="p-col-8">{this.state.selectedCar.brand}</div>

          <div className="p-col-4">Color: </div>
          <div className="p-col-8">{this.state.selectedCar.color}</div>
        </div>
      );
    } else {
      return null;
    }
  }

  renderHeader() {
    const sortOptions = [
      { label: 'Newest First', value: '!year' },
      { label: 'Oldest First', value: 'year' },
      { label: 'Brand', value: 'brand' },
    ];

    return (
      <div className="p-grid">
        <div className="p-col-6" style={{ textAlign: 'left' }}>
          <Dropdown
            options={sortOptions}
            value={this.state.sortKey}
            placeholder="Sort By"
            onChange={this.onSortChange}
          />
        </div>
        <div className="p-col-6" style={{ textAlign: 'right' }}>
          <DataViewLayoutOptions
            layout={this.state.layout}
            onChange={e => this.setState({ layout: e.value })}
          />
        </div>
      </div>
    );
  }

  render() {
    const header = this.renderHeader();

    return (
      <DataView
        value={this.state.cars}
        layout={this.state.layout}
        header={header}
        itemTemplate={this.itemTemplate}
        paginatorPosition={'both'}
        paginator={true}
        rows={10}
        sortOrder={this.state.sortOrder}
        sortField={this.state.sortField}
      />
    );
  }
}

export default OccultationsDataView;
