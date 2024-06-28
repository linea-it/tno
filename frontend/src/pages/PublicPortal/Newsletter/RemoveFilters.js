import { useQuery } from 'react-query'
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { CardHeader } from '@mui/material'
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete'
import { getSubscriptionInfo, delSubscriptionInfo,  listPreferenceEventFilters } from '../../../services/api/Newsletter'
import { data } from '../../../../node_modules/browserslist/index'

export default function RemoveFilters({ subscriptionId }) {
    const { id } = useParams()
    const [info, setInfo] = useState({ id: undefined })
    const [delError, setDelError] = useState(false)
/*
    const { data, isLoading } = useQuery({
        queryKey: ['preferenceEventFilters', { subscriptionId: subscriptionId }],
        queryFn: listPreferenceEventFilters,
        keepPreviousData: true,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnmount: false,
        refetchOnReconnect: false
        // retry: 1,
        // staleTime: 1 * 60 * 60 * 1000
      })

      useEffect(() => {
        getSubscriptionInfo(id).then((res) => {
          setInfo(res.data)
        })
      }, [id])
    */  
      const handleRemove = (e) => {
      //console.log(data)
      //console.log(subscriptionId)
      
      delSubscriptionInfo(subscriptionId)
        .then((res) => {
          console.log('executando a funcao delSubscriptionInfo')
          console.log(res)
          // reload the current page
          //window.location.reload()
        })
        .catch(function (error) {
          setDelError(true)
        })
    }

    return (
        <Box>
            <CardContent>
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleRemove(subscriptionId)}
                    //onClose={() => setDelError(false)}
                    sx={{ width: '20vw', height:'34px', textAlign: 'center'}}
                    >
                    DELETE
                </Button>
            </CardContent>
            {/*<RemoveFilters subscriptionId={subscriptionId}></RemoveFilters>*/}
        </Box>
        )
    }
