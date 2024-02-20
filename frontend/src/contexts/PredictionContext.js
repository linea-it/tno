import { createContext, useState } from 'react'
import PropTypes from 'prop-types'
import dayjs from "dayjs"
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
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
        }
    };

    const [queryOptions, setQueryOptions] = useState(setInitialFilter())

    function clearFilter() {
        setQueryOptions(setInitialFilter())
    }

    return <PredictionEventsContext.Provider value={{
        queryOptions, setQueryOptions, clearFilter
    }}>{children}</PredictionEventsContext.Provider>
}

PredictionEventsProvider.propTypes = {
    children: PropTypes.node
}
