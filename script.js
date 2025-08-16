// Configure aqui depois do deploy no Vercel:
const PROXY_BASE = ''; // ex.: 'https://seu-proxy.vercel.app/api/proxy?url='

// Lista embutida de canais (gerado a partir da sua playlist)
const CHANNELS = [];

// Helpers
function isHttp(u) { return /^http:\/\//i.test(u); }
function isHttps(u) { return /^https:\/\//i.test(u); }
function isHls(u) { return /\.m3u8(\?|$)/i.test(u); }

function toPlayable(u) {
  if (isHttps(u)) return u;            // ok direto
  if (isHttp(u) && PROXY_BASE) return PROXY_BASE + encodeURIComponent(u); // passa pelo proxy
  return u; // outros protocolos (rtsp, udp, rtmp) provavelmente não funcionarão no navegador
}

const list = document.getElementById('channelList');
const search = document.getElementById('search');
const video = document.getElementById('video');
const nowName = document.getElementById('nowName');
const nowWarn = document.getElementById('nowWarn');
let hls;

function render(items) {
  list.innerHTML = '';
  if (!items.length) {
    const li = document.createElement('li');
    li.textContent = 'Nenhum canal.';
    list.appendChild(li);
    return;
  }
  items.forEach((c, idx) => {
    const li = document.createElement('li');
    const pill = document.createElement('span');
    const compatible = isHttps(c.url) || (isHttp(c.url) && !!PROXY_BASE);
    pill.className = 'pill ' + (compatible ? 'ok' : 'bad');
    pill.textContent = compatible ? 'OK' : 'HTTP';
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = c.name || ('Canal ' + (idx+1));
    li.appendChild(pill);
    li.appendChild(title);
    li.addEventListener('click', () => play(c));
    list.appendChild(li);
  });
}

function play(c) {
  nowName.textContent = c.name || 'Canal';
  const needsProxy = isHttp(c.url) && !PROXY_BASE;
  nowWarn.textContent = needsProxy ? 'Este link é HTTP. Configure PROXY_BASE no script.js para rodar em HTTPS (GitHub Pages).' : '';

  const src = toPlayable(c.url);
  const useHls = isHls(src);

  if (hls) { hls.destroy(); hls = null; }
  if (useHls && window.Hls && Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
    video.play().catch(()=>{});
  } else if (video.canPlayType('application/vnd.apple.mpegurl') && useHls) {
    video.src = src;
    video.play().catch(()=>{});
  } else {
    video.src = src;
    video.play().catch(()=>{});
  }
}

search.addEventListener('input', () => {
  const term = search.value.toLowerCase();
  render(CHANNELS.filter(c => (c.name||'').toLowerCase().includes(term)));
});

// Render inicial
render(CHANNELS);
