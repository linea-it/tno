import { createContext, useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
export const PredictionEventsContext = createContext({})
export function PredictionEventsProvider({ children }) {

    const [queryOptions, setQueryOptions] = useState({
        paginationModel: { page: 0, pageSize: 25 },
        selectionModel: [],
        sortModel: [{ field: 'date_time', sort: 'asc' }],
        filters: {
            dt_after_local: dayjs(),
            date_time_after: dayjs().utc().format(),
            dt_before_local: null,
            date_time_before: null,
            filterType: 'base_dynclass',
            filterValue: undefined,
            maginitudeMax: 16,
            nightside: true,
            geo: false,
            latitude: undefined,
            longitude: undefined,
            radius: 100,
            jobid: undefined
        }
    })

    return <PredictionEventsContext.Provider value={{
        queryOptions, setQueryOptions
    }}>{children}</PredictionEventsContext.Provider>
}

PredictionEventsProvider.propTypes = {
    children: PropTypes.node
}
