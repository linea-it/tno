import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import CustomPagination from '../../../components/CustomDataGrid/Pagination'
import { getUserEventFilters, userEventFilterDelete } from '../../../services/api/Newsletter'
import Skeleton from '@mui/material/Skeleton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

function DeleteFilterActionItem({ deleteFilter, ...props }) {
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      <GridActionsCellItem {...props} onClick={() => setOpen(true)} />
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth='xs'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Delete this filter?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setOpen(false)
              deleteFilter()
            }}
            color='warning'
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

export default function UserEventFilters() {
  const navigate = useNavigate()
  const initialOptions = {
    paginationModel: { page: 0, pageSize: 25 },
    selectionModel: [],
    sortModel: [{ field: 'id', sort: 'desc' }],
    filters: {}
  }

  const [queryOptions, setQueryOptions] = useState(initialOptions)
  const { paginationModel, sortModel, filters, search } = queryOptions

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userEventFilters', { paginationModel, sortModel, filters, search }],
    queryFn: getUserEventFilters,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnmount: false,
    refetchOnReconnect: false
    // retry: 1,
    // staleTime: 5 * 60 * 60 * 1000
  })

  const deleteFilter = useCallback(
    (id) => () => {
      userEventFilterDelete({ id })
        .then(() => {
          refetch()
        })
        .catch(() => {
          console.log('Error deleting filter')
        })
    },
    [refetch]
  )
  const handleEditClick = useCallback(
    (id) => () => {
      navigate(`/event_filter_detail/${id}`)
    },
    [navigate]
  )
  const columns = useMemo(
    () => [
      {
        field: 'filter_name',
        headerName: 'Name',
        width: 250
      },
      {
        field: 'frequency',
        headerName: 'Frequency',
        width: 110,
        valueFormatter: (params) => {
          const frequencyMap = {
            1: 'Monthly',
            2: 'Weekly',
            3: 'Daily'
          }
          return frequencyMap[params.value] || 'Unknown'
        }
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1
      },
      {
        field: 'actions',
        type: 'actions',
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem icon={<EditIcon />} label='Edit' onClick={handleEditClick(params.row.id)} />,
          <DeleteFilterActionItem label='Delete' icon={<DeleteIcon />} deleteFilter={deleteFilter(params.id)} />
        ]
      }
    ],
    [deleteFilter, handleEditClick]
  )

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

  if (isLoading) {
    return (
      <Skeleton
        height={200}
        animation='wave'
        sx={{
          paddingTop: 0,
          paddingBotton: 0
        }}
      />
    )
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

UserEventFilters.defaultProps = {}
UserEventFilters.propTypes = {}
