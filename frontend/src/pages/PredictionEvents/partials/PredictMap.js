import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import Box from '@mui/material/Box'
import { useQuery } from 'react-query'
import { getOrCreatePredictionMap } from '../../../services/api/Occultation';
import moment from 'moment';



function PredictOccultationMap({ occultationId }) {

  const [force, setForce] = React.useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getOrCreatePredrictMap', { id: occultationId, force: force }],
    queryFn: getOrCreatePredictionMap,
    keepPreviousData: false,
    refetchInterval: false,
    refetchOnmount: false,
    refetchOnWindowFocus: false,
    onSuccess: () => { if (force === true) setForce(false) },
    staleTime: 1 * 60 * 1000,
  })

  const handleRefresh = () => {
    if (force === true) return
    if (isLoading === true) return
    setForce(true)
  }

  return (
    <Card sx={{ height: '100%'}}>
      <CardHeader
        title="Occultation Prediction Map"
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem', }}
        subheader={data !== undefined ? `Created ${moment(data.creation_time).fromNow()}` : ""}
        subheaderTypographyProps={{ variant: 'subtitle1', fontSize: '0.8rem', }}
        action={
          <>
            <IconButton
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              href={data?.url}
              target="_blank"
              disabled={!data}
            >
              <OpenInNewIcon />
            </IconButton>
          </>
        }
      />
      <CardContent
        display="flex"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box>
          <Box
            flex={1}
            display="flex"
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isLoading && (
              <Box
                display="flex"
                minHeight={250}
                alignItems="center"
                justifyContent="center"
                m="auto"
                flexDirection="column"
                alignSelf="center"
                flex={1}
              >
                <CircularProgress color="secondary" />
                <Typography variant="body2" mt={2}>
                  Creating map. This request may take a few seconds.
                </Typography>
              </Box>
            )}
            {isError && (
              <Stack sx={{ width: '100%' }}>
                <Alert variant="outlined" severity="error">
                  Sorry, map creation failed. Please try again and if the problem persists,
                  let us know via the helpdesk
                </Alert>
              </Stack>
            )}
            {data !== undefined && (
              <Box
                component="img"
                sx={{
                  maxWidth: '90%',
                  height: 'auto',
                }}
                alt=""
                src={data.url}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card >
  )
}
PredictOccultationMap.defaultProps = {

}

PredictOccultationMap.propTypes = {
  occultationId: PropTypes.number.isRequired,
};


export default PredictOccultationMap;
