import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
  GroupingState,
  IntegratedSorting,
  IntegratedPaging,
  IntegratedGrouping,
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
  TableGroupRow,
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

  const [data, setData] = useState(props.data);
  const [totalCount, setTotalCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([
    {
      columnName: props.columns[0].name,
      direction: 'desc',
    },
  ]);
  const [currentPage, setCurrentPage] = useState(0);
  const [after, setAfter] = useState('');
  const [pageSize, setPageSize] = useState(props.pageSize);
  const [filter, setFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selection, setSelection] = useState([]);
  const [modalContent, setModalContent] = useState('');

  const classes = useStyles();

  useEffect(() => {
    if (props.remote === true) {
      props.loadData({
        sorting, pageSize, currentPage, after, filter, searchValue,
      });
    }
    // console.log(props.data);
  }, [sorting, currentPage, currentPage, pageSize, filter, searchValue]);

  useEffect(() => {
    if ('columnName' in props.defaultSorting[0] && 'direction' in props.defaultSorting[0]) {
      setSorting(props.defaultSorting);
    }
    console.log('sfdsasdsda', props.defaultExpandedGroups);
  }, []);

  const clearData = () => {
    setData([]);
    setLoading(false);
    setCurrentPage(0);
    setAfter('');
  };

  useEffect(() => {
    setData(props.data);
    setTotalCount(props.totalCount);
    setLoading(false);
    console.log(props.defaultExpandedGroups);
  }, [props.data, props.reload, props.defaultExpandedGroups]);


  useEffect(() => {
    setModalContent(props.modalContent);
  }, [props.modalContent]);

  const changeSorting = (value) => {
    if (props.remote === true) {
      clearData();
      setLoading(true);
    }
    setSorting(value);
  };

  const changeCurrentPage = (value) => {
    const offset = value * pageSize;
    const next = window.btoa(`arrayconnection:${offset - 1}`);
    if (props.remote === true) {
      setLoading(true);
    }
    setCurrentPage(value);
    setAfter(next);
  };

  const changePageSize = (value) => {
    const totalPages = Math.ceil(totalCount / value);
    const theCurrentPage = Math.min(currentPage, totalPages - 1);
    if (props.remote === true) {
      setLoading(true);
    }
    setCurrentPage(theCurrentPage);
    setPageSize(value);
  };

  const changeSearchValue = (value) => {
    if (props.remote === true) {
      clearData();
      setLoading(true);
    }
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
    if (props.remote === true) {
      clearData();
      setLoading(true);
    }
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
        marginTop: 'translateY(-50%)',
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
    if (props.modalContent !== null) {
      setModalContent('');
      setVisible(true);
    }
    column.action(row);
  };

  const renderTable = (rows) => {
    if (props.remote === true) {
      return (
        <>
          <Grid rows={rows} columns={columns}>
            {props.hasSearching ? <SearchState onValueChange={changeSearchValue} /> : null}
            {props.hasSorting ? <SortingState sorting={sorting} onSortingChange={changeSorting} /> : null }
            {props.hasPagination
              ? (
                <PagingState
                  currentPage={currentPage}
                  onCurrentPageChange={changeCurrentPage}
                  pageSize={pageSize}
                  onPageSizeChange={changePageSize}
                />
              ) : null}
            {props.hasPagination
              ? <CustomPaging totalCount={totalCount} />
              : null}
            {props.hasSelection ? (
              <SelectionState
                selection={selection}
                onSelectionChange={changeSelection}
              />
            )
              : null}
            {props.hasGrouping ? (
              <GroupingState
                grouping={props.grouping}
                defaultExpandedGroups={props.defaultExpandedGroups}

              />
            )
              : null}
            {props.hasGrouping ? <IntegratedGrouping /> : null}
            <Table columnExtensions={columnExtensions} />
            {props.hasSelection ? (
              <TableSelection
                selectByRowClick
                highlightRow
                showSelectionColumn={false}
              />
            ) : null }
            {props.hasResizing ? <TableColumnResizing defaultColumnWidths={defaultColumnWidths} /> : null}
            <CustomTableHeaderRowCell hasSorting={props.hasSorting} />
            {props.hasGrouping ? (
              <TableGroupRow />
            )
              : null}
            {props.hasPagination ? <PagingPanel pageSizes={props.pageSizes} /> : null}
            {props.hasToolbar ? <Toolbar /> : null}
            {props.hasSearching ? <SearchPanel /> : null}
            {props.hasColumnVisibility
              ? (<TableColumnVisibility />)
              : null}
            {props.hasColumnVisibility
              ? (<CustomColumnChooser />)
              : null}
          </Grid>
          {renderModal()}
        </>
      );
    }
    return (
      <>
        <Grid rows={rows} columns={columns}>
          {props.hasSearching ? <SearchState /> : null}
          {props.hasSorting
            ? <SortingState sorting={sorting} onSortingChange={changeSorting} />
            : null }
          {props.hasSorting ? <IntegratedSorting /> : null }
          {props.hasPagination
            ? (
              <PagingState
                currentPage={currentPage}
                onCurrentPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSize={pageSize}
              />
            ) : null}
          {props.hasPagination
            ? (
              <IntegratedPaging />
            ) : null}
          {props.hasSelection ? (
            <SelectionState
              selection={selection}
              onSelectionChange={changeSelection}
            />
          )
            : null}
          {props.hasGrouping ? (
            <GroupingState
              grouping={props.grouping}
              defaultExpandedGroups={props.defaultExpandedGroups}
            />
          )
            : null}
          {props.hasGrouping ? <IntegratedGrouping /> : null}
          <Table columnExtensions={columnExtensions} />
          {props.hasSelection ? (
            <TableSelection
              selectByRowClick
              highlightRow
              showSelectionColumn={false}
            />
          ) : null }
          {props.hasResizing ? <TableColumnResizing defaultColumnWidths={defaultColumnWidths} /> : null}
          <CustomTableHeaderRowCell hasSorting={props.hasSorting} remote={props.remote} />
          {props.hasGrouping ? (
            <TableGroupRow />
          )
            : null}
          {props.hasPagination ? <PagingPanel pageSizes={props.pageSizes} /> : null}
          {props.hasToolbar ? <Toolbar /> : null}
          {props.hasSearching ? <SearchPanel /> : null}
          {props.hasColumnVisibility
            ? (<TableColumnVisibility />)
            : null}
          {props.hasColumnVisibility
            ? (<CustomColumnChooser />)
            : null}
        </Grid>
        {renderModal()}
      </>
    );
  };

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
    <>
      {props.hasFiltering ? renderFilter() : null}
      {renderTable(rows)}
      {loading && renderLoading()}
    </>
  );
}

