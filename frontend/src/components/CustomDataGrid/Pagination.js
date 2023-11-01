import React from 'react';
import PropTypes from 'prop-types';
import {
  gridPageCountSelector,
  useGridApiContext,
  useGridSelector,
  GridPagination,
} from '@mui/x-data-grid';
import MuiPagination from '@mui/material/Pagination';

function Pagination({ page, count, rowsPerPage, onPageChange, className }) {
  // const apiRef = useGridApiContext();
  // const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  // console.log("pageCount ", pageCount)
  const pageCount = count < rowsPerPage ? 0 : Math.ceil(count / rowsPerPage);

  return (
    <MuiPagination
      color="primary"
      className={className}
      count={pageCount}
      page={page + 1}
      onChange={(event, newPage) => {
        onPageChange(event, newPage - 1);
      }}
    />
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  count: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  className: PropTypes.string
};

function CustomPagination(props) {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
}

export default CustomPagination;
