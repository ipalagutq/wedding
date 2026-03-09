const ASSET_VERSION = '2026-02-07-2';

const CONFIG = {
  coupleNames: 'Илья & Ирина',
  coverPhotoUrl: `front_image.jpg?v=${ASSET_VERSION}`,
  locationPhotoUrl: 'https://wedwed.ru/sitemaker/templates/template903/img/location.jpg',
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbwsiTW34iFQe2H5r1wNG5ah28MtqVcJE2x9iAxO8zIAs3ss3BNT2COBHx_Hm0c1OB3J5Q/exec',
  dateISO: '2026-08-01T16:00:00+03:00',
  dateTextShort: '01.08.2026',
  timeText: '16:00',
  dateLong: '1 августа 2026',
  guestsTime: '16:30',
  ceremonyTime: '17:30',
  banquetTime: '18:00',
  showUntil: 'до 23:00',
  djUntil: 'до 00:00',
  locationTitle: 'Zima&leto park',
  locationSubtitle: 'г. Тюмень, д. Падерина, ул. Хвойная, 10',
  locationText: 'После церемонии регистрации приглашаем вас разделить этот уютный вечер вместе с нами.',
  addressToCopy: 'г. Тюмень, д. Падерина, ул. Хвойная, 10',
  mapUrl: 'https://2gis.ru/tyumen/firm/70000001031734367?m=65.435492%2C57.083811%2F16',
  wishes: [
    'Пожалуйста, приходите вовремя — мы очень ждём каждого.',
    'Будем очень признательны, если Вы воздержитесь от криков «Горько». Ведь поцелуй — это знак выражения чувств, и он не может быть по заказу.',
    'Пожалуйста, позаботьтесь о том, чтобы оставить детишек дома под любящим присмотром и всецело насладитесь атмосферой нашего праздника.',
  ],
  dresscodeGirls: [
    `girls_references/01.avif?v=${ASSET_VERSION}`,
    `girls_references/02.webp?v=${ASSET_VERSION}`,
    `girls_references/03.webp?v=${ASSET_VERSION}`,
    `girls_references/04.webp?v=${ASSET_VERSION}`,
    `girls_references/05.webp?v=${ASSET_VERSION}`,
  ],
  dresscodeGuys: [],
  contacts: [
    {
      key: 'Irina',
      name: 'Ирина',
      phoneText: '+7 996 639 0581',
      phoneToCopy: '+79966390581',
      tgText: '@IrinaIsh72',
      tgHref: 'https://t.me/IrinaIsh72',
    },
    {
      key: 'Ilya',
      name: 'Илья',
      phoneText: '+7 904 461 9793',
      phoneToCopy: '+79044619793',
      tgText: '@ilia_pal',
      tgHref: 'https://t.me/ilia_pal',
    },
  ],
};

const RSVP_PLACEHOLDERS = {
  contact: 'Например: +7 999 123-45-67 или @username',
  songDefault: 'Например: Daft Punk — One More Time',
  songByT: {
    gv: 'Например: Afro Man - Because I Got High',
    fl: 'Например: Филяй филяй',
    gs: 'Например: Надежда Кадышева - Плывёт веночек',
    jc: 'Например: Kristina Si - Хочу',
  },
};

const RU_WEEKDAYS = ['ВОСКРЕСЕНЬЕ', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
const RU_MONTHS = ['ЯНВАРЯ', 'ФЕВРАЛЯ', 'МАРТА', 'АПРЕЛЯ', 'МАЯ', 'ИЮНЯ', 'ИЮЛЯ', 'АВГУСТА', 'СЕНТЯБРЯ', 'ОКТЯБРЯ', 'НОЯБРЯ', 'ДЕКАБРЯ'];
const RU_MONTHS_NOM = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setHref(id, href, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.setAttribute('href', href);
  if (typeof text === 'string') el.textContent = text;
}

function setBgImage(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!url) return;
  el.style.backgroundImage = `url(${url})`;
}

function setImageSrc(id, url) {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLImageElement)) return;
  if (!url) return;
  el.src = url;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function splitCoupleNames(coupleNames) {
  const raw = String(coupleNames || '');
  const parts = raw.split('&').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts[1]];
  return [raw.trim() || '—', '—'];
}

