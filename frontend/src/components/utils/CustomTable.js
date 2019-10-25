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

function CustomTable({
  columns,
  data,
  totalCount,
  defaultSorting,
  grouping,
  remote,
  pageSize,
  loadData,
  hasSorting,
  pageSizes,
  hasGrouping,
  hasResizing,
  hasSelection,
  hasPagination,
  hasToolbar,
  hasSearching,
  hasColumnVisibility,
  defaultExpandedGroups,
  reload,
  modalContent,
  hasFiltering,
  hasLineBreak,
}) {
  const customColumns = columns.map((column) => ({
    name: column.name,
    title: column.title,
    hasLineBreak: column.hasLineBreak ? column.hasLineBreak : false,
  }));
  const customColumnExtensions = columns.map((column) => ({
    columnName: column.name,
    width: !column.width ? 120 : column.width,
    maxWidth: column.maxWidth ? column.maxWidth : '',
    sortingEnabled:
      !!(!('sortingEnabled' in column) || column.sortingEnabled === true),
    align:
      !('align' in column) || column.align === 'left' ? 'left' : column.align,
    wordWrapEnabled:
      !(!('wordWrapEnabled' in column) || column.wordWrapEnabled === false),
  }));
  const customDefaultColumnWidths = columns.map((column) => ({
    columnName: column.name,
    width: !column.width ? 120 : column.width,
  }));

  const [customData, setCustomData] = useState(data);
  const [customTotalCount, setCustomTotalCount] = useState(totalCount);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState(
    defaultSorting[0].columnName && defaultSorting[0].direction
      ? defaultSorting
      : [
        {
          columnName: columns[0].name,
          direction: 'asc',
        },
      ],
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [after, setAfter] = useState('');
  const [customPageSize, setCustomPageSize] = useState(pageSize);
  const [filter, setFilter] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selection, setSelection] = useState([]);
  const [customModalContent, setCustomModalContent] = useState('');

  const classes = useStyles();

  useEffect(() => {
    if (remote === true) {
      loadData({
        sorting, pageSize, currentPage, after, filter, searchValue,
      });
    }
  }, [sorting, currentPage, currentPage, pageSize, filter, searchValue]);

  const clearData = () => {
    setCustomData([]);
    setLoading(false);
    setCurrentPage(0);
    setAfter('');
  };

  useEffect(() => {
    setCustomData(data);
    setCustomTotalCount(totalCount);
    setLoading(false);
  }, [data, totalCount, reload, defaultExpandedGroups]);


  useEffect(() => {
    setCustomModalContent(modalContent);
  }, [modalContent]);

  const changeSorting = (value) => {
    if (remote === true) {
      clearData();
      setLoading(true);
    }
    setSorting(value);
  };

  const changeCurrentPage = (value) => {
    const offset = value * pageSize;
    const next = window.btoa(`arrayconnection:${offset - 1}`);
    if (remote === true) {
      setLoading(true);
    }
    setCurrentPage(value);
    setAfter(next);
  };

  const changePageSize = (value) => {
    const totalPages = Math.ceil(customTotalCount / value);
    const theCurrentPage = Math.min(currentPage, totalPages - 1);
    if (remote === true) {
      setLoading(true);
    }
    setCurrentPage(theCurrentPage);
    setCustomPageSize(value);
  };

  const changeSearchValue = (value) => {
    if (value.length > 2) {
      if (remote === true) {
        clearData();
        setLoading(true);
      }
      setSearchValue(value);
    } else {
      setSearchValue('');
    }
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
    if (remote === true) {
      clearData();
      setLoading(true);
    }
    setFilter(evt.target.value);
  };

  const onHideModal = () => setVisible(false);

  const renderModal = () => (
    <Dialog onClose={onHideModal} open={visible} maxWidth="md">
      {customModalContent || ""}
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
    if (modalContent !== null) {
      setCustomModalContent('');
      setVisible(true);
    }
    column.action(row);
  };

  const renderTable = (rows) => {
    if (remote === true) {
      return (
        <>
          <Grid rows={rows} columns={customColumns}>
            {hasSearching ? <SearchState onValueChange={changeSearchValue} /> : null}
            {hasSorting ? <SortingState sorting={sorting} onSortingChange={changeSorting} /> : null}
            {hasPagination
              ? (
                <PagingState
                  currentPage={currentPage}
                  onCurrentPageChange={changeCurrentPage}
                  pageSize={customPageSize}
                  onPageSizeChange={changePageSize}
                />
              ) : null}
            {hasPagination
              ? <CustomPaging totalCount={customTotalCount} />
              : null}
            {hasSelection ? (
              <SelectionState
                selection={selection}
                onSelectionChange={changeSelection}
              />
            )
              : null}
            {hasGrouping ? (
              <GroupingState
                grouping={grouping}
                defaultExpandedGroups={defaultExpandedGroups}

              />
            )
              : null}
            {hasGrouping ? <IntegratedGrouping /> : null}
            <Table columnExtensions={customColumnExtensions} />
            {hasSelection ? (
              <TableSelection
                selectByRowClick
                highlightRow
                showSelectionColumn={false}
              />
            ) : null}
            {hasResizing ? <TableColumnResizing defaultColumnWidths={customDefaultColumnWidths} /> : null}
            <CustomTableHeaderRowCell hasSorting={hasSorting} />
            {hasGrouping ? (
              <TableGroupRow />
            )
              : null}
            {hasPagination ? <PagingPanel pageSizes={pageSizes} /> : null}
            {hasToolbar ? <Toolbar /> : null}
            {hasSearching ? <SearchPanel /> : null}
            {hasColumnVisibility
              ? (<TableColumnVisibility />)
              : null}
            {hasColumnVisibility
              ? (<CustomColumnChooser />)
              : null}
          </Grid>
          {renderModal()}
        </>
      );
    }
    return (
      <>
        <Grid rows={rows} columns={customColumns}>
          {hasSearching ? <SearchState /> : null}
          {hasSorting
            ? <SortingState sorting={sorting} onSortingChange={changeSorting} />
            : null}
          {hasSorting ? <IntegratedSorting /> : null}
          {hasPagination
            ? (
              <PagingState
                currentPage={currentPage}
                onCurrentPageChange={setCurrentPage}
                onPageSizeChange={setCustomPageSize}
                pageSize={customPageSize}
              />
            ) : null}
          {hasPagination
            ? (
              <IntegratedPaging />
            ) : null}
          {hasSelection ? (
            <SelectionState
              selection={selection}
              onSelectionChange={changeSelection}
            />
          )
            : null}
          {hasGrouping ? (
            <GroupingState
              grouping={grouping}
              defaultExpandedGroups={defaultExpandedGroups}
            />
          )
            : null}
          {hasGrouping ? <IntegratedGrouping /> : null}
          <Table columnExtensions={customColumnExtensions} />
          {hasSelection ? (
            <TableSelection
              selectByRowClick
              highlightRow
              showSelectionColumn={false}
            />
          ) : null}
          {hasResizing ? <TableColumnResizing defaultColumnWidths={customDefaultColumnWidths} /> : null}
          <CustomTableHeaderRowCell hasLineBreak={hasLineBreak} hasSorting={hasSorting} remote={remote} />
          {hasGrouping ? (
            <TableGroupRow />
          )
            : null}
          {hasPagination ? <PagingPanel pageSizes={pageSizes} /> : null}
          {hasToolbar ? <Toolbar /> : null}
          {hasSearching ? <SearchPanel /> : null}
          {hasColumnVisibility
            ? (<TableColumnVisibility />)
            : null}
          {hasColumnVisibility
            ? (<CustomColumnChooser />)
            : null}
        </Grid>
        {renderModal()}
      </>
    );
  };

  const rows = customData.map((row) => {
    const line = {};
    Object.keys(row).forEach((key) => {
      if (row[key]) {
        const column = columns.filter((el) => el.name === key)[0];
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
      {hasFiltering ? renderFilter() : null}
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
  defaultExpandedGroups: [''],
  defaultSorting: [{}],
  totalCount: 0,
  reload: false,
  remote: true,
  hasLineBreak: false,
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
  hasLineBreak: PropTypes.bool,
  defaultExpandedGroups: PropTypes.arrayOf(PropTypes.string),
  totalCount: PropTypes.number,
  reload: PropTypes.bool,
  remote: PropTypes.bool,
  grouping: PropTypes.arrayOf(PropTypes.object),
};

export default CustomTable;
