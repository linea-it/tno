import React, { useContext, useMemo } from 'react'
import { useQuery } from 'react-query'
import { DataGrid } from '@mui/x-data-grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import CustomPagination from '../CustomDataGrid/Pagination'
import { PredictionEventsColumns, predictionEventsColumnVisibilityModel } from './Columns'
import { listAllPredictionEvents } from '../../services/api/Occultation'
import CustomToolbar from '../CustomDataGrid/Toolbar'
import ResultsCount from './ResultsCount'

const MOBILE_HIDDEN_COLUMNS = ['number', 'position_angle', 'velocity', 'delta', 'diameter', 'event_duration', 'magnitude_drop', 'long', 'off_ra', 'off_dec', 'loc_t', 'ra_target', 'dec_target', 'ra_target_deg', 'dec_target_deg', 'ra_star_candidate', 'dec_star_candidate', 'ra_star_deg', 'dec_star_deg', 'e_ra', 'e_dec', 'pmra', 'pmdec']

function PredictEventList() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const columns = PredictionEventsColumns
  const baseVisibility = predictionEventsColumnVisibilityModel
  const columnVisibilityModel = useMemo(
    () =>
      isMobile
        ? { ...baseVisibility, ...MOBILE_HIDDEN_COLUMNS.reduce((acc, f) => ({ ...acc, [f]: false }), {}) }
        : baseVisibility,
    [isMobile, baseVisibility]
  )

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  const { paginationModel, sortModel, filters, search } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['predictionEvents', { paginationModel, sortModel, filters, search }],
    queryFn: listAllPredictionEvents,
    keepPreviousData: false,
    refetchInterval: filters.geo ? 5000 : false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false
    // retry: 1,
    // staleTime: 5 * 60 * 60 * 1000
  })
  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowCountState, setRowCountState] = React.useState(data?.count || 0)

  React.useEffect(() => {
    setRowCountState((prevRowCountState) => (data?.count !== undefined ? data?.count : prevRowCountState))
  }, [data?.count, setRowCountState])

  return (
    <Box sx={{ width: '100%', minWidth: 0, overflow: 'auto' }}>
      <ResultsCount isLoading={isLoading} rowsCount={rowCountState} />
      <DataGrid
        columnVisibilityModel={columnVisibilityModel}
        sx={{
          minHeight: '500px',
          '& .MuiDataGrid-cell': { minHeight: 44 },
          '& .MuiDataGrid-columnHeaders': { minHeight: 48 }
        }}
        disableColumnFilter
        disableRowSelectionOnClick
        getRowHeight={() => 75}
        pagination
        rows={data?.results !== undefined ? data.results : []}
        columns={columns}
        rowCount={rowCountState}
        loading={isLoading}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={queryOptions.paginationModel}
        paginationMode='server'
        onPaginationModelChange={(paginationModel) => {
          setQueryOptions((prev) => ({
            ...prev,
            paginationModel: { ...paginationModel }
          }))
        }}
        sortingMode='server'
        onSortModelChange={(sortModel) => {
          setQueryOptions((prev) => ({
            ...prev,
            sortModel: [...sortModel]
          }))
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25
            }
          },
          sorting: {
            sortModel: queryOptions.sortModel
          }
        }}
        slots={{
          pagination: CustomPagination,
          toolbar: CustomToolbar
        }}
      />
    </Box>
  )
}

PredictEventList.defaultProps = {}

PredictEventList.propTypes = {}

export default PredictEventList