function initContent() {
  const [name1, name2] = splitCoupleNames(CONFIG.coupleNames);
  setText('heroName1', String(name1 || '—').toUpperCase());
  setText('heroName2', String(name2 || '—').toUpperCase());

  setText('coupleNames', CONFIG.coupleNames);
  setText('footerNames', CONFIG.coupleNames);
  setText('eventDateText', CONFIG.dateTextShort);
  setText('eventTimeText', CONFIG.timeText);
  setText('eventDateLong', CONFIG.dateLong);
  setText('guestsTime', CONFIG.guestsTime);
  setText('ceremonyTime', CONFIG.ceremonyTime);
  setText('banquetTime', CONFIG.banquetTime);
  setText('showUntil', CONFIG.showUntil);
  setText('djUntil', CONFIG.djUntil);
  setText('locationTitle', CONFIG.locationTitle);
  setText('locationSubtitle', CONFIG.locationSubtitle);
  setText('locationText', CONFIG.locationText);
  setHref('mapButton', CONFIG.mapUrl);
  setBgImage('coverPhoto', CONFIG.coverPhotoUrl);
  setImageSrc('locationPhoto', CONFIG.locationPhotoUrl);
  initContacts();

  // date-driven blocks (hero digits, calendar, RSVP subtitle)
  const base = new Date(CONFIG.dateISO);
  if (!Number.isNaN(base.getTime())) {
    const dd = pad2(base.getDate());
    const mm = pad2(base.getMonth() + 1);
    const yyyy = String(base.getFullYear());

    setText('heroDayText', dd);
    setText('heroMonthText', mm);
    setText('heroYearText', yyyy);

    // calendar: fixed weekday labels to match the reference
    setText('calDow1', 'ПЯТНИЦА');
    setText('calDow2', 'СУББОТА');
    setText('calDow3', 'ВОСКРЕСЕНЬЕ');

    // calendar: previous / event day / next (event day in the middle)
    const dPrev = addDays(base, -1);
    const dMid = base;
    const dNext = addDays(base, 1);
    setText('calDay1', pad2(dPrev.getDate()));
    setText('calDay2', pad2(dMid.getDate()));
    setText('calDay3', pad2(dNext.getDate()));
    setText('calMon1', RU_MONTHS_NOM[dPrev.getMonth()] || '—');
    setText('calMon2', RU_MONTHS_NOM[dMid.getMonth()] || '—');
    setText('calMon3', RU_MONTHS_NOM[dNext.getMonth()] || '—');

    const dateCaps = `${pad2(dMid.getDate())} ${RU_MONTHS[dMid.getMonth()] || '—'} ${dMid.getFullYear()}`;
    setText('rsvpDateCaps', dateCaps);
  }
}

function setButtonText(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
}

function initContacts() {
  const contactsRaw = Array.isArray(CONFIG.contacts) ? CONFIG.contacts : [];

  // Backward compatibility: if old single-contact keys exist, still render them
  if (contactsRaw.length === 0 && typeof CONFIG.contactName === 'string') {
    const nameId = 'contactIrinaName';
    const phoneId = 'contactIrinaPhone';
    const tgId = 'contactIrinaTg';

    setText(nameId, CONFIG.contactName);
    setButtonText(phoneId, CONFIG.contactPhoneText || '—');
    setHref(tgId, CONFIG.contactTgHref || '#', CONFIG.contactTgText || '—');

    const phoneBtn = document.getElementById(phoneId);
    if (phoneBtn instanceof HTMLButtonElement) {
      const toCopy = String(CONFIG.contactPhoneText || '').trim();
      if (!toCopy || toCopy === '—') {
        phoneBtn.disabled = true;
        return;
      }

      phoneBtn.addEventListener('click', async () => {
        const original = phoneBtn.textContent || '';
        try {
          await navigator.clipboard.writeText(toCopy);
          phoneBtn.textContent = 'Скопировано';
          window.setTimeout(() => (phoneBtn.textContent = original), 1300);
        } catch {
          phoneBtn.textContent = 'Не удалось';
          window.setTimeout(() => (phoneBtn.textContent = original), 1300);
        }
      });
    }

    return;
  }

  for (const c of contactsRaw) {
    if (!c || typeof c !== 'object') continue;
    const key = String(c.key || '').trim();
    if (!key) continue;

    const nameId = `contact${key}Name`;
    const phoneId = `contact${key}Phone`;
    const tgId = `contact${key}Tg`;

    setText(nameId, String(c.name || '—'));
    setButtonText(phoneId, String(c.phoneText || '—'));
    setHref(tgId, String(c.tgHref || '#'), String(c.tgText || '—'));

    const phoneBtn = document.getElementById(phoneId);
    if (phoneBtn instanceof HTMLButtonElement) {
      const phoneToCopy = String(c.phoneToCopy || c.phoneText || '');
      const original = phoneBtn.textContent || '';

      if (!phoneToCopy.trim() || phoneToCopy.trim() === '—') {
        phoneBtn.disabled = true;
        continue;
      }

      phoneBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(phoneToCopy);
          phoneBtn.textContent = 'Скопировано';
          window.setTimeout(() => (phoneBtn.textContent = original), 1300);
        } catch {
          phoneBtn.textContent = 'Не удалось';
          window.setTimeout(() => (phoneBtn.textContent = original), 1300);
        }
      });
    }
  }
}

