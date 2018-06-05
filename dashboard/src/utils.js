export function coordinateFormater(value) {
  const val = parseFloat(value);
  return val.toFixed(5);
}

// Format react bootstrap table v2 column width
export function formatColumnHeader(column) {
  const style = {};
  if ('width' in column) {
    style.width = column.width + 'px';
  }
  if ('align' in column) {
    style.textAlign = column.align;
  }
  return style;
}

// Format date to UTC
export function formatDateUTC(date) {
  const dt = new Date(date);
  return dt.toUTCString();
}
