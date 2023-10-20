import React, { useContext, useState } from 'react';
import { useQuery } from 'react-query';
import PropTypes from 'prop-types';
import { DataGrid } from '@mui/x-data-grid';
import  { PredictionEventsColumns, predictionEventsColumnVisibilityModel }  from './Columns';
import { listAllPredictionEvents } from '../../../services/api/Occultation';
import CustomToolbar from '../../../components/CustomDataGrid/Toolbar';
import CustomPagination from '../../../components/CustomDataGrid/Pagination';
import { PredictionEventsContext } from '../../../contexts/PredictionContext';

export function PredictionEventsDataGrid() {
  
  const columns = PredictionEventsColumns
  const columnVisibilityModel = predictionEventsColumnVisibilityModel

  const { queryOptions, setQueryOptions } = useContext(PredictionEventsContext)

  const { paginationModel, sortModel, filters } = queryOptions

  const { data, isLoading } = useQuery({
    queryKey: ['predictionEvents', { paginationModel, sortModel, filters }],
    queryFn: listAllPredictionEvents ,
    keepPreviousData: true,
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
    <DataGrid
      disableColumnFilter 
      disableRowSelectionOnClick
      // getRowHeight={() => '200'} 
      getRowHeight={() => 'auto'} 
      // getEstimatedRowHeight={() => 200}
      pagination
      rows={data?.results !== undefined ? data.results : []}
      columns={columns}
      rowCount={rowCountState}
      loading={isLoading}
      pageSizeOptions={[100]}
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
      // filterMode="server"
      // onFilterModelChange={(filterModel) => {
      //   // console.log("FilterModel: ", filterModel)
      //   setQueryOptions(prev => {
      //     return {
      //       ...prev,
      //       paginationModel: {
      //         ...prev.paginationModel,
      //         page: 0,
      //       },
      //       filterModel: { ...filterModel }
      //     }
      //   })
      // }}


      // onCellKeyDown={onCellKeyDown}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 100,
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
        // toolbar: CustomToolbar,
        pagination: CustomPagination,
      }}
    />
  );

}

export default PredictionEventsDataGrid