function initReveal() {
  const nodes = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  nodes.forEach((n) => io.observe(n));
}

function initDecorLineLayout() {
  const page = document.querySelector('main.page');
  if (!(page instanceof HTMLElement)) return;

  const lines = Array.from(document.querySelectorAll('.decorLines__svg[data-decor-key]'));
  if (lines.length === 0) return;

  const anchors = new Map();
  for (const el of document.querySelectorAll('.decorAnchor[data-decor-anchor]')) {
    if (!(el instanceof HTMLElement)) continue;
    const key = el.dataset.decorAnchor;
    if (!key) continue;
    anchors.set(key, el);
  }
  if (anchors.size === 0) return;

  let rafId = 0;
  const layout = () => {
    rafId = 0;
    const pageTop = page.getBoundingClientRect().top + window.scrollY;

    for (const svg of lines) {
      const key = svg.dataset.decorKey;
      if (!key) continue;
      const anchor = anchors.get(key);
      if (!anchor) continue;

      const prev = anchor.previousElementSibling;
      const next = anchor.nextElementSibling;
      if (!(prev instanceof HTMLElement) || !(next instanceof HTMLElement)) continue;

      const prevContent = prev.querySelector(':scope > .c') || prev;
      const nextContent = next.querySelector(':scope > .c') || next;

      const y1 = prevContent.getBoundingClientRect().bottom + window.scrollY;
      const y2 = nextContent.getBoundingClientRect().top + window.scrollY;

      let midY;
      if (y2 > y1) {
        midY = (y1 + y2) / 2;
      } else {
        const prevRect = prev.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();
        midY = (prevRect.bottom + nextRect.top) / 2 + window.scrollY;
      }

      const svgH = svg.getBoundingClientRect().height || 0;
      const top = midY - pageTop - svgH / 2;
      svg.style.top = `${Math.max(0, Math.round(top))}px`;
    }
  };

  const schedule = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(layout);
  };

  schedule();
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule, { passive: true });
  window.addEventListener('load', schedule, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(() => {});
  }
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  const target = new Date(CONFIG.dateISO);

  const tick = () => {
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      el.textContent = 'Сегодня!';
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} ${plural(days, 'день', 'дня', 'дней')}`);
    parts.push(`${hours} ${plural(hours, 'час', 'часа', 'часов')}`);
    parts.push(`${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')}`);

    el.textContent = parts.join(' · ');
  };

  tick();
  window.setInterval(tick, 15_000);
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!res.ok) {
    const message = parsed?.detail || parsed?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return parsed;
}

