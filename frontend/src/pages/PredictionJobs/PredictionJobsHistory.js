import React from 'react'
import { useQuery } from 'react-query'
import { DataGrid } from '@mui/x-data-grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { getPredictionJobList } from '../../services/api/PredictJobs'
import { predictionJobsColumns } from './Columns'
import CustomPagination from '../../components/CustomDataGrid/Pagination'

const MOBILE_HIDDEN_COLUMNS = [
  'count_asteroids_with_occ',
  'count_success',
  'count_failures',
  'avg_exec_time',
  'owner'
]

function PredictonJobsHistory() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const initialOptions = {
    paginationModel: { page: 0, pageSize: 25 },
    selectionModel: [],
    sortModel: [{ field: 'id', sort: 'desc' }],
    filters: {}
  }

  const columns = predictionJobsColumns

  const [queryOptions, setQueryOptions] = React.useState(initialOptions)

  const { paginationModel, sortModel } = queryOptions

  const columnVisibilityModel = React.useMemo(
    () =>
      isMobile
        ? MOBILE_HIDDEN_COLUMNS.reduce((acc, field) => ({ ...acc, [field]: false }), {})
        : {},
    [isMobile]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['predictionJobs', { paginationModel, sortModel }],
    queryFn: getPredictionJobList,
    keepPreviousData: true,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 60 * 1000
  })

  const [rowsCount, setRowsCount] = React.useState(data?.count || 0)

  React.useEffect(() => {
    setRowsCount((prevRowCountState) => (data?.count !== undefined ? data?.count : prevRowCountState))
  }, [data?.count, setRowsCount])

  const handlePagination = (paginationModel) => {
    setQueryOptions((prev) => ({
      ...prev,
      paginationModel: { ...paginationModel }
    }))
  }

  const handleSort = (sortModel) => {
    setQueryOptions((prev) => ({
      ...prev,
      sortModel: [...sortModel]
    }))
  }

  return (
    <Box sx={{ width: '100%', minWidth: 0, overflow: 'auto', '& .MuiDataGrid-root': { border: 'none' }, '& .MuiDataGrid-cell': { minHeight: 44 } }}>
      <DataGrid
        columns={columns}
        rows={data?.results !== undefined ? data.results : []}
        rowCount={rowsCount}
        loading={isLoading}
        disableColumnFilter
        disableRowSelectionOnClick
        paginationMode='server'
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={queryOptions.paginationModel}
        onPaginationModelChange={handlePagination}
        sortingMode='server'
        onSortModelChange={handleSort}
        columnVisibilityModel={columnVisibilityModel}
        initialState={{
          pagination: {
            paginationModel: queryOptions.paginationModel
          },
          sorting: {
            sortModel: queryOptions.sortModel
          }
        }}
        slots={{
          pagination: CustomPagination
        }}
        sx={{
          minHeight: 400,
          '& .MuiDataGrid-columnHeaders': { minHeight: 48 },
          '& .MuiDataGrid-cell': { py: 1 }
        }}
      />
    </Box>
  )
}

export default PredictonJobsHistory
