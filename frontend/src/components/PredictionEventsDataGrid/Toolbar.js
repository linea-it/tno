import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import SearchAsteroid from '../SearchAsteroid'
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { PredictionEventsContext } from '../../contexts/PredictionContext';


function PredictEventToolbar() {

  const { viewLayoyt, setViewLayoyt, isMobile } = useContext(PredictionEventsContext)

  const handleChangeLayout = (e, value) => {
    if (value !== null) {
      setViewLayoyt(value)
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        spacing={2}
      >
        <SearchAsteroid />
        <Box sx={{ flex: 1 }} />
        {/* <ColorButton endIcon={<FilterListIcon />}>
          Filter
        </ColorButton>
        <ColorButton endIcon={<ExpandMoreIcon />}>
          Sort By: C/A Instant
        </ColorButton> */}
        {!isMobile && (
          <ToggleButtonGroup
            value={viewLayoyt}
            onChange={handleChangeLayout}
            exclusive
            aria-label="view-layout"
          >
            <ToggleButton value="list" aria-label="list-layout">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid-layout">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        )}
      </Stack>
    </Box >
  );
}

PredictEventToolbar.defaultProps = {}

PredictEventToolbar.propTypes = {};

export default PredictEventToolbar
