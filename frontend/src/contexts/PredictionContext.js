import { createContext, useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'

export const PredictionEventsContext = createContext({})
export function PredictionEventsProvider({ children }) {

    const [queryOptions, setQueryOptions] = useState({
        paginationModel: { page: 0, pageSize: 5 },
        selectionModel: [],
        sortModel: [{ field: 'date_time', sort: 'asc' }],
        // filterModel: { items: [] }
        filters: {
            date_time_after: '2023-10-18'
        }
    })

    // const [filterOptions, setFilterOptions] = useState({
    //     date_time_after: '2023-10-18'
    // })

    function parseFilterOptions(event) {
        console.log("parseFilterOptions:", event)

        // setFilterOptions(prev => { 
        //     const temp = {...prev}
        //     temp[event.target.name] = event.target.value
        //     return temp
        // })  
        setQueryOptions(prev => { 
            const temp = {...prev}
            const tempf = {...temp.filters}
            tempf[event.target.name] = event.target.value
            temp.filters = tempf
            console.log("TEMP:", temp)
            return temp
        }) 
        
    }

    return <PredictionEventsContext.Provider value={{
        queryOptions, setQueryOptions,
        parseFilterOptions
    }}>{children}</PredictionEventsContext.Provider>
}

PredictionEventsProvider.propTypes = {
    children: PropTypes.node
}