async function postRSVP(payload) {
  const endpoint = String(CONFIG.rsvpEndpoint || '').trim();
  if (!endpoint) {
    // If backend is available (local FastAPI), keep using it.
    // If this is static hosting (GitHub Pages), show a clear error.
    try {
      const health = await fetch('health', { cache: 'no-store' });
      if (health.ok) {
        return await postJSON('/api/rsvp', payload);
      }
    } catch {
      // ignore
    }
    throw new Error('RSVP не настроен. Вставьте URL Apps Script в CONFIG.rsvpEndpoint');
  }

  // Apps Script Web App doesn't provide CORS headers for cross-origin fetch.
  // We use no-cors mode to allow sending the request from GitHub Pages.
  // Response will be opaque; we treat a successful send as OK.
  await fetch(endpoint, {
    method: 'POST',
    mode: 'no-cors',
    body: new URLSearchParams({ payload: JSON.stringify(payload) }),
  });

  return { ok: true };
}

function formToPayload(form) {
  const fd = new FormData(form);
  const guestsRaw = fd.get('guests');
  const guestsNum = guestsRaw === null || guestsRaw === '' ? null : Number(guestsRaw);
  const guestsNormalized = guestsNum === null || !Number.isFinite(guestsNum) || guestsNum <= 0 ? null : guestsNum;

  const plusOnes = fd
    .getAll('plusOneName')
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 2);

  return {
    name: String(fd.get('name') || '').trim(),
    contact: String(fd.get('contact') || '').trim(),
    attendance: String(fd.get('attendance') || '').trim(),
    guests: guestsNormalized,
    plus_ones: plusOnes,
    // keep fields for backend compatibility (they have defaults)
    diet: '',
    comment: '',
    song: String(fd.get('song') || '').trim(),
    meta: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
}

function initRSVPAttendanceUI() {
  const form = document.getElementById('rsvpForm');
  if (!(form instanceof HTMLFormElement)) return;

  const yesBlock = document.getElementById('rsvpYesBlock');
  if (!(yesBlock instanceof HTMLElement)) return;

  const guestsCount = document.getElementById('guestsCount');
  const guestsNotAlone = document.getElementById('guestsNotAlone');
  const plusOnesBlock = document.getElementById('plusOnesBlock');
  const plusOnesList = document.getElementById('plusOnesList');
  const plusOneAdd = document.getElementById('plusOneAdd');
  const songInput = form.querySelector('input[name="song"]');
  const contactInput = form.querySelector('input[name="contact"]');

  if (contactInput instanceof HTMLInputElement) {
    contactInput.placeholder = RSVP_PLACEHOLDERS.contact;
  }

  if (songInput instanceof HTMLInputElement) {
    const t = new URLSearchParams(window.location.search).get('t') || '';
    const override = RSVP_PLACEHOLDERS.songByT[t];
    songInput.placeholder = override || RSVP_PLACEHOLDERS.songDefault;
  }

  const getAttendance = () => {
    const el = form.querySelector('input[name="attendance"]:checked');
    return el instanceof HTMLInputElement ? el.value : '';
  };

  const MAX_TOTAL_GUESTS = 3;

  const setGuestsCount = (n) => {
    if (!(guestsCount instanceof HTMLInputElement)) return;
    guestsCount.value = String(n);
  };

  const clearPlusOnes = () => {
    if (!(plusOnesList instanceof HTMLElement)) return;
    plusOnesList.replaceChildren();
  };

  const plusOneInputsCount = () => {
    if (!(plusOnesList instanceof HTMLElement)) return 0;
    return plusOnesList.querySelectorAll('input[name="plusOneName"]').length;
  };

  const createPlusOneInput = () => {
    const input = document.createElement('input');
    input.className = 'fin';
    input.name = 'plusOneName';
    input.autocomplete = 'name';
    input.placeholder = 'Введите имя';
    return input;
  };

  const setPlusOnesVisible = (visible) => {
    if (plusOnesBlock instanceof HTMLElement) plusOnesBlock.hidden = !visible;

    const inputs = plusOnesList instanceof HTMLElement ? plusOnesList.querySelectorAll('input[name="plusOneName"]') : [];
    inputs.forEach((el) => {
      if (el instanceof HTMLInputElement) el.disabled = !visible;
    });
    if (plusOneAdd instanceof HTMLButtonElement) plusOneAdd.disabled = !visible;
  };

  const syncGuestsFromUI = () => {
    const enabled = getAttendance() === 'yes';
    if (!enabled) {
      setGuestsCount(0);
      return;
    }

    const notAlone = guestsNotAlone instanceof HTMLInputElement ? guestsNotAlone.checked : false;
    if (!notAlone) {
      setGuestsCount(1);
      return;
    }

    const count = 1 + plusOneInputsCount();
    setGuestsCount(Math.max(2, Math.min(MAX_TOTAL_GUESTS, count)));
  };

  const render = () => {
    const attendance = getAttendance();
    const show = attendance === 'yes';
    yesBlock.hidden = !show;

    if (guestsCount instanceof HTMLInputElement) guestsCount.disabled = !show;
    if (songInput instanceof HTMLInputElement) songInput.disabled = !show;

    if (guestsNotAlone instanceof HTMLInputElement) guestsNotAlone.disabled = !show;
    if (plusOneAdd instanceof HTMLButtonElement) plusOneAdd.disabled = !show;

    if (!show) {
      if (guestsNotAlone instanceof HTMLInputElement) guestsNotAlone.checked = false;
      clearPlusOnes();
      setPlusOnesVisible(false);
      setGuestsCount(0);
      if (songInput instanceof HTMLInputElement) songInput.value = '';
      return;
    }

    const notAlone = guestsNotAlone instanceof HTMLInputElement ? guestsNotAlone.checked : false;

    if (!notAlone) {
      clearPlusOnes();
      setPlusOnesVisible(false);
      setGuestsCount(1);
      return;
    }

    // not alone
    setPlusOnesVisible(true);

    // ensure at least one +1 input
    if (plusOnesList instanceof HTMLElement && plusOneInputsCount() === 0) {
      plusOnesList.appendChild(createPlusOneInput());
    }

    const currentInputs = plusOneInputsCount();
    const canAddMore = 1 + currentInputs < MAX_TOTAL_GUESTS;
    if (plusOneAdd instanceof HTMLButtonElement) plusOneAdd.hidden = !canAddMore;

    syncGuestsFromUI();
  };

  form.addEventListener('change', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.matches('input[name="attendance"]') || t === guestsNotAlone) render();
  });

  if (plusOneAdd instanceof HTMLButtonElement) {
    plusOneAdd.addEventListener('click', () => {
      if (!(plusOnesList instanceof HTMLElement)) return;
      const currentInputs = plusOneInputsCount();
      if (1 + currentInputs >= MAX_TOTAL_GUESTS) return;
      plusOnesList.appendChild(createPlusOneInput());
      render();
    });
  }

  render();
}

