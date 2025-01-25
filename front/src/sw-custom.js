self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Default body',
    icon: data.icon || '/assets/icons/logo3-icon.png',
    badge: data.badge || '/assets/icons/logo3-badge.png',
    data: data.url || '/' // URL na koji vodi notifikacija
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Default title', options)
    // self.registration.showNotification('Test Notification', {
    //   body: 'This is a simple test notification.',
    //   icon: '/assets/icons/icon-128x128.png'
    // })
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});


