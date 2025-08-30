export const API_BASE_URL =
  ["127.0.0.1", "localhost"].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3000`   // usa o mesmo host da página
    : "https://apisaudemais.danielhatz.com.br";