CustomTable.defaultProps = {
  loadData: () => null,
  pageSize: 10,
  pageSizes: [5, 10, 15],
  modalContent: null,
  hasFiltering: false,
  hasSearching: true,
  hasSorting: true,
  hasResizing: true,
  hasSelection: true,
  hasColumnVisibility: true,
  hasPagination: true,
  hasGrouping: false,
  hasToolbar: true,
  showColumnsWhenGrouped: false,
  defaultExpandedGroups: [''],
  defaultSorting: [{}],
  totalCount: 0,
  reload: false,
  remote: true,
  grouping: [{}],
};


CustomTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadData: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalContent: PropTypes.symbol,
  defaultSorting: PropTypes.arrayOf(PropTypes.object),
  // eslint-disable-next-line react/no-unused-prop-types
  pageSize: PropTypes.number,
  pageSizes: PropTypes.arrayOf(PropTypes.number),
  hasFiltering: PropTypes.bool,
  hasSearching: PropTypes.bool,
  hasSorting: PropTypes.bool,
  hasResizing: PropTypes.bool,
  hasSelection: PropTypes.bool,
  hasColumnVisibility: PropTypes.bool,
  hasGrouping: PropTypes.bool,
  hasPagination: PropTypes.bool,
  hasToolbar: PropTypes.bool,
  showColumnsWhenGrouped: PropTypes.bool,
  defaultExpandedGroups: PropTypes.arrayOf(PropTypes.string),
  totalCount: PropTypes.number,
  reload: PropTypes.bool,
  remote: PropTypes.bool,
  grouping: PropTypes.arrayOf(PropTypes.object),
};

export default CustomTable;
