import {useContext} from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Typography } from '../../../../node_modules/@material-ui/core/index';
import { PredictionEventsContext } from '../../../contexts/PredictionContext';

function PredictionEventsFilter() {

    const {queryOptions, parseFilterOptions} = useContext(PredictionEventsContext)

    return (
        <Box>
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField 
                    id="date-start" 
                    label="Date Start" 
                    variant="outlined"
                    // defaultValue={'2023-10-18'} 
                    name="date_time_after"
                    value={queryOptions.filters.date_time_after}
                    // onChange={(event) => {
                    //     setFilterOptions(prev => { 
                    //         return {
                    //             ...prev,
                    //             date_time_start: event.target.value}
                    //     })
                    //   }}
                    onChange={parseFilterOptions}
                    />
                <TextField id="outlined-basic" label="Date End" variant="outlined" />
                <TextField id="outlined-basic" label="Filter Type" variant="outlined" />
                <TextField id="outlined-basic" label="Filter Value" variant="outlined" />
                <TextField id="outlined-basic" label="Magnitude" variant="outlined" />

            </Box>
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField id="outlined-basic" label="Latitude (deg)" variant="outlined" />
                <TextField id="outlined-basic" label="Longitude (deg)" variant="outlined" />
                <TextField id="outlined-basic" label="Radius (Km)" variant="outlined" />
            </Box>
            <Typography m={1} variant="body1">This is an experimental feature and may take some time to process. To prevent timeouts, we recommend using date and magnitude ranges that restrict the supplied list to a maximum of 200 objects. You can find this information in 'Total Occultation Predictions' after performing a search.</Typography>
        </Box>


    )
}

export default PredictionEventsFilter
