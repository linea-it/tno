import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Panel } from 'primereact/panel';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Slider } from 'primereact/slider';
import { InputText } from 'primereact/inputtext';
import OccultationApi from './OccultationApi';

class OccultationsDataView extends Component {
  state = this.initialState;
  api = new OccultationApi();

  static propTypes = {
    onView: PropTypes.func.isRequired,
  };

  get initialState() {
    return {
      data: [],
      loading: false,
      first: 0,
      pageSize: 25,
      totalSize: 0,
      layout: 'grid',
      sortField: null,
      sortKey: null,

      // Filter:
      start_date: null,
      end_date: null,
      magnitude_range: [4, 18],
      diameter_range: [0, 0],
      dynamic_classes: null,
      zone: null,
      asteroid: '',
    };
  }

  componentDidMount() {
    this.fetchData(
      this.state.page,
      this.state.pageSize,
      this.state.first,
      this.state.sortField
    );
  }

  fetchData = (page, pageSize, first, sortField) => {
    this.setState({ loading: true });

    this.api.getOccultations(page, pageSize, sortField).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        pageSize: pageSize,
        loading: false,
        first: first,
        sortField: sortField,
        sortKey: sortField,
      });
    });
  };

  onSortChange = event => {
    const value = event.value;

    this.setState(
      { sortKey: value, sortField: value },
      this.fetchData(
        this.state.page,
        this.state.pageSize,
        this.state.first,
        value
      )
    );
  };

  renderListItem = row => {
    // console.log('renderListItem: ', row);

    let name = row.asteroid_name;
    if (
      row.asteroid_number !== '-' &&
      row.asteroid_number !== row.asteroid_name &&
      row.asteroid_number !== null
    ) {
      name = row.asteroid_name + ' - ' + row.asteroid_number;
    }

    const image = this.api.api + row.src;

    return (
      <div className="p-grid" style={{ marginBottom: '7px' }}>
        <div
          className="p-col-12 p-md-3"
          style={{ minWidth: '300px', minHeight: '300px' }}
        >
          <img src={image} alt="" style={{ width: '300px' }} />
        </div>
        <div className="p-col-12 p-md-8 car-data" style={{ color: '#333333' }}>
          <div>
            Date: <b>{row.date_time}</b>
          </div>
          <div>
            Asteroid: <b>{name}</b>
          </div>
          <div>
            G*mag: <b>{row.g}</b>
          </div>
          <div>
            <Button
              icon="pi pi-search"
              label="Detail"
              onClick={e => this.onClickDetail(row)}
            />
          </div>
        </div>
      </div>
    );
  };

  renderGridItem = row => {
    // console.log('renderGridItem: ', row);
    let name = row.asteroid_name;
    if (
      row.asteroid_number !== '-' &&
      row.asteroid_number !== row.asteroid_name &&
      row.asteroid_number !== null
    ) {
      name = '(' + row.asteroid_number + ') ' + row.asteroid_name;
    }

    const image = this.api.api + row.src;

    return (
      <div style={{ padding: '.5em' }} className="p-col-12 p-md-3">
        <Panel header={name} style={{ textAlign: 'center' }}>
          <div style={{ minWidth: '300px', minHeight: '300px' }}>
            <img src={image} alt="" style={{ width: '300px' }} />
          </div>
          <div>{row.date_time}</div>
          <div>G mag* {row.g}</div>
          <hr className="ui-widget-content" style={{ borderTop: 0 }} />
          <Button
            icon="pi pi-search"
            label="Detail"
            onClick={e => this.onClickDetail(row)}
          />
        </Panel>
      </div>
    );
  };

  itemTemplate = (row, layout) => {
    if (!row) {
      return null;
    }

    if (layout === 'list') return this.renderListItem(row);
    else if (layout === 'grid') return this.renderGridItem(row);
  };

  onClickDetail = row => {
    this.props.onView(row);
  };

  onPageChange = e => {
    // const page = e.originalEvent.page + 1;
    // Esse funciona
    // this.setState({first: e.first, rows: e.rows}, )

    // Esse NAO
    // this.fetchData(page, e.originalEvent.rows, e.first);
  };

  renderHeader = () => {
    const sortOptions = [
      { label: 'Newest First', value: '-date_time' },
      { label: 'Oldest First', value: 'date_time' },
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
    const header = this.renderHeader();

    const dynamic_classes = [
      {
        name: 'Centaurs',
      },
      {
        name: 'KBOs',
      },
    ];

    const zone_options = [
      { name: 'East-Asia' },
      { name: 'Europe & North Africa' },
      { name: 'Oceania' },
      { name: 'Southern Africa' },
      { name: 'North America' },
      { name: 'South America' },
    ];

    return (
      <div>
        <Panel>
          <div className="p-grid p-fluid">
            <div className="p-col-6">
              <p className="label-prediction">Date Filter</p>
              <div className="p-grid p-fluid">
                <div className="p-col">
                  <Calendar
                    value={this.state.start_date}
                    onChange={e => this.setState({ start_date: e.value })}
                    showButtonBar={true}
                    placeholder="Start Date"
                    showIcon={true}
                  />
                </div>
                <div className="p-col">
                  <Calendar
                    value={this.state.end_date}
                    onChange={e => this.setState({ end_date: e.value })}
                    showButtonBar={true}
                    placeholder="End Date"
                    showIcon={true}
                  />
                </div>
              </div>
            </div>
            <div className="p-col">
              <p className="label-prediction">
                Magnitude: {this.state.magnitude_range[0]},{' '}
                {this.state.magnitude_range[1]}
              </p>
              <div className="p-inputgroup">
                <Slider
                  value={this.state.magnitude_range}
                  onChange={e => this.setState({ magnitude_range: e.value })}
                  range={true}
                  style={{ width: '14em' }}
                  min={4}
                  max={23}
                />
              </div>
            </div>
            <div className="p-col">
              <p className="label-prediction">
                Diameter (Km): {this.state.diameter_range[0]},{' '}
                {this.state.diameter_range[1]}
              </p>
              <Slider
                value={this.state.diameter_range}
                onChange={e => this.setState({ diameter_range: e.value })}
                range={true}
                style={{ width: '14em' }}
                min={0}
                max={5000}
              />
            </div>
            {/* Fim da primeira linha */}
            <div className="p-col-4">
              <p className="label-prediction"> Object</p>
              <div className="p-inputgroup">
                <InputText
                  placeholder="Object Number, name or designation"
                  style={{ width: '280px' }}
                  value={this.state.asteroid}
                  onChange={e => {
                    this.setState({ asteroid: e.value });
                  }}
                />
                <Button icon="pi pi-search" />
              </div>
            </div>
            <div className="p-col-4">
              <p className="label-prediction"> Dynamic Class</p>
              <Dropdown
                optionLabel="name"
                value={this.state.dynamic_class}
                options={dynamic_classes}
                onChange={e => {
                  this.setState({ dynamic_class: e.value });
                }}
                placeholder="Select a Dynamic Class"
                autoWidth={false}
                style={{ width: '200px' }}
              />
            </div>
            <div className="p-col-4">
              <p className="label-prediction">Zone</p>
              <Dropdown
                optionLabel="name"
                value={this.state.zone}
                options={zone_options}
                onChange={e => {
                  this.setState({ zone: e.value });
                }}
                placeholder="Select a Zone"
                autoWidth={false}
                style={{ width: '200px' }}
              />
            </div>
          </div>
        </Panel>
        <DataView
          value={this.state.data}
          layout={this.state.layout}
          header={header}
          itemTemplate={this.itemTemplate}
          paginatorPosition={'both'}
          paginator={false}
          rows={this.state.pageSize}
          totalRecords={this.state.totalSize}
          first={this.state.first}
          // sortOrder={this.state.sortOrder}
          // sortField={this.state.sortField}
          onPage={this.onPageChange}
        />
      </div>
    );
  }
}

export default OccultationsDataView;
