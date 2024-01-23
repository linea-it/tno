import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { DataGrid } from '@mui/x-data-grid';
import { listAllAsteroidJobs } from '../../services/api/AsteroidJob';
import CustomToolbar from '../../components/CustomDataGrid/Toolbar'
import CustomPagination from '../../components/CustomDataGrid/Pagination';
import ColumnStatus from '../../components/Table/ColumnStatus';
import moment from 'moment';
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export function PredictionEventsDataGrid() {
const navigate = useNavigate()
  const columns = [
    {
        field: 'id',
        headerName: 'ID',
        description: 'Internal ID',
        headerAlign: 'center',
        align: 'center',
        width: 100,
        renderCell: (params) => (
            <Button onClick={() => navigate(`/dashboard/asteroid_job/${params.value}`)}>
                <InfoOutlinedIcon />
            </Button>
        ),

    },
    {
        field: 'status',
        headerName: 'Status',
        description: '',
        headerAlign: 'center',
        align: 'center',
        width: 100,
        renderCell: (params) => (
           <ColumnStatus status={params.value} />
        ),
        
    },
    {
        field: 'submit_time',
        headerName: 'Submit',
        description: '',
        width: 180,
        type: 'dateTime',
        valueGetter: ({ value }) => value && new Date(value),
        valueFormatter: (params) => {
          if (params.value == null) {
            return '';
          }
          return `${moment(params.value).utc().format('YYYY-MM-DD HH:mm:ss')}`;
        },
      },
      {
        field: 'start',
        headerName: 'Start',
        description: '',
        width: 180,
        type: 'dateTime',
        valueGetter: ({ value }) => value && new Date(value),
        valueFormatter: (params) => {
          if (params.value == null) {
            return '';
          }
          return `${moment(params.value).utc().format('YYYY-MM-DD HH:mm:ss')}`;
        },
      },
      {
        field: 'end',
        headerName: 'End',
        description: '',
        width: 180,
        type: 'dateTime',
        valueGetter: ({ value }) => value && new Date(value),
        valueFormatter: (params) => {
          if (params.value == null) {
            return '';
          }
          return `${moment(params.value).utc().format('YYYY-MM-DD HH:mm:ss')}`;
        },
      },     
      {
        field: 'exec_time',
        headerName: 'Exec Time',
        description: '',
        width: 80,
        type: 'string',
      },
      {
        field: 'asteroids_before',
        headerName: 'Before',
        description: '',
        type: 'number',
        headerAlign: 'center',
        align: 'center',
      },
      {
        field: 'asteroids_after',
        headerName: 'After',
        description: '',
        type: 'number',
        headerAlign: 'center',
        align: 'center',
      },  
      {
        field: 'error',
        headerName: 'Error',
        description: '',
        type: 'string',
      },                       
  ]
  const columnVisibilityModel = {
    id: true,
    status: true,
    submit_time: false,
    start: true,
    end: true,
    exec_time: true,
    asteroids_before: true,
    asteroids_after: true,
    error: true
  }

  const [queryOptions, setQueryOptions] = useState({
    paginationModel: { page: 0, pageSize: 25 },
    selectionModel: [],
    sortModel: [{ field: 'date_time', sort: 'asc' }],
    filters: {}
})

  const { paginationModel, sortModel, filters } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['asteroidJobs', { paginationModel, sortModel, filters }],
    queryFn: listAllAsteroidJobs,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false,
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
    <DataGrid
      sx={{minHeight: '700px'}}
      disableColumnFilter
      disableRowSelectionOnClick
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
  );

}

export default PredictionEventsDataGrid
