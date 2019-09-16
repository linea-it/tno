import React, { Component } from 'react';
import 'primereact/resources/themes/omega/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import PraiaApi from './PraiaApi';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Paginator } from 'primereact/paginator';
import { Column } from 'primereact/column';
import PropTypes from 'prop-types';
import moment from 'moment';
import '../Astrometry/assets/runDetailStyle.css';
import { Toolbar } from 'primereact/toolbar';
import Log from '../../components/Dialog/Log';

class AsteroidList extends Component {
  state = this.initialState;
  api = new PraiaApi();

  // static propTypes = {
  //   orbit_run: PropTypes.number.isRequired,
  //   view_asteroid: PropTypes.func.isRequired,
  // };

  get initialState() {
    return {
      data: [],
      loading: false,
      page: 1,
      first: 0,
      sizePerPage: 100,
      totalSize: 0,
      sortField: 'name',
      sortOrder: 1,
      asteroid_id: 0,
      selected: null,
      columns: null,
      execution_time: null,

      log: {
        visible: false,
        content: null,
      },

      main_background: '#186BA0',
      main_color: '#fff',
      error_background: '#FFFAF0',
      error_color: '#555555',
    };
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (
      this.props.praia_run !== prevProps.praia_run ||
      this.props.reload_flag != prevProps.reload_flag
    ) {
      this.fetchData({
        praia_run: this.props.praia_run,
        page: this.state.page,
        sizePerPage: this.state.sizePerPage,
      });
    }
  }

  componentWillMount() {
    this.loadMainColumns();
  }

  fetchData = ({ praia_run, page, sizePerPage, sortField, sortOrder }) => {
    this.setState({ loading: true });

    const filters = [];
    filters.push({
      property: 'astrometry_run',
      value: praia_run,
    });

    this.api
      .getAsteroids({ filters, page, sizePerPage, sortField, sortOrder })
      .then(res => {
        const r = res.data;

        this.setState({
          data: r.results,
          totalSize: r.count,
          page: page,
          sizePerPage: sizePerPage,
          loading: false,
          sortField: sortField,
          sortOrder: sortOrder,
          execution_time: r.results[0].execution_time,
        });
      });
  };

  showAsteroidLog = asteroid_id => {
    this.setState({ asteroid_id, log_visible: true });
  };

  onViewAsteroid = asteroid_id => {
    this.props.view_asteroid(asteroid_id);
  };

  actionTemplate = rowData => {
    const asteroid_id = rowData.id;
    let btn_view = null;
    let btn_log = null;

    // if (rowData.status !== 'failure' && rowData.status != 'not_executed') {
    btn_view = (
      <Button
        type="button"
        icon="fa fa-search"
        className="ui-button-info"
        title="View"
        onClick={() => this.onViewAsteroid(asteroid_id)}
      />
    );
    btn_log = (
      <Button
        type="button"
        icon="fa fa-file-text-o"
        className="ui-button-warning"
        title="Log"
      // onClick={() => this.showAsteroidLog(asteroid_id)}
      />
    );
    // }

    return (
      <div>
        {btn_view}
        {/* {btn_log} */}
      </div>
    );
  };

  statusColumn = rowData => {
    if (rowData.status === 'success') {
      return (
        <Button
          type="button"
          icon="fa fa-check"
          className="ui-button-success status_button_label"
          label="Success"
        />
      );
    } else if (rowData.status === 'running') {
      return (
        <Button
          type="button"
          icon="fa fa-circle-o-notch fa-spin"
          className="ui-button-pending status_button_label"
          title={rowData.error_msg}
          label="Running"
        />
      );
    } else if (rowData.status === 'warning') {
      return (
        <Button
          type="button"
          icon="fa fa-exclamation"
          className="ui-button-warning status_button_label"
          title={rowData.error_msg}
          label="Warning"
        />
      );
    } else if (rowData.status === 'pending') {
      return (
        <Button
          type="button"
          icon="fa fa-hourglass-start"
          className="ui-button-pending status_button_label"
          title={rowData.error_msg}
          label="Pending"
        />
      );
    } else if (rowData.status === 'not_executed') {
      return (
        <Button
          type="button"
          icon="fa fa-ban"
          className="ui-button-secondary status_button_label"
          title={rowData.error_msg}
          label="Ignored"
        />
      );
    } else if (rowData.status === 'idle') {
      return (
        <Button
          type="button"
          icon="fa fa-spin fa-hourglass "
          className="ui-button-pending status_button_label"
          title={rowData.error_msg}
          label="Idle"
        />
      );
    } else if (rowData.status === 'failure') {
      return (
        <Button
          type="button"
          icon="fa fa-times"
          className="ui-button-danger status_button_label"
          title={rowData.error_msg}
          label="Failed"
        />
      );
    }
  };

  onLogHide = () => {
    this.setState({ log_visible: false, asteroid_id: 0 });
  };

  onPageChange = e => {
    const page = e.page + 1;
    this.setState(
      {
        first: e.first,
        page: page,
        sizePerPage: e.rows,
      },
      this.fetchData({
        praia_run: this.props.praia_run,
        page: page,
        sizePerPage: e.rows,
        sortField: this.state.sortField,
        sortOrder: this.state.sortOrder,
      })
    );
  };

  onSort = e => {
    this.setState(
      {
        sortField: e.sortField,
        sortOrder: e.sortOrder,
      },
      this.fetchData({
        praia_run: this.props.praia_run,
        page: this.state.page,
        sizePerPage: this.state.sizePerPage,
        sortField: e.sortField,
        sortOrder: e.sortOrder,
      })
    );
  };

