import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CustomPagination from '../../../components/CustomDataGrid/Pagination'
import { getUserEventFilters, userEventFilterDelete } from '../../../services/api/Newsletter'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

const FREQUENCY_MAP = { 1: 'Monthly', 2: 'Weekly', 3: 'Daily' }

function DeleteFilterActionItem({ deleteFilter, ...props }) {
  const [open, setOpen] = React.useState(false)

  return (
    <React.Fragment>
      <GridActionsCellItem {...props} onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Delete this filter?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { setOpen(false); deleteFilter() }} color='warning' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}

function MobileFilterCard({ filter, onEdit, onDelete }) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <Card variant='outlined'>
      <CardContent sx={{ pb: 1 }}>
        <Stack spacing={0.5}>
          <Stack direction='row' spacing={1} alignItems='center' justifyContent='space-between'>
            <Typography variant='subtitle2' fontWeight={500}>
              {filter.filter_name}
            </Typography>
            <Chip label={FREQUENCY_MAP[filter.frequency] || 'Unknown'} size='small' variant='outlined' />
          </Stack>
          {filter.description && (
            <Typography variant='body2' color='text.secondary'>
              {filter.description}
            </Typography>
          )}
        </Stack>
      </CardContent>
      <CardActions sx={{ pt: 0 }}>
        <Button size='small' startIcon={<EditIcon />} onClick={onEdit}>
          Edit
        </Button>
        <Button size='small' startIcon={<DeleteIcon />} color='error' onClick={() => setDeleteOpen(true)}>
          Delete
        </Button>
      </CardActions>
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Delete this filter?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={() => { setDeleteOpen(false); onDelete() }} color='warning' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default function UserEventFilters() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const initialOptions = {
    paginationModel: { page: 0, pageSize: 25 },
    selectionModel: [],
    sortModel: [{ field: 'id', sort: 'desc' }],
    filters: {},
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
    refetchOnReconnect: false,
  })

  const deleteFilter = useCallback(
    (id) => () => {
      userEventFilterDelete({ id }).then(() => refetch()).catch(() => {
        // Silencioso — filtro permanece na lista; opcional: mostrar toast de erro
      })
    },
    [refetch]
  )

  const handleEditClick = useCallback(
    (id) => () => navigate(`/event_filter_detail/${id}`),
    [navigate]
  )

  const columns = useMemo(
    () => [
      { field: 'filter_name', headerName: 'Name', width: 250 },
      {
        field: 'frequency',
        headerName: 'Frequency',
        width: 110,
        valueFormatter: (params) => FREQUENCY_MAP[params.value] || 'Unknown',
      },
      { field: 'description', headerName: 'Description', flex: 1 },
      {
        field: 'actions',
        type: 'actions',
        width: 80,
        getActions: (params) => [
          <GridActionsCellItem icon={<EditIcon />} label='Edit' onClick={handleEditClick(params.row.id)} key='edit' />,
          <DeleteFilterActionItem label='Delete' icon={<DeleteIcon />} deleteFilter={deleteFilter(params.id)} key='delete' />,
        ],
      },
    ],
    [deleteFilter, handleEditClick]
  )

  const [rowsCount, setRowsCount] = React.useState(data?.count || 0)

  React.useEffect(() => {
    setRowsCount((prev) => (data?.count !== undefined ? data?.count : prev))
  }, [data?.count])

  if (isLoading) {
    return <Skeleton height={200} animation='wave' />
  }

  if (!data?.results?.length) {
    return (
      <Typography variant='body2' color='text.secondary' sx={{ py: 4, textAlign: 'center' }}>
        No filters yet. Create one to start receiving email alerts.
      </Typography>
    )
  }

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {data.results.map((filter) => (
          <MobileFilterCard
            key={filter.id}
            filter={filter}
            onEdit={handleEditClick(filter.id)}
            onDelete={deleteFilter(filter.id)}
          />
        ))}
      </Stack>
    )
  }

  return (
    <DataGrid
      columns={columns}
      rows={data.results}
      rowCount={rowsCount}
      loading={isLoading}
      disableColumnFilter
      disableRowSelectionOnClick
      paginationMode='server'
      pageSizeOptions={[25, 50, 100]}
      paginationModel={queryOptions.paginationModel}
      onPaginationModelChange={(model) => setQueryOptions((prev) => ({ ...prev, paginationModel: { ...model } }))}
      sortingMode='server'
      onSortModelChange={(model) => setQueryOptions((prev) => ({ ...prev, sortModel: [...model] }))}
      initialState={{
        pagination: { paginationModel: queryOptions.paginationModel },
        sorting: { sortModel: queryOptions.sortModel },
      }}
      slots={{ pagination: CustomPagination }}
    />
  )
}

UserEventFilters.defaultProps = {}
UserEventFilters.propTypes = {}
