import { createContext, useState } from 'react'
import PropTypes from 'prop-types'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import useBreakpoint from '../hooks/useBreakpoint'
dayjs.extend(utc)
dayjs.extend(timezone)
export const PredictionEventsContext = createContext({})
export function PredictionEventsProvider({ children }) {
  function setInitialFilter() {
    return {
      paginationModel: { page: 0, pageSize: 25 },
      selectionModel: [],
      sortModel: [{ field: 'date_time', sort: 'asc' }],
      filters: {
        dt_after_local: dayjs(),
        date_time_after: dayjs().utc().format(),
        dt_before_local: null,
        date_time_before: null,
        filterType: '',
        filterValue: undefined,
        maginitudeMax: 15,
        solar_time_enabled: true,
        solar_time_after: dayjs().set('hour', 18).startOf('hour'),
        solar_time_before: dayjs().set('hour', 6).startOf('hour'),
        nightside: true,
        maginitudeDropMin: undefined,
        diameterMin: undefined,
        diameterMax: undefined,
        closestApproachUncertainty: undefined,
        eventDurationMin: undefined,
        geo: false,
        latitude: undefined,
        longitude: undefined,
        radius: 100,
        jobid: undefined
      },
      search: undefined
    }
  }

  const [queryOptions, setQueryOptions] = useState(setInitialFilter())

  const currentBreakpoint = useBreakpoint()
  const isMobile = ['xs', 'sm', 'md'].indexOf(currentBreakpoint.getBreakPointName()) !== -1 ? true : false
  // console.log("isMobile: %o", isMobile)

  // list ou grid
  const [viewLayoyt, setViewLayoyt] = useState(isMobile ? 'grid' : 'list')

  function clearFilter() {
    setQueryOptions(setInitialFilter())
  }

  return (
    <PredictionEventsContext.Provider
      value={{
        queryOptions,
        setQueryOptions,
        clearFilter,
        viewLayoyt,
        setViewLayoyt,
        isMobile
      }}
    >
      {children}
    </PredictionEventsContext.Provider>
  )
}

PredictionEventsProvider.propTypes = {
  children: PropTypes.node
}
