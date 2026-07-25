/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import './index.css'
import App from './App.jsx'
import AdminRoot from './admin/AdminRoot.jsx'

function Root() {
  const [isAdmin, setIsAdmin] = createSignal(window.location.hash.startsWith('#/admin'))

  const onHashChange = () => setIsAdmin(window.location.hash.startsWith('#/admin'))

  onMount(() => {
    window.addEventListener('hashchange', onHashChange)
    onCleanup(() => window.removeEventListener('hashchange', onHashChange))
  })

  return (
    <Show when={isAdmin()} fallback={<App />}>
      <AdminRoot />
    </Show>
  )
}

const root = document.getElementById('root')

render(() => <Root />, root)