function setStatus(statusEl, text, kind) {
  statusEl.textContent = text;
  statusEl.dataset.kind = kind || '';
}

function initRSVP() {
  const form = document.getElementById('rsvpForm');
  const statusEl = document.getElementById('formStatus');
  if (!form || !statusEl) return;

  initRSVPAttendanceUI();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = formToPayload(form);
    if (!payload.name) {
      setStatus(statusEl, 'Введите имя.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus(statusEl, 'Отправляем…', 'loading');

    try {
      await postRSVP(payload);
      setStatus(statusEl, 'Спасибо! Ответ сохранён.', 'ok');
      form.reset();

      // мягкий акцент для светлой формы
      form.animate(
        [
          { backgroundColor: 'rgba(0,0,0,0)' },
          { backgroundColor: 'rgba(184,150,113,.10)' },
          { backgroundColor: 'rgba(0,0,0,0)' },
        ],
        { duration: 1200, easing: 'cubic-bezier(.22, 1, .36, 1)' }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка отправки.';
      setStatus(statusEl, `Не получилось отправить: ${message}`, 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  const copyBtn = document.getElementById('copyAddress');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(CONFIG.addressToCopy);
        copyBtn.textContent = 'Скопировано';
        window.setTimeout(() => (copyBtn.textContent = 'Скопировать адрес'), 1300);
      } catch {
        copyBtn.textContent = 'Не удалось';
        window.setTimeout(() => (copyBtn.textContent = 'Скопировать адрес'), 1300);
      }
    });
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function initWishes() {
  const textEl = document.getElementById('wishText');
  const pageEl = document.getElementById('wishPage');
  const prevBtn = document.getElementById('wishPrev');
  const nextBtn = document.getElementById('wishNext');
  if (!textEl || !pageEl || !prevBtn || !nextBtn) return;

  const wishes = Array.isArray(CONFIG.wishes) ? CONFIG.wishes.filter(Boolean) : [];
  if (wishes.length === 0) {
    textEl.textContent = '—';
    pageEl.textContent = '00/00';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  let index = 0;
  const render = () => {
    textEl.textContent = wishes[index];
    pageEl.textContent = `${pad2(index + 1)}/${pad2(wishes.length)}`;
  };

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + wishes.length) % wishes.length;
    render();
  });
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % wishes.length;
    render();
  });

  render();
}

