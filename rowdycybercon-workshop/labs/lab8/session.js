// Simulates a server that trusts an unsigned, base64-encoded JSON session cookie.
function getSession() {
  const raw = document.cookie.split('; ').find(c => c.startsWith('session='));
  try {
    const data = JSON.parse(atob(decodeURIComponent(raw.slice(8))));
    if (data && typeof data === 'object') return data;
  } catch (e) {}
  const fresh = { user: 'guest', role: 'user' };
  document.cookie = 'session=' + btoa(JSON.stringify(fresh)) + '; path=/labs/lab8/';
  return fresh;
}
