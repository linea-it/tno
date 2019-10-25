import React from 'react';
import PropTypes from 'prop-types';
import { TableHeaderRow } from '@devexpress/dx-react-grid-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  invisibleButton: {
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'rgb(85, 85, 85)',
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
    padding: 0,
    fontSize: '1rem',
    lineHeight: 1.75,
    fontHeight: 500,
    letterSpacing: '0.02857em',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
});

const TableHeaderRowCell = ({ ...restProps }) => (
  <TableHeaderRow.Cell
    {...restProps}
    style={{
      color: '#555555',
      fontSize: '1em',
    }}
  />
);

const SortingIcon = ({ direction }) => (direction === 'asc' ? (
  <ArrowUpward style={{ fontSize: '18px' }} />
) : (
  <ArrowDownward style={{ fontSize: '18px' }} />
));

const SortLabel = ({
  onSort, children, direction, ...restProps
}) => {
  const classes = useStyles();

  return (
    <Tooltip title={
      restProps.column.headerTooltip
        ? restProps.column.headerTooltip
        : children.props.children
    }
    >
      <span
        onClick={!restProps.disabled ? onSort : null}
        className={!restProps.disabled ? classes.invisibleButton : null}
        style={{ whiteSpace: `${restProps.column.hasLineBreak ? 'normal' : 'nowrap'}` }}
      >
        {children}
        {!restProps.disabled
          ? direction && <SortingIcon direction={direction} />
          : null}
      </span>
    </Tooltip>
  );
};

const CustomTableHeaderRowCell = (props) => (
  <TableHeaderRow
    cellComponent={TableHeaderRowCell}
    showSortingControls={!!props.hasSorting}
    sortLabelComponent={SortLabel}
  />
);

SortingIcon.propTypes = {
  direction: PropTypes.string.isRequired,
};

SortLabel.propTypes = {
  onSort: PropTypes.func.isRequired,
  children: PropTypes.shape({
    root: PropTypes.symbol,
    props: PropTypes.object,
    children: PropTypes.string,
  }).isRequired,
  direction: PropTypes.string,
};

SortLabel.defaultProps = {
  direction: null,
};

CustomTableHeaderRowCell.propTypes = {
  hasSorting: PropTypes.bool.isRequired,
};

export default CustomTableHeaderRowCell;