  loadMainColumns = () => {
    this.setState({
      columns: [
        {
          field: 'name',
          header: 'Name',
          style: {
            width: '8%'
          },
          sortable: true,
        },
        {
          field: 'number',
          header: 'Number',
          style: {
            width: '10%'
          },
          sortable: true,
          body: rowData => {
            if (rowData.number === '-') {
              return '';
            }
            return rowData.number;
          },
        },
        {
          field: 'ccd_images',
          header: 'CCD Images',
          sortable: true,
        },
        {
          field: 'available_ccd_image',
          header: 'Available CCDs',
          sortable: false,
        },
        {
          field: 'processed_ccd_image',
          header: 'Processed CCDs',
          sortable: false,
        },
        {
          field: 'catalog_rows',
          header: 'Stars',
          sortable: false,
        },
        {
          field: 'outputs',
          header: 'Output Files',
          sortable: false,
        },
        {
          field: 'execution_time',
          header: 'Execution Time',
          sortable: false,
          body: () => {
            return this.state.execution_time.substring(1, 8);
          },
        },
      ],
    });
  };

  openLog = filepath => {
    this.api.readCondorFile(filepath).then(res => {
      const logContent = res.data.rows;
      this.setState(state => ({
        log: Object.assign({}, state.log, {
          content: logContent,
          visible: true,
          header: filepath,
        }),
      }));
    });
  };

  loadErrorMessageColumns = rowData => {
    this.setState({
      columns: [
        {
          field: 'name',
          header: 'Name',
          style: {
            width: '8%',
          },
          sortable: true,
        },
        {
          field: 'number',
          header: 'Number',
          style: {
            width: '10%',
          },
          sortable: true,
          body: rowData => {
            if (rowData.number === '-') {
              return '';
            }
            return rowData.number;
          },
        },

        {
          field: 'error_msg',
          header: 'Error',
          style: {
            width: '40%',
          },
          sortable: false,
        },

        {
          field: 'condor_log',
          header: 'Log',
          style: { textAlign: 'center', width: '7%' },
          body: rowData => {
            return (
              <Button
                className="ui-button-warning"
                icon="fa fa-file-text-o"
                onClick={() => this.openLog(rowData.condor_log)}
              />
            );
          },
          sortable: false,
        },

        {
          field: 'condor_err_log',
          header: 'Error',
          body: rowData => {
            return (
              <Button
                className="ui-button-warning"
                icon="fa fa-file-text-o"
                onClick={() => this.openLog(rowData.condor_err_log)}
              />
            );
          },
          style: { textAlign: 'center', width: '7%' },
          sortable: false,
        },

        {
          field: 'condor_out_log',
          header: 'Output',
          body: rowData => {
            return (
              <Button
                className="ui-button-warning"
                icon="fa fa-file-text-o"
                onClick={() => this.openLog(rowData.condor_out_log)}
              />
            );
          },
          style: { textAlign: 'center', width: '8%' },
          sortable: false,
        },
      ],
    });
  };

  handleListMain = () => {
    this.loadMainColumns();
    this.setState({
      main_background: '#186BA0',
      main_color: '#fff',
      error_background: '#FFFAF0',
      error_color: '#555555',
    });
  };

  handleErrorList = () => {
    this.loadErrorMessageColumns();
    this.setState({
      main_background: '#FFFAF0',
      main_color: '#555555',
      error_background: '#186BA0',
      error_color: '#fff',
    });
  };

  renderAsteroidMenuBar = () => {
    return (
      <Toolbar>
        <div className="ui-toolbar">
          <div style={{ float: 'right' }}>
            <Button
              icon="fa fa-navicon"
              style={{
                backgroundColor: this.state.main_background,
                color: this.state.main_color,
                border: 'none',
              }}
              onClick={this.handleListMain}
            />
            <Button
              style={{
                backgroundColor: this.state.error_background,
                color: this.state.error_color,
                border: 'none',
              }}
              icon="fa fa-bug"
              onClick={this.handleErrorList}
            />
          </div>
        </div>
      </Toolbar>
    );
  };

  onLogHide = () => {
    this.setState(state => ({
      log: Object.assign({}, state.log, { visible: false }),
    }));
  };

  render() {
    const { data, log } = this.state;

    const columns = this.state.columns.map((col, i) => {
      return (
        <Column
          key={i}
          field={col.field}
          header={col.header}
          sortable={col.sortable}
          style={col.style}
          body={col.body}
        />
      );
    });

    return (
      <div>
        <Card title="" subTitle="">

          {this.renderAsteroidMenuBar()}
          <DataTable
            value={data}
            resizableColumns={true}
            columnResizeMode="expand"
            reorderableColumns={false}
            reorderableRows={false}
            responsive={true}
            scrollable={true}
            loading={this.state.loading}
            totalRecords={this.state.totalSize}
            sortField={this.state.sortField}
            sortOrder={this.state.sortOrder}
            onSort={this.onSort}
          >
            <Column
              header="Status"
              body={this.statusColumn}
              style={{ textAlign: 'center', width: '13%' }}
            />
            {columns}

            <Column
              body={this.actionTemplate}
              style={{ textAlign: 'center', width: '6em' }}
            />
          </DataTable>
          <Paginator
            rows={this.state.sizePerPage}
            totalRecords={this.state.totalSize}
            first={this.state.first}
            onPageChange={this.onPageChange}
          />

          <Log
            visible={log.visible}
            onHide={this.onLogHide}
            header={log.header}
            content={log.content}
            dismissableMask={true}
          />
        </Card>
      </div>
    );
  }
}

export default AsteroidList;
