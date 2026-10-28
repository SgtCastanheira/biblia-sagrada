/*
 * Service worker do app: o do Angular (offline e atualizações, em ngsw-worker.js) e mais os lembretes do dia
 * com o app fechado. O app guarda a agenda dos próximos dias no cache "biblia-lembretes"
 * (core/reminders.service.ts); quando o navegador acorda este worker (sincronização periódica, no Chrome e no
 * Edge com o app instalado), ele mostra o lembrete cuja hora já passou e que ainda não apareceu.
 * O toque na notificação é tratado pelo ngsw (data.onActionClick).
 */
importScripts('ngsw-worker.js');

const REMINDERS = 'biblia-lembretes';
/** Depois de 4 horas, o lembrete perde a hora e não aparece mais. */
const STALE = 4 * 60 * 60 * 1000;

const url = (name) => new URL(`lembretes/${name}`, self.registration.scope).href;

async function read(cache, name, fallback) {
  try {
    const response = await cache.match(url(name));
    return response ? await response.json() : fallback;
  } catch {
    return fallback;
  }
}

async function showDueReminder() {
  const cache = await caches.open(REMINDERS);
  const agenda = await read(cache, 'agenda.json', []);
  const shown = await read(cache, 'mostrados.json', []);
  const now = Date.now();
  const due = agenda.filter((r) => r.at <= now && now - r.at < STALE && !shown.includes(r.id)).pop();
  if (!due) return;
  // Com o app aberto, a própria página avisa na hora certa
  const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (open.length) return;
  await self.registration.showNotification(due.title, {
    body: due.body,
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-96x96.png',
    tag: 'lembrete',
    data: { url: due.url, onActionClick: { default: { operation: 'navigateLastFocusedOrOpen', url: due.url } } },
  });
  await cache.put(url('mostrados.json'), new Response(JSON.stringify([...shown, due.id].slice(-40))));
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'lembretes') event.waitUntil(showDueReminder());
});
