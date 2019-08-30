import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import {
  PagingState,
  SortingState,
  CustomPaging,
  SearchState,
  SelectionState,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  PagingPanel,
  TableColumnResizing,
  Toolbar,
  SearchPanel,
  TableSelection,
  TableColumnVisibility,
} from '@devexpress/dx-react-grid-material-ui';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import CustomColumnChooser from './CustomColumnChooser';
import CustomTableHeaderRowCell from './CustomTableHeaderRowCell';

const useStyles = makeStyles({
  wrapPaper: {
    position: 'relative',
    paddingTop: '10px',
  },
  formControl: {
    width: '180px',
    position: 'absolute',
    top: '8px',
    left: '24px',
    zIndex: '999',
  },
});

function CustomTable(props) {
  const columns = props.columns.map((column) => ({
    name: column.name,
    title: column.title,
  }));
  const columnExtensions = props.columns.map((column) => ({
    columnName: column.name,
    width: !column.width ? 120 : column.width,
    sortingEnabled:
      !!(!('sortingEnabled' in column) || column.sortingEnabled === true),
    align:
      !('align' in column) || column.align === 'left' ? 'left' : column.align,
    wordWrapEnabled:
      !(!('wordWrapEnabled' in column) || column.wordWrapEnabled === false),
  }));
  const defaultColumnWidths = props.columns.map((column) => ({
    columnName: column.name,
    width: !column.width ? 120 : column.width,
  }));

  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([
    {
      columnName: 'processes_process_id',
      direction: 'desc',
    },
  ]);
  const [currentPage, setCurrentPage] = useState(0);
  const [after, setAfter] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selection, setSelection] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [modalContent, setModalContent] = useState('');

  const classes = useStyles();

  useEffect(() => {
    props.loadData(sorting, pageSize, after, filter, searchValue);
  }, [sorting, currentPage, after, pageSize, filter, searchValue]);

  const clearData = () => {
    setData([]);
    setLoading(false);
    setCurrentPage(0);
    setAfter('');
  };

  useEffect(() => {
    clearData();
    setData(props.data);
    setTotalCount(props.totalCount);
  }, [props.data]);

  useEffect(() => {
    setModalContent(props.modalContent);
  }, [props.modalContent]);

  const changeSorting = (value) => {
    setLoading(true);
    setSorting(value);
  };

  const changeCurrentPage = (value) => {
    const offset = value * pageSize;
    const next = window.btoa(`arrayconnection:${offset - 1}`);
    setLoading(true);
    setCurrentPage(value);
    setAfter(next);
  };

  const changePageSize = (value) => {
    const totalPages = Math.ceil(totalCount / value);
    const theCurrentPage = Math.min(currentPage, totalPages - 1);
    setLoading(true);
    setCurrentPage(theCurrentPage);
    setPageSize(value);
  };

  const changeSearchValue = (value) => {
    clearData();
    setLoading(true);
    setSearchValue(value);
  };

  const changeSelection = (value) => {
    let select = value;
    if (value.length > 0) {
      const diff = value.filter((x) => !selection.includes(x));
      select = diff;
    } else {
      select = [];
    }
    setSelection(select);
  };

  const handleChangeFilter = (evt) => {
    clearData();
    setFilter(evt.target.value);
  };

  const onHideModal = () => setVisible(false);

  const renderModal = () => (
    <Dialog onClose={onHideModal} open={visible} maxWidth="md">
      {modalContent}
    </Dialog>
  );

  const renderLoading = () => (
    <CircularProgress
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        margin: '-30px 0 0 -20px',
        zIndex: '99',
      }}
    />
  );

  const renderFilter = () => (
    <FormControl className={classes.formControl}>
      <InputLabel shrink htmlFor="filter-label-placeholder">
          Filter
      </InputLabel>
      <Select
        value={filter}
        onChange={handleChangeFilter}
        input={<Input name="filter" id="filter-label-placeholder" />}
        displayEmpty
        name="filter"
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="running">Running</MenuItem>
      </Select>
    </FormControl>
  );

  const onClickAction = (column, row) => {
    setModalContent('');
    setVisible(true);
    column.action(row);
  };

  const renderTable = (rows) => (
    <>
      <Grid rows={rows} columns={columns}>
        <SearchState onValueChange={changeSearchValue} />
        <SortingState sorting={sorting} onSortingChange={changeSorting} />
        <PagingState
          currentPage={currentPage}
          onCurrentPageChange={changeCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={changePageSize}
        />
        <CustomPaging totalCount={totalCount} />
        <SelectionState
          selection={selection}
          onSelectionChange={changeSelection}
        />
        <Table columnExtensions={columnExtensions} />
        <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
        <CustomTableHeaderRowCell />
        <TableColumnVisibility />
        <TableSelection
          selectByRowClick
          highlightRow
          showSelectionColumn={false}
        />
        <PagingPanel pageSizes={props.pageSizes} />
        <Toolbar />
        <SearchPanel />
        <CustomColumnChooser />
      </Grid>
      {renderModal()}
    </>
  );

  const rows = data.map((row) => {
    const line = {};
    Object.keys(row).forEach((key) => {
      if (row[key]) {
        const column = props.columns.filter((el) => el.name === key)[0];
        if (
          (column && column.icon && typeof row[key] !== 'object')
          /*
          If the current row is an array or object, then verify if its length is higher than 1.
          This was created for the "Release" column,
          that sometimes has multiple releases for a single dataset.
          */
          || (column
            && column.icon
            && (typeof row[key] === 'object' && row[key].length > 1)
            && !column.customElement)
        ) {
          if (column.action) {
            line[key] = (
              <>
                <Button onClick={() => onClickAction(column, row)}>
                  {column.icon}
                </Button>
              </>
            );
          } else {
            line[key] = <>{column.icon}</>;
          }
          /*
            If the current row has a custom element, than render it, instead of the default.
          */
        } else if (column && column.customElement) {
          line[key] = column.customElement(row);
        } else {
          line[key] = row[key];
        }
      } else {
        line[key] = '-';
      }
    });
    return line;
  });

  return (
    <Paper className={classes.wrapPaper}>
      {renderFilter()}
      {renderTable(rows)}
      {loading && renderLoading()}
    </Paper>
  );
}

CustomTable.defaultProps = {
  pageSizes: [5, 10, 15],
};

CustomTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadData: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCount: PropTypes.number.isRequired,
  modalContent: PropTypes.symbol.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  pageSizes: PropTypes.arrayOf(PropTypes.number),
};

export default CustomTable;
