
import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid'
import PredictEventCard from './CardEvent'
import InfiniteScroll from "react-infinite-scroller";

function PredictEventList({ rows, count, loadMore }) {


  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={loadMore}
      hasMore={true}
      loader={
        <div className="loader" key="loader">
          Loading ...
        </div>
      }
    >
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        spacing={2}
      >
        {
          rows.map(row => (
            <Grid item sm={12} md={4} key={row.id}>
              <PredictEventCard data={row} />
            </Grid>
          ))
        }
      </Grid>
    </InfiniteScroll>
  );
}

PredictEventList.defaultProps = {
  rows: [],
  count: 0,
  pageStart: 0
}

PredictEventList.propTypes = {
  count: PropTypes.number.isRequired,
  pageStart: PropTypes.number,
  rows: PropTypes.array.isRequired
};

export default PredictEventList
