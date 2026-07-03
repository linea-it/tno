import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'react-query'
import { Box, Card, Stack, Tab, Tabs, Typography } from '@mui/material'
import { getOccultationPaths } from '../../../../services/api/Occultation'
import OccultationMapDownload from '../../../../components/OccultationMap/OccultationMapDownload'
import DownloadKMZButton from '../../../../components/OccultationMap/OccultationKmzDownload'
import styles from './styles'
import { useEndpointOccultationGeometry } from './useEndpointOccultationGeometry'
import MapStatusPanel from './MapStatusPanel'
import Map2DView from './Map2DView'
import Globe3DView from './Globe3DView'

const TAB_2D = 0
const TAB_3D = 1

const PredictOccultationMap = ({ occultationId, event = null }) => {
  const [force, setForce] = useState(false)
  const [activeTab, setActiveTab] = useState(TAB_2D)
  const classes = styles()

  const {
    data,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['getOccultationPaths', { id: occultationId, force }],
    queryFn: getOccultationPaths,
    refetchOnWindowFocus: false,
    onSuccess: () => setForce(false),
  })

  const { geometry, interactive } = useEndpointOccultationGeometry(data, event)

  const status = isFetching && !data
    ? 'loading'
    : isError
      ? 'query-error'
      : geometry.status

  const statusError = isError
    ? error?.message || 'Erro ao carregar caminhos da ocultacao'
    : geometry.error

  const isReady = status === 'ready'

  const handleTabChange = (_, value) => {
    setActiveTab(value)
  }

  return (
    <Card>
      <Box sx={{ px: { xs: 1, sm: 1.5 }, pt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant='fullWidth'
          sx={{ mb: 1 }}
        >
          <Tab label='Interactive Map' />
          <Tab label='Globe View' />
        </Tabs>
      </Box>

      <Box sx={{ px: { xs: 1, sm: 1.5 }, pb: 1 }}>
        {status !== 'ready' && (
          <MapStatusPanel
            status={status}
            error={statusError}
            onRetry={() => refetch()}
          />
        )}

        {isReady && (
          <>
            {/* Condicional real — Leaflet não sobrevive a display:none (container 0×0
                causa NaN nas projeções internas). Recriar o mapa na troca de tab é
                aceitável e muito mais seguro. */}
            {activeTab === TAB_2D && (
              <Map2DView
                className={classes.map}
                geometry={geometry}
                interactive={interactive}
              />
            )}

            {activeTab === TAB_3D && (
              <Globe3DView
                className={classes.globe}
                geometry={geometry}
                interactive={interactive}
              />
            )}
          </>
        )}

        {isReady && geometry.warning && (
          <Typography variant='body2' color='warning.main' sx={{ mt: 1, px: 0.5 }}>
            {geometry.warning}
          </Typography>
        )}

        {isReady && geometry.warnings?.length > 0 && (
          <MapStatusPanel status='ready' warnings={geometry.warnings} />
        )}

        {isReady && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'space-between',
              alignItems: 'stretch',
              padding: '6px',
              mt: 1,
            }}
          >
            <Stack sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: 0, maxWidth: { xs: '100%', sm: '200px' } }}>
              <DownloadKMZButton
                id={occultationId}
                mapCenter={geometry.mapCenter}
                diameter={geometry.diameter}
                lineCenter={geometry.paths.lineCenter}
                centralPathSteps={geometry.paths.centralPathSteps}
                bodyUpper={geometry.paths.bodyUpper}
                bodyLower={geometry.paths.bodyLower}
                uncertaintyUpper={geometry.paths.uncertaintyUpper}
                uncertaintyLower={geometry.paths.uncertaintyLower}
                warning={geometry.warning}
              />
            </Stack>

            <Stack sx={{ flex: { xs: '1 1 100%', sm: 1 }, minWidth: 0, maxWidth: { xs: '100%', sm: '200px' } }}>
              <OccultationMapDownload occultationId={occultationId} />
            </Stack>
          </Box>
        )}
      </Box>
    </Card>
  )
}

PredictOccultationMap.propTypes = {
  occultationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  event: PropTypes.object,
}

export default PredictOccultationMap
