
export const states = [
  'PENDING',
  'PREPARING',
  'READY_FOR_RUN',
  'SUBMITTING',
  'QUEUED',
  'RUNNING',
  'WAITING_RESULTS',
  'INGESTING',
  'DONE',
  'FAILED',
  'STALLED',
  'ABORTED',
]

// Cores alterantivas
// const colors = ['#FFCDD2', '#F8BBD0', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3']
export const taskStates = {
  'PENDING': { color: '#ff9800', label: 'Pending' },
  'PREPARING': { color: '#2196f3', label: 'Preparing' },
  'READY_FOR_RUN': { color: '#4caf50', label: 'Ready for Run' },
  'SUBMITTING': { color: '#ff9800', label: 'Submitting' },
  'QUEUED': { color: '#2196f3', label: 'Queued' },
  'RUNNING': { color: '#4caf50', label: 'Running' },
  'WAITING_RESULTS': { color: '#ff9800', label: 'Waiting Results' },
  'INGESTING': { color: '#2196f3', label: 'Ingesting' },
  'DONE': { color: '#4caf50', label: 'Done' },
  'FAILED': { color: '#f44336', label: 'Failed' },
  'STALLED': { color: '#f44336', label: 'Stalled' },
  'ABORTED': { color: '#9e9e9e', label: 'Aborted' },
}

export function sortByState(data, states) {
  // cria um mapa {state: ordem}
  const stateOrder = Object.fromEntries(states.map((s, i) => [s, i]));

  return [...data].sort((a, b) => {
    return stateOrder[a.state] - stateOrder[b.state];
  });
}