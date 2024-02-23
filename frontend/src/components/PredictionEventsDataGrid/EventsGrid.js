import React, { useState, useContext } from 'react';
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import PredictEventCard from './CardEvent'
import Observer from '@researchgate/react-intersection-observer';
import { useInfiniteQuery } from 'react-query'
import { PredictionEventsContext } from '../../contexts/PredictionContext';
import { allPredictionEventsByCursor } from '../../services/api/Occultation';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import ResultsCount from './ResultsCount';
// https://researchgate.github.io/react-intersection-observer/?path=/story/recipes--higher-order-component
// https://github.com/researchgate/react-intersection-observer/blob/master/docs/docs/components/WindowRoot/WindowRoot.js
function PredictEventGrid() {

  const [visible, setVisible] = useState(false);
  const { queryOptions } = useContext(PredictionEventsContext)
  const { sortModel, filters, search } = queryOptions

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    status,
    error
  } = useInfiniteQuery({
    queryKey: ['predictionEvents', { sortModel, filters, search }],
    queryFn: async ({
      pageParam = 0,
      qo = queryOptions,
    }) => { return allPredictionEventsByCursor(qo, pageParam) },
    getPreviousPageParam: (firstPage) => {
      return firstPage.previous ?? undefined
    },
    getNextPageParam: (lastPage) => {
      return lastPage.next ?? undefined
    },
    keepPreviousData: true,
    refetchInterval: false,
    refetchOnmount: false,
    // retry: 1,
    staleTime: 5 * 60 * 1000,
    // staleTime: 1 * 60 * 60 * 1000,
    // onError: () => { setErrorIsOpen(true) }
  })


  function handleIntersection(event) {
    setVisible(event.isIntersecting ? true : false)
  }

  React.useEffect(() => {
    if (visible && !isLoading) {
      fetchNextPage()
    }
  }, [visible, fetchNextPage, isLoading])

  const loadingPlaceHolder = (message) => {
    return (
      <React.Fragment>
        <Grid container spacing={2} >
          <Grid item xs={12}>
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={1}
            >
              <CircularProgress size='1rem' />
              <Typography
                variant="body2"
                sx={{ mb: 2 }}
                color="text.secondary">
                {message}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" width={"100%"} height={250} />
          </Grid>
        </Grid >
      </React.Fragment>
    )
  }

  const noMoreEntries = () => {
    return (
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
      >
        <Typography
          variant="body2"
          color="text.secondary">
          No further entries available.
        </Typography>
      </Stack>
    )
  }

  return (
    <Box>
      <ResultsCount isLoading={isLoading} rowsCount={data?.pages[0].count} />
      <Grid container spacing={2} mb={2} sx={{ minWidth: 360 }}>
        <Grid item xs={12}>
          {isLoading
            ? (loadingPlaceHolder())
            : status === 'error'
            && (<Alert severity="error">{error.message}</Alert>)}
        </Grid>
        {data?.pages.map((page, idx) => (
          <React.Fragment key={`${idx}-page`}>
            {page.results.map((row, idx) => (
              <Grid key={`${idx}-${row.name}-${row.id}`} item
                xs={12}
                md={6}
                lg={4}
              >
                <PredictEventCard data={row} />
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
      <Observer onChange={handleIntersection}>
        <Box sx={{ height: 300 }}>
          {isFetchingNextPage
            ? (loadingPlaceHolder('Loading more...'))
            : hasNextPage
              ? (<></>)
              : noMoreEntries()
          }
        </Box>
      </Observer>
    </Box>
  );
}

PredictEventGrid.defaultProps = {}

PredictEventGrid.propTypes = {};

export default PredictEventGrid
