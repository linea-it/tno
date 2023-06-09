import React, { useEffect, useState } from 'react'
import PropTypes, { object } from 'prop-types'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import clsx from 'clsx'
import {
  PagingState,
  SortingState,
  CustomPaging,
  SearchState,
  SelectionState,
  GroupingState,
  IntegratedSorting,
  IntegratedPaging,
  IntegratedGrouping
} from '@devexpress/dx-react-grid'
import {
  Grid,
  Table as MuiTable,
  PagingPanel,
  TableColumnResizing,
  Toolbar,
  SearchPanel,
  TableSelection,
  TableColumnVisibility,
  TableGroupRow
} from '@devexpress/dx-react-grid-material-ui'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import ColumnChooser from './ColumnChooser'
import HeaderRowCell from './HeaderRowCell'
import RowIndexer from './plugins/RowIndexer'
import useStyles from './styles'

function CustomNoDataCellComponent({ ...noDatProps }, customLoading) {
  const classes = useStyles()
  return (
    <td className={clsx(classes.noDataCell, 'MuiTableCell-root', 'MuiTableCell-body')} {...noDatProps}>
      <div className={classes.noDataWrapper}>
        <big className={classes.noDataText}>{customLoading ? 'Loading...' : 'No Data'}</big>
      </div>
    </td>
  )
}

