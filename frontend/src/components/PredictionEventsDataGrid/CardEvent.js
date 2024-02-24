import React from "react";
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import moment from 'moment';
import Stack from '@mui/material/Stack';
import StarBorderPurple500Icon from '@mui/icons-material/StarBorderPurple500';
import { blue } from '@mui/material/colors';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

function PredictEventCard({ data }) {


  const getDisplayName = (name, number) => {
    return number !== null ? `${name} (${number})` : `${name}`
  }

  const formatDateTime = (value) => {
    return `${moment(value).utc().format('YYYY-MM-DD HH:mm:ss')}`;
  }

  const starMag = (value) => {
    return (
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        sx={{
          color: blue[400],
          lineHeight: 1.5,
          fontSize: "0.75rem",
          fontFamily: "Public Sans, sans-serif",
          fontWeight: 400,
          gap: 1
        }} >
        <StarBorderPurple500Icon fontSize="small" />
        {`G (Gaia) ${value.toFixed(3)}`}
      </Stack >
    )
  }

  const handleShare = () => {
    // const url = getDetailUrl();
    // TODO: Copiar a url para area de transferencia e avisar.
  }
  const getDetailUrl = () => {
    return `/prediction-event-detail/${data.id}`
  }

  return (
    <Card sx={{ display: 'flex', height: 170 }}>
      <CardMedia
        sx={{
          width: 250,
        }}
        image={data?.map_url}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', width: "100%" }}>
        <CardHeader
          sx={{
            pb: 0,
          }}
          title={getDisplayName(data.name, data.number)}
          titleTypographyProps={{ variant: "body1" }}
          subheader={formatDateTime(data.date_time)}
          subheaderTypographyProps={{ variant: "body2" }}
        />
        <CardContent sx={{ flex: '1 0 auto', pt: 1 }} >
          <Chip label={data.dynclass} color="info" size="small"></Chip>
          <Stack spacing={1} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2}>
              {starMag(data.g_star)}
            </Stack>
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              spacing={1}
            >
              <Button size="small" onClick={handleShare} disabled={true} >Share</Button>
              <Button size="small" href={getDetailUrl()} target="_blank">More</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Box>

    </Card >
  );
}

PredictEventCard.propTypes = {
  data: PropTypes.object.isRequired
};

export default PredictEventCard
