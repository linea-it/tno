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

      log: {
        visible: false,
        content: null,
      },

      main_background: "#186BA0",
      main_color: "#fff",
      error_background: "#FFFAF0",
      error_color: "#555555",

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



  // handleList = (e) => {

  //   this.setState({ checked: e.value }, () => {
  //     e.value ? this.loadErrorMessageColumns() : this.loadMainColumns();

  //   });

  //   this.state.error_list_visibility === 'hidden' ?
  //     this.setState({ error_list_visibility: 'visible' })
  //     : this.setState({ error_list_visibility: 'hidden' });

  // };



  loadMainColumns = () => {

    this.setState({
      columns: [
        {
          field: 'name',
          header: 'Name',
          style: { textAlign: 'center', width: "8%" },
          sortable: true,
        },
        {
          field: 'number',
          header: 'Number',
          style: { textAlign: 'center', width: "10%" },
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
          style: { textAlign: 'center' },
          header: 'CCD Images',
          sortable: true,
        },
        {
          field: 'processed_ccd_image',
          style: { textAlign: 'center' },
          header: 'Processed CCDs',
          sortable: true,
        },
        {
          field: 'catalog_rows',
          style: { textAlign: 'center' },
          header: 'Catalog Rows',
          sortable: true,
        },
        {
          field: 'h_execution_time',
          style: { textAlign: 'center' },
          header: 'Execution Time',
          sortable: false,
        },

        // {
        //   field: 'execution_time',
        //   header: 'Execution Time',
        //   sortable: true,
        //   style: { textAlign: 'center' },
        //   body: rowData => {
        //     if (rowData.execution_time !== '' && rowData.execution_time !== null) {
        //       return moment(rowData.execution_time)._i;
        //     } else {
        //       return;
        //     }
        //   },
        // },
      ]
    });

  }






  loadLogContent = file => {

    this.api.readCondorFile(file).then(res => {

      const logContent = res.data;

      this.setState(state => ({
        log: Object.assign({},
          state.log, { content: logContent, visible: true })
      }));

    });


  };



  openLog = (button) => {


    //button is which button was clicked to call the condor log

    const log = this.state.data[0].condor_log;
    const error = this.state.data[0].condor_err_log;
    const output = this.state.data[0].condor_out_log;


    if (button) {
      // console.log(button);

      //To call API and receive the answer to show on screen the result of reading file

      switch (button) {

        case "log":

          this.loadLogContent(log);


          break;

        case "error":

          this.loadLogContent(error);
          break;

        case "output":

          this.loadLogContent(output);

          break;

      }
    }

  };

  handleCondorButton = () => {

    return (

      <Button
        className="ui-button-warning"
        icon="fa fa-file-text-o"
        onClick={() => this.openLog("log")}
      />

    );
  };

  handleCondorError = () => {

    return (

      <Button
        className="ui-button-warning"
        icon="fa fa-file-text-o"
        onClick={() => this.openLog("error")}
      />

    );

  };


  handleCondorOutput = () => {

    return (

      <Button
        className="ui-button-warning"
        icon="fa fa-file-text-o"
        onClick={() => this.openLog("output")}
      />

    );

  };



  loadErrorMessageColumns = rowData => {


    this.setState({
      columns: [
        {
          field: 'name',
          header: 'Name',
          style: { textAlign: 'center', width: "8%" },
          sortable: true,
        },
        {
          field: 'number',
          header: 'Number',
          style: { textAlign: 'center', width: "10%" },
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
          style: { textAlign: 'center', width: "40%" },
          sortable: false,
        },

        {
          field: 'condor_log',
          header: 'Log',
          style: { textAlign: 'center', width: "7%" },
          body: this.handleCondorButton,
          sortable: false,
        },

        {
          field: 'condor_err_log',
          header: 'Error',
          body: this.handleCondorError,
          style: { textAlign: 'center', width: "7%" },

          sortable: false,
        },

        {
          field: 'condor_out_log',
          header: 'Output',
          body: this.handleCondorOutput,
          style: { textAlign: 'center', width: "8%" },
          sortable: false,
        },
      ]
    });


  }

  handleList = (button) => {

    if (button == "main") {
      console.log("oi");

    } else {

    }


  };


  // main_background: "#186BA0",
  // main_color: "#fff",
  // error_background: "#FFFAF0",
  // error_color: "#555555",

  handleListMain = () => {

    this.loadMainColumns();
    this.setState({
      main_background: "#186BA0",
      main_color: "#fff",
      error_background: "#FFFAF0",
      error_color: "#555555",
    });
  };

  handleErrorList = () => {

    this.loadErrorMessageColumns();
    this.setState({
      main_background: "#FFFAF0",
      main_color: "#555555",
      error_background: "#186BA0",
      error_color: "#fff",
    });

  }




  renderAsteroidMenuBar = () => {

    return (
      <Toolbar>
        <div className="ui-toolbar">
          <div style={{ float: 'right' }}>
            {/* <ToggleButton
              style={{ width: '50px' }}
              onIcon='fa fa-undo'
              className="ui-button-info"
              onLabel='Main'
              offLabel='Errors'
              checked={this.state.checked}
              onChange={e => this.handleList(e)}

            /> */}
            <Button
              icon="fa fa-navicon"

              style={{
                backgroundColor: this.state.main_background,
                color: this.state.main_color,
                border: "none"
              }}

              onClick={this.handleListMain}
            />
            <Button
              style={{
                backgroundColor: this.state.error_background,
                color: this.state.error_color,
                border: "none"
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
    this.setState(state => ({ log: Object.assign({}, state.log, { visible: false }) }));;

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

        {this.renderAsteroidMenuBar()}

        < Card title="" subTitle="" >

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
              style={{ textAlign: 'center', width: "13%" }}
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
          // id={this.state.asteroid_id}
          />
        </Card >

      </div>
    );


  }


}

export default AsteroidList;
