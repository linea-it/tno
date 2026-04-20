import React from 'react'
import { useQuery } from 'react-query'
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import WorkerCard from './WorkerCard';
import { getWorkers } from '../../../services/api/PredictionTasks';

function WorkersSummary() {

  const { data, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: getWorkers,
    keepPreviousData: true,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnmount: false,
    refetchOnReconnect: false,
    // retry: 1,
    // staleTime: 5 * 60 * 60 * 1000
  })

  const order = ['PREPARE', 'SUBMIT', 'INGEST']

  const orderWorkers = (data, order) => {
    return [...data].sort((a, b) => {
      const indexA = order.indexOf(a.worker);
      const indexB = order.indexOf(b.worker);

      // Caso algum worker não esteja na lista, joga para o final
      return (indexA === -1 ? order.length : indexA) - (indexB === -1 ? order.length : indexB);
    });
  };

  const ordered = data ? orderWorkers(data?.results, order) : [];

  return (
    <Box>
      Heartbeat of workers
      < Stack direction='column' spacing={1} >
        {
          ordered.map((worker, idx) => {

            return <WorkerCard key={idx} worker={worker} />
          })
        }
      </Stack >
    </Box >
  )
}

export default WorkersSummary
