import React, { useState, useContext } from 'react'
import { useQuery } from 'react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { delSubscriptionInfo, listPreferenceEventFilters } from '../../../services/api/Newsletter'
import { CardHeader } from '@mui/material'
import PropTypes from 'prop-types'
//import AsteroidSelect from '../../../components/AsteroidSelect/AsteroidSelect'
//import MagnitudeSelect from '../../../components/Newsletter/MagnitudeSelect/index'
//import GeoFilter from '../../../components/GeoFilter/index'
//import MaginitudeSelect from '../../../components/MaginitudeSelect/index'
//import handleRemove from '../../../components/Newsletter/index'
import { alpha } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
//import handleRemove from './RemoveFilters'
//import RemoveFilters from './RemoveFilters'
import SetEventFiltersResults from '../../../components/Newsletter/SetEventFiltersResults'
import NewsletterEventFiltersSettings from '../../../components/Newsletter/index'

function EventFiltersResults({ subscriptionId }) {

  const { data, isLoading } = useQuery({
    queryKey: ['preferenceEventFilters', { subscriptionId: subscriptionId }],
    queryFn: listPreferenceEventFilters,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false
  })

  if (isLoading) {
    return <Box>Loading...</Box>
  }

  const input = data.results
  //console.log(input.frequency)
  
  //console.log(input)

const inputData  = input.map((data) => (
    data.id
    //Object.getOwnPropertyDescriptor(subscriptionId, "subscriptionId").value
))
console.log(subscriptionId)
const id = subscriptionId
/************************************** */
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }
  
  // This method is created for cross-browser compatibility, if you don't
  // need to support IE11, you can use Array.prototype.sort() directly
  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }
  
  const headCells = [ 
    {
        id: 'icons',
        numeric: false,
        disablePadding: true,
        label: '',
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'Name Filter',
    },
    {
      id: 'id',
      numeric: true,
      disablePadding: true,
      label: 'Id',
    },
    {
      id: 'frequency',
      numeric: true,
      disablePadding: false,
      label: 'Frequency',
    },
    {
      id: 'filter_type',
      numeric: true,
      disablePadding: false,
      label: 'Filter Type',
    },
    {
      id: 'filter_value',
      numeric: true,
      disablePadding: false,
      label: 'Filter Value',
    },
    {
      id: 'magnitude_min magnitude_max',
      numeric: true,
      disablePadding: false,
      label: 'Magnitude Min Max',
    },
    {
      id: 'solar_time_after',
      numeric: true,
      disablePadding: false,
      label: 'Solar Time After',
    },
    {
      id: 'solar_time_before',
      numeric: true,
      disablePadding: false,
      label: 'Solar Time Before',
    },
    {
      id: 'magnitude_drop_min magnitude_drop_max',
      numeric: true,
      disablePadding: false,
      label: 'Magnitude Drop Min Max',
    },
    {
      id: 'event_duration',
      numeric: true,
      disablePadding: false,
      label: 'Event Duration',
    },
    {
      id: 'diameter_min iameter_max',
      numeric: true,
      disablePadding: false,
      label: 'Diameter Min Max',
    },
    /*{
      id: 'geo_location',
      numeric: true,
      disablePadding: false,
      label: 'Geo Location',
    },*/
    {
      id: 'altitude',
      numeric: true,
      disablePadding: false,
      label: 'Altitude',
    },
    {
      id: 'latitude',
      numeric: true,
      disablePadding: false,
      label: 'Latitude',
    },
    {
      id: 'longitude',
      numeric: true,
      disablePadding: false,
      label: 'Longitude',
    },
    {
      id: 'location_radius',
      numeric: true,
      disablePadding: false,
      label: 'Location Radius',
    },
  ];
  
  
  function EnhancedTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all desserts',
              }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align= 'center' //{headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
  
  EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };
  
  const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;
  
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Occultation predictions found
          </Typography>
        )}
  
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon onClick={(id) => handleRemove(id) }/>
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    );
  };

  
  const handleRemove = (id) => {
      //console.log(data)
      //console.log(subscriptionId)
      
    delSubscriptionInfo(id)
        .then((res) => {
          console.log('executando a funcao delSubscriptionInfo')
          console.log(res)
          // reload the current page
          window.location.reload()
        })
        .catch(function (error) {
          //setDelError(true)
        })
  }
  
  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };
  
  

   function EnhancedTable() {
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
  
    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    };
  
    const handleSelectAllClick = (event) => {
      if (event.target.checked) {
        const newSelecteds = input.map((n) => n.id);
        setSelected(newSelecteds);
        //
        return;
      }
      setSelected([]);
    };
  
    const handleClick = (event, name) => {
      const selectedIndex = selected.indexOf(name);
      let newSelected = [];
  
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, name);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1),
        );
      }
      setSelected(newSelected);

      //handleRemove(newSelected) /// funciona mas deleta ao selecionar e não na lixeira
    };
  
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    const handleChangeDense = (event) => {
      setDense(event.target.checked);
    };
  
    const isSelected = (name) => selected.indexOf(name) !== -1;
  
    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - input.length) : 0;
  
    

    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={input.length}
              />
              <TableBody>
                {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                   rows.slice().sort(getComparator(order, orderBy)) */}
                {stableSort(input, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.id);
                    const labelId = `enhanced-table-checkbox-${index}`;
                    //console.log(labelId)
                    return (
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id) }
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                         
                      >
                        <TableCell padding="checkbox">
                        <Tooltip title="Delete">
                            <IconButton>
                              <DeleteIcon onClick={() => handleRemove(row.id) }/>
                            </IconButton>
                        </Tooltip>
                        </TableCell>
                        <TableCell>
                          
                          <Tooltip title="Editar">
                          <Button >
                              {/*<EditIcon onClick={<SetEventFiltersResults/>}/>*/}
                              <SetEventFiltersResults id={row.id} subscriptionId={subscriptionId}/>
                              {/*{console.log(subscriptionId=row.id)}*/}
                            </Button>
                        {/*
                        <SetEventFiltersResults />
                            */}
                        </Tooltip>
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                        >
                          {row.filter_name}
                        </TableCell>
                        <TableCell align="center">{row.id}</TableCell>
                        <TableCell align="center">{row.frequency === 1 ? 'Monthly' : 'Weekly'}</TableCell>
                        <TableCell align="center">{row.filter_type}</TableCell>
                        <TableCell align="center" >{row.filter_value}</TableCell>
                        <TableCell  align="center">{row.magnitude_min} {row.magnitude_max}</TableCell>
                        {/*<TableCell align="right">{row.magnitude_max}</TableCell>*/}
                        <TableCell align="center">{row.local_solar_time_after}</TableCell>
                        <TableCell align="center">{row.local_solar_time_before}</TableCell>
                        <TableCell align="center">{row.magnitude_drop_min} {row.magnitude_drop_max}</TableCell>
                        {/*<TableCell align="right">{row.magnitude_drop_max}</TableCell>*/}
                        <TableCell align="center">{row.event_duration}</TableCell>
                        <TableCell align="center">{row.diameter_min} {row.diameter_max}</TableCell>
                        {/*<TableCell align="right">{row.diameter_max}</TableCell>*/}
                        {/*<TableCell align="right">{row.geo_location}</TableCell>*/}
                        <TableCell align="center">{row.altitude}</TableCell>
                        <TableCell align="center">{row.latitude}</TableCell>
                        <TableCell align="center">{row.longitude}</TableCell>
                        <TableCell align="center">{row.location_radius}</TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={input.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
        {/*<FormControlLabel
          control={<Switch checked={dense} onChange={handleChangeDense} />}
          label="Dense padding"
        />*/}
      </Box>
    );
  }
  /************************************** */


  const generate_filter_form = (filter) => {
    //console.log(filter)
    return (
      <Box component='form' noValidate autoComplete='off'>
          <Grid item xs={12} sx={{ display: 'inlineFlex' }}>
                <EnhancedTable/>
                
        </Grid>
      </Box>
    )
  }
  
  return (
    <Box>
          <Card  sx={{ mb: 2 }}>
            <CardContent>{generate_filter_form()}</CardContent>
            
          </Card>
    </Box>
  )
}

EventFiltersResults.defaultProps = {}

EventFiltersResults.propTypes = {
  subscriptionId: PropTypes.number.isRequired
}

export default EventFiltersResults
