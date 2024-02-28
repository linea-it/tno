import React from 'react'
import { useQuery } from 'react-query'
import { DataGrid } from '@mui/x-data-grid'
import { getPredictionJobList } from '../../services/api/PredictJobs'
import { predictionJobsColumns } from './Columns'
import CustomPagination from '../../components/CustomDataGrid/Pagination'

function PredictonJobsHistory() {
  const initialOptions = {
    paginationModel: { page: 0, pageSize: 25 },
    selectionModel: [],
    sortModel: [{ field: 'id', sort: 'desc' }],
    filters: {}
  }

  const columns = predictionJobsColumns

  const [queryOptions, setQueryOptions] = React.useState(initialOptions)

  const { paginationModel, sortModel } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['predictionJobs', { paginationModel, sortModel }],
    queryFn: getPredictionJobList,
    keepPreviousData: true,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    staleTime: 5 * 60 * 60 * 1000
  })

  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowsCount, setRowsCount] = React.useState(data?.count || 0)

  React.useEffect(() => {
    setRowsCount((prevRowCountState) => (data?.count !== undefined ? data?.count : prevRowCountState))
  }, [data?.count, setRowsCount])

  const handlePagination = (paginationModel) => {
    setQueryOptions((prev) => {
      return {
        ...prev,
        paginationModel: { ...paginationModel }
      }
    })
  }

  const handleSort = (sortModel) => {
    setQueryOptions((prev) => {
      return {
        ...prev,
        sortModel: [...sortModel]
      }
    })
  }

  return (
    <React.Fragment>
      <DataGrid
        columns={columns}
        rows={data?.results !== undefined ? data.results : []}
        rowCount={rowsCount}
        loading={isLoading}
        disableColumnFilter
        disableRowSelectionOnClick
        paginationMode='server'
        pageSizeOptions={[25, 50, 100]}
        paginationModel={queryOptions.paginationModel}
        onPaginationModelChange={handlePagination}
        sortingMode='server'
        onSortModelChange={handleSort}
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
      />
    </React.Fragment>
  )
}

export default PredictonJobsHistory
