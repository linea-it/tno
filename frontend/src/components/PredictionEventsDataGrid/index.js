import React, { useContext } from 'react';
import { useQuery } from 'react-query';
import { DataGrid } from '@mui/x-data-grid';
// import { listAllPredictionEvents } from '../../../services/api/Occultation';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import { PredictionEventsContext } from '../../contexts/PredictionContext';
import CustomPagination from '../CustomDataGrid/Pagination';
import { PredictionEventsColumns, predictionEventsColumnVisibilityModel } from './Columns';
import { listAllPredictionEvents } from '../../services/api/Occultation';
import CircularProgress from '@mui/material/CircularProgress';
import CustomToolbar from '../CustomDataGrid/Toolbar';
export function PredictionEventsDataGrid() {

  const columns = PredictionEventsColumns
  const columnVisibilityModel = predictionEventsColumnVisibilityModel

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  const { paginationModel, sortModel, filters } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['predictionEvents', { paginationModel, sortModel, filters }],
    queryFn: listAllPredictionEvents,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    staleTime: 1 * 60 * 60 * 1000,
  })
  // Some API clients return undefined while loading
  // Following lines are here to prevent `rowCountState` from being undefined during the loading
  const [rowCountState, setRowCountState] = React.useState(
    data?.count || 0,
  );

  React.useEffect(() => {
    setRowCountState((prevRowCountState) =>
      data?.count !== undefined
        ? data?.count
        : prevRowCountState,
    );
  }, [data?.count, setRowCountState]);

  return (
    <Card>
    <CardHeader
      // title={`Total Occultation Predictions: {isLoading ? <CircularProgress color="inherit" size={20} /> : null}`}
      title={isLoading ? (<><span>Total Retrieved Records:</span> <CircularProgress size='1rem' /> </>): `Total Retrieved Records: ${rowCountState}`}
      titleTypographyProps={{ variant: 'h6', fontSize: '1rem', }}/>
    <CardContent sx={{minHeight: 500}}>
    <DataGrid
      sx={{minHeight: '500px'}}
      disableColumnFilter
      disableRowSelectionOnClick
      getRowHeight={() => 75} 
      // getRowHeight={() => 'auto'}
      // getEstimatedRowHeight={() => 48}
      pagination
      rows={data?.results !== undefined ? data.results : []}
      columns={columns}
      rowCount={rowCountState}
      loading={isLoading}
      pageSizeOptions={[25,50,100]}
      paginationModel={queryOptions.paginationModel}
      paginationMode="server"
      onPaginationModelChange={(paginationModel) => {
        setQueryOptions(prev => {
          return {
            ...prev,
            paginationModel: { ...paginationModel }
          }
        })
      }}
      sortingMode="server"
      onSortModelChange={(sortModel) => {
        setQueryOptions(prev => {
          return {
            ...prev,
            sortModel: [...sortModel]
          }
        })
      }}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 25,
          },
        },
        sorting: {
          sortModel: queryOptions.sortModel,
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
    </CardContent>
  </Card>    
  );

}

export default PredictionEventsDataGrid