async function initDresscodeGalleries() {
  const girlsImg = document.getElementById('girlsImg');
  const guysStage = document.getElementById('guysStage');
  if (!girlsImg && !guysStage) return;

  const getGirlsSources = async () => {
    const fromConfig = Array.isArray(CONFIG.dresscodeGirls) ? CONFIG.dresscodeGirls.filter(Boolean) : [];
    const localFromConfig = fromConfig.filter((u) => typeof u === 'string' && String(u).includes('girls_references/'));

    const normalizeAsset = (u) => {
      const s = String(u || '');
      if (!s) return '';
      // Support both '/girls_references/..' and 'girls_references/..'
      return s.startsWith('/') ? s.slice(1) : s;
    };

    // Static hosting: prefer a local manifest file.
    try {
      const res = await fetch(`girls_references/manifest.json?v=${encodeURIComponent(ASSET_VERSION)}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data?.items) ? data.items.filter(Boolean) : [];
        const normalized = items
          .map((u) => (typeof u === 'string' ? u : ''))
          .map(normalizeAsset)
          .filter((u) => u.startsWith('girls_references/'))
          .map((u) => `${u}?v=${ASSET_VERSION}`);
        if (normalized.length > 0) return normalized;
      }
    } catch {
      // ignore
    }

    try {
      const res = await fetch(`/api/girls-references?v=${encodeURIComponent(ASSET_VERSION)}`, { cache: 'no-store' });
      if (!res.ok) return localFromConfig;
      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items.filter(Boolean) : [];
      const normalized = items
        .map((u) => (typeof u === 'string' ? u : ''))
        .map(normalizeAsset)
        .filter((u) => u.startsWith('girls_references/'))
        .map((u) => `${u}?v=${ASSET_VERSION}`);
      return normalized.length > 0 ? normalized : localFromConfig;
    } catch {
      return localFromConfig;
    }
  };

  const sources = {
    girls: await getGirlsSources(),
    guys: ['spinner', 'msg'],
  };

  const state = { girls: 0, guys: 0 };

  const renderOne = (key) => {
    const list = sources[key];
    if (!list || list.length === 0) return;

    const idx = state[key];
    const item = list[idx];

    if (key === 'girls') {
      if (!(girlsImg instanceof HTMLImageElement)) return;
      if (typeof item !== 'string' || !item) return;
      girlsImg.src = item;
      return;
    }

    if (!(guysStage instanceof HTMLElement)) return;
    guysStage.replaceChildren();

    if (item === 'msg') {
      guysStage.removeAttribute('aria-busy');
      const msg = document.createElement('div');
      msg.className = 'gal__msg';
      msg.textContent = 'Не заморачивайся ;-)';
      guysStage.appendChild(msg);
      return;
    }

    guysStage.setAttribute('aria-busy', 'true');
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.setAttribute('role', 'status');
    spinner.setAttribute('aria-label', 'Загрузка');
    guysStage.appendChild(spinner);
  };

  const onNav = (key, dir) => {
    const list = sources[key];
    if (!list || list.length === 0) return;
    const delta = dir === 'prev' ? -1 : 1;
    state[key] = (state[key] + delta + list.length) % list.length;
    renderOne(key);
  };

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const btn = t.closest('button[data-gal][data-dir]');
    if (!(btn instanceof HTMLButtonElement)) return;
    const key = btn.dataset.gal;
    const dir = btn.dataset.dir;
    if ((key !== 'girls' && key !== 'guys') || (dir !== 'prev' && dir !== 'next')) return;
    onNav(key, dir);
  });

  // initial
  renderOne('girls');
  renderOne('guys');
}

initContent();
initDecorLineLayout();
initReveal();
initCountdown();
initRSVP();
initWishes();
void initDresscodeGalleries();
