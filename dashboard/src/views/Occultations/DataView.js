import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Dialog } from 'primereact/dialog';
import { Panel } from 'primereact/panel';
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
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
      pageSize: 1000,
      totalSize: 0,
      layout: 'list',
      selected: null,
      sortField: null,
      sortOrder: null,
      sortKey: null,
    };
  }

  componentDidMount() {
    this.fetchData(this.state.page, this.state.pageSize, this.state.first);
  }

  fetchData = (page, pageSize, first) => {
    // this.setState({ loading: true });

    this.api.getOccultations(page, pageSize).then(res => {
      const r = res.data;
      this.setState({
        data: r.results,
        totalSize: r.count,
        pageSize: pageSize,
        loading: false,
        first: first,
        // sortField: sortField,
        // sortOrder: sortOrder,
      });
    });
  };

  // onSortChange = event => {
  //   const value = event.value;

  //   if (value.indexOf('!') === 0) {
  //     this.setState({
  //       sortOrder: -1,
  //       sortField: value.substring(1, value.length),
  //       sortKey: value,
  //     });
  //   } else {
  //     this.setState({
  //       sortOrder: 1,
  //       sortField: value,
  //       sortKey: value,
  //     });
  //   }
  // };

  renderListItem = row => {
    // console.log('renderListItem: ', row);

    let name = row.asteroid_name;
    if (
      row.asteroid_number != '-' &&
      row.asteroid_number != row.asteroid_name &&
      row.asteroid_number != null
    ) {
      name = row.asteroid_name + ' - ' + row.asteroid_number;
    }

    const image = this.api.api + row.src;

    return (
      <div className="p-grid" style={{ marginBottom: '7px' }}>
        <div className="p-col-12 p-md-3">
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
        {/* <div
          className="p-col-12 p-md-1 search-icon"
          style={{ marginTop: '40px' }}
        >
          <Button
            icon="pi pi-search"
            onClick={e => console.log('Clicou no detalhe')}
          />
        </div> */}
      </div>
    );
  };

  renderGridItem = row => {
    // console.log('renderGridItem: ', row);
    let name = row.asteroid_name;
    if (
      row.asteroid_number != '-' &&
      row.asteroid_number != row.asteroid_name &&
      row.asteroid_number != null
    ) {
      name = row.asteroid_name + ' - ' + row.asteroid_number;
    }

    const image = this.api.api + row.src;

    return (
      <div style={{ padding: '.5em' }} className="p-col-12 p-md-3">
        <Panel header={name} style={{ textAlign: 'center' }}>
          <img src={image} alt="" style={{ width: '300px' }} />
          <div className="car-detail">{row.date_time}</div>
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

  // renderCarDialogContent = () => {
  //   if (this.state.selected) {
  //     return (
  //       <div
  //         className="p-grid"
  //         style={{ fontSize: '16px', textAlign: 'center', padding: '20px' }}
  //       >
  //         <div className="p-col-12" style={{ textAlign: 'center' }}>
  //           <img
  //             src={
  //               'showcase/resources/demo/images/car/${this.state.selectedCar.brand}.png'
  //             }
  //             alt={this.state.selectedCar.brand}
  //           />
  //         </div>

  //         <div className="p-col-4">Vin: </div>
  //         <div className="p-col-8">{this.state.selected.vin}</div>

  //         <div className="p-col-4">Year: </div>
  //         <div className="p-col-8">{this.state.selected.year}</div>

  //         <div className="p-col-4">Brand: </div>
  //         <div className="p-col-8">{this.state.selected.brand}</div>

  //         <div className="p-col-4">Color: </div>
  //         <div className="p-col-8">{this.state.selected.color}</div>
  //       </div>
  //     );
  //   } else {
  //     return null;
  //   }
  // };

  onClickDetail = row => {
    this.props.onView(row);
  }

  onPageChange = e => {
    const page = e.originalEvent.page + 1;
    // Esse funciona 
    // this.setState({first: e.first, rows: e.rows}, )

    // Esse NAO
    // this.fetchData(page, e.originalEvent.rows, e.first);
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
          {/* <Dropdown
            options={sortOptions}
            value={this.state.sortKey}
            placeholder="Sort By"
            onChange={this.onSortChange}
          /> */}
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

    return (
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
    );
  }
}

export default OccultationsDataView;
