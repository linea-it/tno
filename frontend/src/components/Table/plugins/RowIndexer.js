import React from 'react';
import { Plugin, Getter } from '@devexpress/dx-react-core';

const getRowIndexes = ({ rows }) => {
  return new Map(rows.map((row, index) => [row, index]));
};

const getCellValue = ({ rowIndexes }) => (row, columnName) =>
  columnName === 'index' ? rowIndexes.get(row) + 1 : row[columnName];

const RowIndexer = () => {
  return (
    <Plugin>
      <Getter name="rowIndexes" computed={getRowIndexes} />
      <Getter name="getCellValue" computed={getCellValue} />
    </Plugin>
  );
};

export default RowIndexer;
