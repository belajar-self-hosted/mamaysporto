import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { getSession, onAuthStateChange } from "../lib/auth";
import Login from "./Login";
import AdminLayout from "./AdminLayout";
import "./admin.css";

export default function AdminRoot() {
  const [session, setSession] = createSignal(undefined); // undefined = loading, null = logged out

  onMount(async () => {
    setSession(await getSession());
    const unsubscribe = onAuthStateChange((s) => setSession(s));
    onCleanup(unsubscribe);
  });

  return (
    <div class="admin-root">
      <Show when={session() !== undefined} fallback={<div class="admin-loading">Memuat...</div>}>
        <Show when={session()} fallback={<Login />}>
          <AdminLayout />
        </Show>
      </Show>
    </div>
  );
}
