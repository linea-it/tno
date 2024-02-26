import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import { DataGrid } from '@mui/x-data-grid'
import { PredictionEventsContext } from '../../contexts/PredictionContext'
import CustomPagination from '../CustomDataGrid/Pagination'
import { PredictionEventsColumns, predictionEventsColumnVisibilityModel } from './Columns'
import { listAllPredictionEvents } from '../../services/api/Occultation'
import CustomToolbar from '../CustomDataGrid/Toolbar'
import ResultsCount from './ResultsCount'

function PredictEventList() {
  const columns = PredictionEventsColumns
  const columnVisibilityModel = predictionEventsColumnVisibilityModel

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  const { paginationModel, sortModel, filters, search } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['predictionEvents', { paginationModel, sortModel, filters, search }],
    queryFn: listAllPredictionEvents,
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    staleTime: 5 * 60 * 60 * 1000
  })
  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowCountState, setRowCountState] = React.useState(data?.count || 0)

  React.useEffect(() => {
    setRowCountState((prevRowCountState) => (data?.count !== undefined ? data?.count : prevRowCountState))
  }, [data?.count, setRowCountState])

  return (
    <React.Fragment>
      <ResultsCount isLoading={isLoading} rowsCount={rowCountState} />
      <DataGrid
        sx={{ minHeight: '500px' }}
        disableColumnFilter
        disableRowSelectionOnClick
        getRowHeight={() => 75}
        pagination
        rows={data?.results !== undefined ? data.results : []}
        columns={columns}
        rowCount={rowCountState}
        loading={isLoading}
        pageSizeOptions={[25, 50, 100]}
        paginationModel={queryOptions.paginationModel}
        paginationMode='server'
        onPaginationModelChange={(paginationModel) => {
          setQueryOptions((prev) => {
            return {
              ...prev,
              paginationModel: { ...paginationModel }
            }
          })
        }}
        sortingMode='server'
        onSortModelChange={(sortModel) => {
          setQueryOptions((prev) => {
            return {
              ...prev,
              sortModel: [...sortModel]
            }
          })
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25
            }
          },
          sorting: {
            sortModel: queryOptions.sortModel
          },
          columns: {
            columnVisibilityModel: { ...columnVisibilityModel }
          }
        }}
        slots={{
          pagination: CustomPagination,
          toolbar: CustomToolbar
        }}
      />
    </React.Fragment>
  )
}

PredictEventList.defaultProps = {}

PredictEventList.propTypes = {}

export default PredictEventList
