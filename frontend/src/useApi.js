import { useEffect, useState } from 'react'

// Runs an api call when deps change. Returns { data, error, loading, reload, setData }.
// setData lets a page update the shown data after an action (save, complete) without refetching.
export default function useApi(fn, deps) {
  const [state, setState] = useState({ loading: true })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let live = true // ignore answers that arrive after the page moved on
    setState((s) => ({ ...s, loading: true, error: null }))
    fn().then(
      (data) => live && setState({ data, loading: false }),
      (error) => live && setState({ error, loading: false }),
    )
    return () => { live = false }
  }, [...deps, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    reload: () => setTick((t) => t + 1),
    setData: (update) => setState((s) => ({ ...s, data: update(s.data) })),
  }
}