function Table({
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
  defaultHiddenColumnNames,
  modalContent,
  hasFiltering,
  hasLineBreak,
  loading
}) {
  const customColumns = columns.map((column) => ({
    name: column.name,
    title: column.title,
    hasLineBreak: column.hasLineBreak ? column.hasLineBreak : false,
    tooltip: column.headerTooltip ? column.headerTooltip : ''

  }))

  const customColumnExtensions = columns.map((column) => ({
    columnName: column.name,
    width: !column.width ? 120 : column.width,
    maxWidth: column.maxWidth ? column.maxWidth : '',
    sortingEnabled: !!(!('sortingEnabled' in column) || column.sortingEnabled === true),
    align: !('align' in column) || column.align === 'left' ? 'left' : column.align,
    wordWrapEnabled: !(!('wordWrapEnabled' in column) || column.wordWrapEnabled === false)
  }))

  const customDefaultColumnWidths = columns.map((column) => ({
    columnName: column.name,
    width: !column.width ? 120 : column.width
  }))

  const customSorting = () => {
    if (defaultSorting && defaultSorting[0].columnName && defaultSorting[0].direction) {
      return defaultSorting
    }
    if (customColumns && customColumns[0]) {
      return [
        {
          columnName: customColumns[0].name,
          direction: 'asc'
        }
      ]
    }
    return null
  }

  const [customData, setCustomData] = useState(data)
  const [customTotalCount, setCustomTotalCount] = useState(totalCount)
  const [visible, setVisible] = useState(false)
  const [customLoading, setCustomLoading] = useState(true)
  const [sorting, setSorting] = useState(customSorting())
  const [currentPage, setCurrentPage] = useState(0)
  const [after, setAfter] = useState('')
  const [customPageSize, setCustomPageSize] = useState(pageSize)
  const [filter, setFilter] = useState('all')
  const [searchValue, setSearchValue] = useState('')
  const [selection, setSelection] = useState([])
  const [customModalContent, setCustomModalContent] = useState('')
  const [customDefaultHiddenColumnNames, setCustomDefaultHiddenColumnNames] = useState(defaultHiddenColumnNames)

  const classes = useStyles()

  useEffect(() => {
    if (remote === true) {
      loadData({
        sorting,
        pageSize: customPageSize,
        currentPage,
        after,
        filter,
        searchValue
      })
    }
  }, [sorting, currentPage, reload, customPageSize, filter, searchValue]) // eslint-disable-line

  const clearData = () => {
    setCustomData([])
    setCustomLoading(true)
    setCurrentPage(0)
    setAfter('')
  }

  useEffect(() => {
    setCustomData(data)
    setCustomTotalCount(totalCount)
    setCustomLoading(false)
  }, [data, totalCount, defaultExpandedGroups])

  useEffect(() => {
    if (loading !== null) setCustomLoading(loading)
  }, [loading])

  useEffect(() => {
    setCustomModalContent(modalContent)
  }, [modalContent])

  const changeSorting = (value) => {
    if (remote === true) {
      clearData()
      setCustomLoading(true)
    }

    setSorting([value[value.length - 1]])
  }

  const changeCurrentPage = (value) => {
    const offset = value * pageSize
    const next = window.btoa(`arrayconnection:${offset - 1}`)
    if (remote === true) {
      setCustomLoading(true)
    }
    setCurrentPage(value)
    setAfter(next)
  }

  const changePageSize = (value) => {
    const totalPages = Math.ceil(customTotalCount / value)
    const theCurrentPage = Math.min(currentPage, totalPages - 1)
    if (remote === true) {
      setCustomLoading(true)
    }
    setCurrentPage(theCurrentPage)
    setCustomPageSize(value)
  }

  const changeSearchValue = (value) => {
    if (value.length > 2) {
      if (remote === true) {
        clearData()
        setCustomLoading(true)
      }
      setSearchValue(value)
    } else {
      setSearchValue('')
    }
  }

  const changeSelection = (value) => {
    let select = value
    if (value.length > 0) {
      const diff = value.filter((x) => !selection.includes(x))
      select = diff
    } else {
      select = []
    }
    setSelection(select)
  }

  const handleChangeFilter = (evt) => {
    if (remote === true) {
      clearData()
      setCustomLoading(true)
    }
    setFilter(evt.target.value)
  }

  const onHideModal = () => setVisible(false)

  const renderModal = () => (
    <Dialog onClose={onHideModal} open={visible} maxWidth='md'>
      {customModalContent || ''}
    </Dialog>
  )

  const renderLoading = () => (
    <CircularProgress
      size={20}
      style={{
        position: 'absolute',
        top: 'calc(50% + 20px)',
        left: 'calc(50%)',
        marginTop: 'translateY(-50%)',
        zIndex: '99'
      }}
    />
  )

  const renderFilter = () => (
    <FormControl className={classes.formControl}>
      <InputLabel shrink htmlFor='filter-label-placeholder'>
        Filter
      </InputLabel>
      <Select
        value={filter}
        onChange={handleChangeFilter}
        input={<Input name='filter' id='filter-label-placeholder' />}
        displayEmpty
        name='filter'
      >
        <MenuItem value='all'>All</MenuItem>
        <MenuItem value='running'>Running</MenuItem>
      </Select>
    </FormControl>
  )

  const onClickAction = (column, row) => {
    if (modalContent !== null) {
      setCustomModalContent('')
      setVisible(true)
    }
    column.action(row)
  }

  const renderTable = (rows) => {
    if (remote === true) {
      return (
        <>
          <Grid rows={rows} columns={customColumns}>
            {hasSearching ? <SearchState onValueChange={changeSearchValue} /> : null}
            {hasSorting ? (
              <SortingState sorting={sorting} onSortingChange={changeSorting} columnExtensions={customColumnExtensions} />
            ) : null}
            {hasPagination ? (
              <PagingState
                currentPage={currentPage}
                onCurrentPageChange={changeCurrentPage}
                pageSize={customPageSize}
                onPageSizeChange={changePageSize}
              />
            ) : null}
            {hasPagination ? <CustomPaging totalCount={customTotalCount} /> : null}
            {hasSelection ? <SelectionState selection={selection} onSelectionChange={changeSelection} /> : null}
            {hasGrouping ? <GroupingState grouping={grouping} defaultExpandedGroups={defaultExpandedGroups} /> : null}
            {hasGrouping ? <IntegratedGrouping /> : null}
            {loading !== null ? (
              <MuiTable
                columnExtensions={customColumnExtensions}
                noDataCellComponent={(props) => CustomNoDataCellComponent({ ...props }, customLoading)}
              />
            ) : (
              <MuiTable columnExtensions={customColumnExtensions} />
            )}
            {hasSelection ? <TableSelection selectByRowClick highlightRow showSelectionColumn={false} /> : null}
            {hasResizing ? <TableColumnResizing defaultColumnWidths={customDefaultColumnWidths} /> : null}
            <HeaderRowCell hasSorting={hasSorting} />
            {hasGrouping ? <TableGroupRow /> : null}
            {hasPagination ? <PagingPanel pageSizes={pageSizes} /> : null}
            {hasToolbar ? <Toolbar /> : null}
            {hasSearching ? <SearchPanel /> : null}
            {hasColumnVisibility ? <TableColumnVisibility  defaultHiddenColumnNames={ customDefaultHiddenColumnNames } /> : null}
            {hasColumnVisibility ? <ColumnChooser /> : null}
            <RowIndexer />
          </Grid>
          {renderModal()}
        </>
      )
    }
    return (
      <>
        <Grid rows={rows} columns={customColumns}>
          {hasSearching ? <SearchState /> : null}
          {hasSorting ? <SortingState sorting={sorting} onSortingChange={changeSorting} columnExtensions={customColumnExtensions} /> : null}
          {hasSorting ? <IntegratedSorting /> : null}
          {hasPagination ? (
            <PagingState
              currentPage={currentPage}
              onCurrentPageChange={setCurrentPage}
              onPageSizeChange={setCustomPageSize}
              pageSize={customPageSize}
            />
          ) : null}
          {hasPagination ? <IntegratedPaging /> : null}
          {hasSelection ? <SelectionState selection={selection} onSelectionChange={changeSelection} /> : null}
          {hasGrouping ? <GroupingState grouping={grouping} defaultExpandedGroups={defaultExpandedGroups} /> : null}
          {hasGrouping ? <IntegratedGrouping /> : null}
          {loading !== null ? (
            <MuiTable
              columnExtensions={customColumnExtensions}
              noDataCellComponent={(props) => CustomNoDataCellComponent({ ...props }, customLoading)}
            />
          ) : (
            <MuiTable columnExtensions={customColumnExtensions} />
          )}

          {hasSelection ? <TableSelection selectByRowClick highlightRow showSelectionColumn={false} /> : null}
          {hasResizing ? <TableColumnResizing defaultColumnWidths={customDefaultColumnWidths} /> : null}
          <HeaderRowCell hasLineBreak={hasLineBreak} hasSorting={hasSorting} remote={remote} />
          {hasGrouping ? <TableGroupRow /> : null}
          {hasPagination ? <PagingPanel pageSizes={pageSizes} /> : null}
          {hasToolbar ? <Toolbar /> : null}
          {hasSearching ? <SearchPanel /> : null}
          {hasColumnVisibility ? <TableColumnVisibility /> : null}
          {hasColumnVisibility ? <ColumnChooser /> : null}
          <RowIndexer />
        </Grid>
        {renderModal()}
      </>
    )
  }

  const rows = customData.map((row) => {
    const line = {}
    Object.keys(row).forEach((key) => {
      const column = columns.filter((el) => el.name === key)[0]
      if (key in row) {
        if (
          (column && column.icon && typeof row[key] !== 'object') ||
          /*
          If the current row is an array or object, then verify if its length is higher than 1.
          This was created for the "Release" column,
          that sometimes has multiple releases for a single dataset.
          */
          (column && column.icon && typeof row[key] === 'object' && row[key].length > 1 && !column.customElement)
        ) {
          if (column.action) {
            line[key] = (
              <>
                <Button onClick={() => onClickAction(column, row)}>{column.icon}</Button>
              </>
            )
          } else {
            line[key] = <>{column.icon}</>
          }
          /*
            If the current row has a custom element, than render it, instead of the default.
          */
        } else if (column && column.customElement) {
          line[key] = column.customElement(row)
        } else {
          line[key] = row[key]
        }
      } else if (column && column.customElement) {
        line[key] = column.customElement(row)
      } else {
        line[key] = '-'
      }
    })
    return line
  })

  return (
    <div className={classes.container}>
      {hasFiltering ? renderFilter() : null}
      {renderTable(rows)}
      {customLoading && renderLoading()}
    </div>
  )
}

Table.defaultProps = {
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
  defaultSorting: null,
  totalCount: 0,
  reload: false,
  remote: true,
  hasLineBreak: false,
  grouping: [{}],
  loading: null
}

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadData: PropTypes.func,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  modalContent: PropTypes.symbol,
  defaultSorting: PropTypes.arrayOf(PropTypes.object),
  // eslint-disable-next-line react/no-unused-prop-types
  pageSize: PropTypes.number,
  pageSizes: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.number), PropTypes.number]),
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
  loading: PropTypes.bool
}

export default Table
