self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Yathrika', body: event.data.text() };
  }

  const title = payload.title || 'Yathrika';
  const options = {
    body: payload.body || 'You have a new notification.',
    icon: payload.icon || '/vite.svg',
    badge: payload.badge || '/vite.svg',
    tag: payload.tag || `yathrika_${Date.now()}`,
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetPath = event.notification?.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetPath);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetPath);
      }
      return null;
    })
  );
});
