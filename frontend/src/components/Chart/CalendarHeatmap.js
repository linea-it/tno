import * as d3 from 'd3';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import useStyles from './styles';

function CalendarHeatmap({ data }) {
  const classes = useStyles();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      data.map((row) => ({
        date: d3.timeDay(new Date(`${row.date} 00:00`)),
        value: row.count,
      }))
    );
  }, [data]);

  function drawCalendar(dateValues) {
    d3.selectAll('#heatmap-svg > *').remove();
    const svg = d3.select('#heatmap-svg');

    const years = d3
      .nest()
      .key((d) => d.date.getUTCFullYear())
      .entries(dateValues)
      .reverse();

    const values = dateValues.map((c) => c.value);
    const maxValue = d3.max(values);
    const minValue = d3.min(values);

    const cellSize = 15;
    const height = 185;

    const year = svg
      .selectAll('g')
      .data(years)
      .join('g')
      .attr(
        'transform',
        (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`
      );

    year
      .append('text')
      .attr('x', -5)
      .attr('y', -5)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end')
      .text((d) => {
        if (d.key === 'NaN') {
          return moment(rows[0].date).format('YYYY');
        }
        return d.key;
      });

    const formatDay = (d) =>
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()];

    const formatMonth = d3.utcFormat('%b');

    const countDay = (d) => d.getUTCDay();

    const timeWeek = d3.utcSunday;

    const colorFn = d3
      .scaleSequential(d3.interpolateGreens)
      .domain([Math.floor(minValue), Math.ceil(maxValue)]);

    year
      .append('g')
      .attr('text-anchor', 'end')
      .selectAll('text')
      .data(d3.range(7).map((i) => new Date(1995, 0, i)))
      .join('text')
      .attr('font-size', 10)
      .attr('fill', '#767676')
      .attr('x', -5)
      .attr('y', (d) => (countDay(d) + 0.5) * cellSize)
      .attr('dy', '0.31em')
      .text(formatDay);

    year
      .append('g')
      .selectAll('rect')
      .data((d) => d.values)
      .join('rect')
      .attr('width', cellSize - 3)
      .attr('height', cellSize - 3)
      .attr(
        'x',
        (d) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5
      )
      .attr('y', (d) => countDay(d.date) * cellSize + 0.5)
      .attr('fill', (d) => {
        if (d.value === 0) {
          return '#ebedf0';
        }
        return colorFn(d.value);
      })
      .append('title')
      .text(
        (d) => `${d.value} exposures on ${moment(d.date).format('MMM Do YYYY')}`
      );

    const month = year
      .append('g')
      .selectAll('g')
      .data(d3.range(12).map((i) => new Date(1995, i, 1)))
      .join('g');

    month
      .append('text')
      .attr(
        'x',
        (d) => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2
      )
      .attr('y', -5)
      .attr('font-size', 11)
      .attr('fill', '#767676')

      .text(formatMonth);
  }

  useEffect(() => {
    drawCalendar(rows);

    const svg = document.getElementById('heatmap-svg');

    // Get the bounds of the SVG content
    const bbox = svg.getBBox();
    // Update the viewBox (to maintain it responsive) using the size of the contents
    const width = bbox.x + bbox.width + bbox.x;
    const height = bbox.y + bbox.height + bbox.y;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }, [rows]);

  return (
    <div>
      <svg id="heatmap-svg" />
      <div
        className={classes.legendWrapper}
        title="A summary of exposures by date."
      >
        Less
        <ul className={classes.legend}>
          <li
            className={classes.legendItem}
            style={{ backgroundColor: '#ebedf0' }}
          />
          <li
            className={classes.legendItem}
            style={{ backgroundColor: '#c6e48b' }}
          />
          <li
            className={classes.legendItem}
            style={{ backgroundColor: '#7bc96f' }}
          />
          <li
            className={classes.legendItem}
            style={{ backgroundColor: '#239a3b' }}
          />
          <li
            className={classes.legendItem}
            style={{ backgroundColor: '#196127' }}
          />
        </ul>
        More
      </div>
    </div>
  );
}

CalendarHeatmap.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CalendarHeatmap;
