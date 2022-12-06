import * as d3 from 'd3'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

function CalendarExecutedNight({ data }) {
  const [rows, setRows] = useState([])

  useEffect(() => {
    const exposures = data.map((row) => ({
      date: d3.timeDay(new Date(`${row.date} 00:00`)),
      value: row.executed,
      count: row.count
    }))

    setRows(exposures)
  }, [data])

  function drawCalendar(dateValues) {
    d3.selectAll('#executed-night-svg > *').remove()
    const svg = d3.select('#executed-night-svg')

    // Fix aferter update d3
    // https://observablehq.com/@d3/d3v6-migration-guide#group
    const years = d3.group(dateValues, (d) => d.date.getUTCFullYear())

    const cellSize = 15
    const height = 185

    const year = svg
      .selectAll('g')
      .data(years)
      .join('g')
      .attr('transform', (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`)

    year
      .append('text')
      .attr('x', -5)
      .attr('y', -5)
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'end')
      .text((d) => {
        if (d.key === 'NaN') {
          return moment(rows[0].date).format('YYYY')
        }
        return d.key
      })

    const formatDay = (d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]

    const formatMonth = d3.utcFormat('%b')

    const countDay = (d) => d.getUTCDay()

    const timeWeek = d3.utcSunday

    const colorFn = d3.scaleLinear().domain([0, 1, 2]).range(['#ebedf0', '#939497', '#212121'])

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
      .text(formatDay)

    year
      .append('g')
      .selectAll('rect')
      .data((d) => d[1])
      .join('rect')
      .attr('width', cellSize - 3)
      .attr('height', cellSize - 3)
      .attr('x', (d) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5)
      .attr('y', (d) => countDay(d.date) * cellSize + 0.5)
      .attr('fill', (d) => colorFn(d.value))
      .append('title')
      .text((d) => {
        let hoverText = ''

        switch (parseInt(d.value)) {
          case 0:
            hoverText = 'has no exposure'
            break
          case 1:
            hoverText = "has exposure(s), but it wasn't executed"
            break
          case 2:
            hoverText = `was executed and it has ${d.count} exposure(s)`
            break
          default:
            break
        }

        return `${moment(d.date).format('MMM Do YYYY')} ${hoverText}`
      })

    const month = year
      .append('g')
      .selectAll('g')
      .data(d3.range(12).map((i) => new Date(1995, i, 1)))
      .join('g')

    month
      .append('text')
      .attr('x', (d) => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
      .attr('y', -5)
      .attr('font-size', 11)
      .attr('fill', '#767676')

      .text(formatMonth)
  }

  useEffect(() => {
    drawCalendar(rows)
    const svg = document.getElementById('executed-night-svg')

    // Get the bounds of the SVG content
    const bbox = svg.getBBox()
    // Update the viewBox (to maintain it responsive) using the size of the contents
    const width = bbox.x + bbox.width + bbox.x
    const height = bbox.y + bbox.height + bbox.y
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  }, [rows])

  return (
    <div>
      <svg id='executed-night-svg' />
    </div>
  )
}

CalendarExecutedNight.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default CalendarExecutedNight
