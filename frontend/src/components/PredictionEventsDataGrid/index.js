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
import Typography from '@mui/material/Typography';
import CustomToolbar from '../CustomDataGrid/Toolbar';
import CircularProgress from '@mui/material/CircularProgress';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack'
import PredictEventList from './EventsList'
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Toolbar from '@mui/material/Toolbar';
import PredictEventToolbar from './Toolbar';


export function PredictionEventsDataGrid() {

  const columns = PredictionEventsColumns
  const columnVisibilityModel = predictionEventsColumnVisibilityModel

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  const { paginationModel, sortModel, filters, search } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['predictionEvents', { paginationModel, sortModel, filters, search }],
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


  function onChangePage(page) {
    console.log("onChangePage: %o", page)
    console.log("isLoading: %o", isLoading)
    // if (!this.state.isLoading) {
    // setQueryOptions(prev => {
    //   return {
    //     ...prev,
    //     paginationModel: {
    //       ...paginationModel,
    //       page: page
    //     }
    //   }
    // })
    // }
  }
  const device = "computer"
  return (
    <Card>
      <CardContent sx={{ minHeight: 500 }}>
        <PredictEventToolbar />

        <Stack
          direction="row"
          spacing={1}
        >
          {isLoading ? (
            <CircularProgress size='1rem' />
          ) : (
            <Typography
              variant="body2"
              sx={{ mb: 2 }}
              color="text.secondary">
              {rowCountState}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{ mb: 2 }}
            color="text.secondary">
            Occultation predictions found.
          </Typography>

        </Stack>
        {device === "computer" && (
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
        )}
        {device === "phone" && (
          <PredictEventList rows={data?.results !== undefined ? data.results : []} count={rowCountState} loadMore={onChangePage} />
        )}
      </CardContent>
    </Card>
  );

}

export default PredictionEventsDataGrid
