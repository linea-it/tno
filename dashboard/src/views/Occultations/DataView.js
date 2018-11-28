import React, { Component } from 'react';

import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { CarService } from './CarService';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import OccultationApi from './OccultationApi';

class OccultationsDataView extends Component {
  state = this.initialState;
  api = new OccultationApi();

  get initialState() {
    return {
      data: [],
      loading: false,
      page: 1,
      pageSize: 10,
      totalSize: 0,
      layout: 'list',
      selected: null,
      sortKey: null,
      sortOrder: null,
    };
  }
  // constructor() {
  //   super();
  //   this.state = {
  //     cars: [],
  //     data: [],
  //     layout: 'list',
  //     selectedCar: null,
  //     visible: false,
  //     sortKey: null,
  //     sortOrder: null,
  //   };
  //   this.carservice = new CarService();
  //   this.itemTemplate = this.itemTemplate.bind(this);
  //   this.onSortChange = this.onSortChange.bind(this);
  // }

  componentDidMount() {
    // this.carservice.getCarsLarge().then(data => this.setState({ cars: data }));
    // this.setState({ cars: this.carservice.getCarsLarge() })

    this.setState({
      data: [
        {
          name: '1999 RB216',
          number: '123456',
          asteroid: null,
          ra_star_candidate: '',
          dec_star_candidate: '',
          ra_target: '',
          dec_target: '',
          closest_approach: null,
          position_angle: null,
          velocity: null,
          delta: null,
          g: null,
          j: null,
          h: null,
          k: null,
          long: null,
          loc_t: null,
          off_ra: null,
          off_dec: null,
          proper_motion: null,
          ct: '',
          multiplicity_flag: null,
          e_ra: null,
          e_dec: null,
          pmra: null,
          pmdec: null,
        },
      ],
      totalSize: 1,
    });
  }

  onSortChange = event => {
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
  };

  renderListItem = row => {
    console.log('renderListItem: ', row);
    return (
      <div
        className="p-col-12"
        style={{ padding: '2em', borderBottom: '1px solid #d9d9d9' }}
      >
        {/* <div className="p-col-12 p-md-3">
          <img
            src={'showcase/resources/demo/images/car/${car.brand}.png'}
            alt={occ.image}
          />
        </div>
        <div className="p-col-12 p-md-8 car-details">
          <div className="p-grid">
            <div className="p-col-2 p-sm-6">Vin:</div>
            <div className="p-col-10 p-sm-6">{occ.name}</div>

            <div className="p-col-2 p-sm-6">Year:</div>
            <div className="p-col-10 p-sm-6">{occ.number}</div>

            <div className="p-col-2 p-sm-6">Brand:</div>
            <div className="p-col-10 p-sm-6">{occ.g}</div>

            <div className="p-col-2 p-sm-6">Color:</div>
            <div className="p-col-10 p-sm-6">{occ.date}</div>
          </div>
        </div>

        <div
          className="p-col-12 p-md-1 search-icon"
          style={{ marginTop: '40px' }}
        >
          <Button
            icon="pi pi-search"
            onClick={e => this.setState({ selected: car, visible: true })}
          />
        </div> */}
      </div>
    );
  };

  renderGridItem = row => {
    console.log('renderGridItem: ', row);
    return (
      <div style={{ padding: '.5em' }} className="p-col-12 p-md-3">
        {/* <Panel header={car.vin} style={{ textAlign: 'center' }}>
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
            // onClick={e => this.setState({ selected: car, visible: true })}
          />
        </Panel> */}
      </div>
    );
  };

  itemTemplate = (row, layout) => {
    console.log('itemTemplate: ', row, layout);
    if (!row) {
      return;
    }

    if (layout === 'list') return this.renderListItem(row);
    else if (layout === 'grid') return this.renderGridItem(row);
  };

  renderCarDialogContent = () => {
    if (this.state.selected) {
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
          <div className="p-col-8">{this.state.selected.vin}</div>

          <div className="p-col-4">Year: </div>
          <div className="p-col-8">{this.state.selected.year}</div>

          <div className="p-col-4">Brand: </div>
          <div className="p-col-8">{this.state.selected.brand}</div>

          <div className="p-col-4">Color: </div>
          <div className="p-col-8">{this.state.selected.color}</div>
        </div>
      );
    } else {
      return null;
    }
  };

  renderHeader = () => {
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
  };

  render() {
    // const header = this.renderHeader();

    return (
      <DataView
        value={this.state.data}
        layout={this.state.layout}
        // header={header}
        itemTemplate={this.itemTemplate}
        paginatorPosition={'both'}
        paginator={true}
        rows={this.state.pageSize}
        sortOrder={this.state.sortOrder}
        sortField={this.state.sortField}
      />
    );
  }
}

export default OccultationsDataView;
