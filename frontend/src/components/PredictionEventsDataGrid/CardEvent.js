import React, { useState } from "react";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import moment from 'moment';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import Stack from '@mui/material/Stack';
import StarIcon from '@mui/icons-material/Star';
import StarBorderPurple500Icon from '@mui/icons-material/StarBorderPurple500';
import { blueGrey, blue } from '@mui/material/colors';
import NightlightIcon from '@mui/icons-material/Nightlight';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import Chip from '@mui/material/Chip';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';

function PredictEventCard({ data }) {


  const getDisplayName = (name, number) => {
    return number !== null ? `${name} (${number})` : `${name}`
  }

  const formatDateTime = (value) => {
    return `${moment(value).utc().format('YYYY-MM-DD HH:mm:ss')}`;
  }

  // const formatStarCoord = (ra, dec) => {
  //   return `${ra} ${dec}`
  // }
  const starMag = (value) => {
    return (
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{
          color: blueGrey[200],
          lineHeight: 1.5,
          fontSize: "0.75rem",
          fontFamily: "Public Sans, sans-serif",
          fontWeight: 400,
          gap: 1
        }} >
        <StarBorderPurple500Icon fontSize="small" />
        {`G* ${value}`}
      </Stack >
    )
  }

  const nighttime = (value) => {
    return (
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{
          color: blueGrey[200],
          lineHeight: 1.5,
          fontSize: "0.75rem",
          fontFamily: "Public Sans, sans-serif",
          fontWeight: 400,
          gap: 1
        }} >

        {value === true && (
          <>
            <NightlightIcon fontSize="small" />
            Nighttime
          </>
        )}
        {value === false && (
          <>
            <WbSunnyIcon fontSize="small" />
            Daytime
          </>
        )}
      </Stack >
    )
  }

  return (
    <Card sx={{ display: 'flex' }}>
      <CardMedia
        sx={{ width: 130, height: 130 }}
        image={data?.map_url}
      // alt="Paella dish"
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardHeader sx={{ width: '100%', pb: 0 }}
          title={getDisplayName(data.name, data.number)}
          titleTypographyProps={{ variant: "body1" }}
          subheader={formatDateTime(data.date_time)}
          subheaderTypographyProps={{ variant: "body2" }}
          action={
            <IconButton aria-label="settings">
              <ShareIcon />
            </IconButton>
          }
        />
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="body2" color={blue[300]} sx={{ pb: 1 }}>
            {data.dynclass}
          </Typography>
          <Stack spacing={1}>
            {/* <Chip label={data.dynclass} color="info" size="small"></Chip> */}
            <Stack direction="row" spacing={1} useFlexGap>
              {starMag(data.g_star)}
              {nighttime(data.occ_path_coeff.nightside)}
            </Stack>
            {/* <Stack direction="row" spacing={1}>
              {starMag(data.g_star)}
              {starMag(data.g_star)}
            </Stack> */}
          </Stack>
          {/* <Typography component="div" variant="body2">
            {getDisplayName(data.name, data.number)}
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            {formatDateTime(data.date_time)}
          </Typography> */}
          {/* <Typography variant="body2" component="div">
            {formatStarCoord(data.ra_star_candidate, data.dec_star_candidate)}
          </Typography> */}
        </CardContent>
        <CardActions>
          <Button size="small">Share</Button>
          <Button size="small">More</Button>
        </CardActions>
      </Box>

    </Card >
  );
}

PredictEventCard.propTypes = {
  data: PropTypes.object.isRequired
};

export default PredictEventCard
