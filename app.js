(() => {
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  // ── Names ──
  document.querySelectorAll("[data-name]").forEach(e => (e.textContent = S.shortName));
  document.querySelectorAll("[data-fullname]").forEach(e => (e.textContent = S.name));
  document.querySelectorAll("[data-from]").forEach(e => (e.textContent = S.from));
  $("#signature").textContent = S.signature;
  if (S.heroPhoto) $("#heroImg").src = S.heroPhoto; else $(".hero-photo").remove();
  $("#secretHint").textContent = "Hint: " + S.secret.hint;

  // ── Photos (placeholder shown until real photos are added) ──
  const tints = ["#f2c9c4", "#e9b7b2", "#f6d9cf", "#eec1c8", "#f3d4c2"];
  const placeholder = i => "data:image/svg+xml," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tints[i % 5]}"/><stop offset="1" stop-color="#fffaf5"/></linearGradient></defs><rect width="600" height="750" fill="url(#g)"/><text x="300" y="370" font-size="90" text-anchor="middle" fill="#b5606a" opacity=".5">♥</text><text x="300" y="440" font-size="28" font-family="Georgia" text-anchor="middle" fill="#8c6f72">Photo ${i + 1}</text></svg>`);
  const img = (i, alt, src = S.photos[i].src) => {
    const im = new Image();
    im.loading = "lazy"; im.decoding = "async"; im.alt = alt || `Photo ${i + 1}`;
    im.onerror = () => { im.onerror = null; im.src = placeholder(i); };
    im.src = src;
    return im;
  };

  // Timeline
  const tl = $("#timeline");
  S.timeline.forEach((t, i) => {
    const li = el("li", "reveal");
    if (t.photo) li.append(img(i, t.title, t.photo));
    li.append(el("h3", null, t.title), el("p", null, t.text));
    tl.append(li);
  });

  // Gallery
  const gal = $("#gallery");
  S.photos.forEach((p, i) => {
    const f = el("figure", "reveal");
    f.append(img(i, p.caption));
    f.onclick = () => openLb(i);
    gal.append(f);
  });

  // Lightbox with swipe
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $(".lb-cap", lb);
  let cur = 0;
  const show = i => {
    cur = (i + S.photos.length) % S.photos.length;
    const src = gal.children[cur].querySelector("img").src;
    lbImg.src = src; lbCap.textContent = S.photos[cur].caption || "";
  };
  const openLb = i => { show(i); lb.hidden = false; document.body.classList.add("locked"); };
  const closeLb = () => { lb.hidden = true; document.body.classList.remove("locked"); };
  $(".lb-close", lb).onclick = closeLb;
  $(".prev", lb).onclick = () => show(cur - 1);
  $(".next", lb).onclick = () => show(cur + 1);
  lb.onclick = e => { if (e.target === lb) closeLb(); };
  let sx = 0;
  lb.addEventListener("touchstart", e => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); if (e.key === "ArrowLeft") show(cur - 1); if (e.key === "ArrowRight") show(cur + 1);
  });

  // Reasons cards
  const rs = $("#reasons");
  S.reasons.forEach((r, i) => {
    const c = el("div", "card reveal", `<div class="card-in"><div class="card-f"><div>${i + 1}<small>REASON</small></div></div><div class="card-b">${r}</div></div>`);
    c.onclick = () => c.classList.toggle("flip");
    rs.append(c);
  });

  // ── Counter ──
  const bday = new Date(S.birthday);
  const renderCounter = () => {
    const now = new Date(), diff = bday - now, box = $("#counter");
    if (diff > 0) {
      $("#counterLabel").textContent = "Counting down to your day";
      const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
      box.innerHTML = [[d, "days"], [h, "hours"], [m, "mins"], [s, "secs"]].map(([v, l]) => `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
    } else if (diff > -864e5) {
      $("#counterLabel").textContent = "26 September 2026";
      box.innerHTML = `<div class="today">Today is your day ✨</div>`;
    } else {
      $("#counterLabel").textContent = "Your birthday was";
      box.innerHTML = `<div><b>${Math.floor(-diff / 864e5)}</b><span>days ago</span></div><div class="today">& I love you more each day</div>`;
    }
  };
  renderCounter(); setInterval(renderCounter, 1000);

  // ── Scroll reveal ──
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
  const observeAll = () => document.querySelectorAll(".reveal").forEach(r => io.observe(r));

  // ── Typewriter letter ──
  let typed = false;
  const typeLetter = async () => {
    if (typed) return; typed = true;
    const body = $("#letterBody");
    for (const para of S.letter) {
      const p = el("p", "caret"); body.append(p);
      for (const ch of para) { p.textContent += ch; await new Promise(r => setTimeout(r, 22)); }
      p.classList.remove("caret");
      await new Promise(r => setTimeout(r, 250));
    }
    $(".signature").classList.add("in");
  };
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { typeLetter(); o.disconnect(); } }, { threshold: 0.3 }).observe($("#letter"));

  // ── Music ──
  const audio = $("#bgm"), btn = $("#musicBtn");
  let useSynth = false, synth = null, playing = false;
  audio.src = S.music;
  audio.addEventListener("error", () => (useSynth = true));

  // Fallback: gentle music-box "Happy Birthday" made with Web Audio
  const makeSynth = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = 0.18; master.connect(ctx.destination);
    const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
    const song = [["G4",.75],["G4",.25],["A4",1],["G4",1],["C5",1],["B4",2],["G4",.75],["G4",.25],["A4",1],["G4",1],["D5",1],["C5",2],
      ["G4",.75],["G4",.25],["G5",1],["E5",1],["C5",1],["B4",1],["A4",2],["F5",.75],["F5",.25],["E5",1],["C5",1],["D5",1],["C5",3]];
    const beat = 0.55; let timer = null;
    const note = (f, t, d) => {
      [1, 2].forEach((mult, k) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f * mult;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(k ? .15 : .5, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d + 1.2);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 1.3);
      });
    };
    const loop = () => {
      let t = ctx.currentTime + .1;
      song.forEach(([n, b]) => { note(N[n], t, b * beat); t += b * beat; });
      timer = setTimeout(loop, (t - ctx.currentTime + 1.5) * 1000);
    };
    return {
      play() { ctx.resume(); if (!timer) loop(); },
      pause() { ctx.suspend(); },
    };
  };

  const setPlaying = p => { playing = p; btn.classList.toggle("paused", !p); btn.setAttribute("aria-label", p ? "Pause music" : "Play music"); };
  const play = () => {
    if (!useSynth) {
      audio.play().then(() => setPlaying(true)).catch(() => { useSynth = true; play(); });
    } else {
      synth = synth || makeSynth(); synth.play(); setPlaying(true);
    }
  };
  const pause = () => { useSynth ? synth && synth.pause() : audio.pause(); setPlaying(false); };
  btn.onclick = () => (playing ? pause() : play());

  // ── Effects canvas: petals + confetti ──
  const cv = $("#fx"), cx = cv.getContext("2d");
  const resize = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
  resize(); addEventListener("resize", resize);
  const parts = [];
  const colors = ["#d98c8c", "#f2c9c4", "#c9a15a", "#b5606a", "#fff"];
  const petal = () => ({ x: Math.random() * innerWidth, y: -20, vx: Math.random() - .5, vy: .6 + Math.random() * .8, r: 5 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .05, c: colors[Math.random() * 3 | 0], kind: "petal", life: Infinity });
  const burst = (x, y, n = 120) => { for (let i = 0; i < n; i++) { const ang = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7; parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 3, r: 3 + Math.random() * 4, a: Math.random() * 6, va: .2, c: colors[Math.random() * 5 | 0], kind: "conf", life: 140 }); } };
  let petalsOn = false;
  const tick = () => {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    if (petalsOn && parts.filter(p => p.kind === "petal").length < 22 && Math.random() < .05) parts.push(petal());
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx + (p.kind === "petal" ? Math.sin(p.a) * .5 : 0); p.y += p.vy; p.a += p.va;
      if (p.kind === "conf") { p.vy += .15; p.vx *= .99; p.life--; }
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.globalAlpha = p.kind === "conf" ? Math.min(1, p.life / 40) : .7;
      if (p.kind === "petal") { cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * .6, 0, 0, Math.PI * 2); cx.fill(); }
      else cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      cx.restore();
      if (p.y > innerHeight + 30 || p.life <= 0) parts.splice(i, 1);
    }
    requestAnimationFrame(tick);
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) tick();

  // ── Intro ──
  const env = $("#envelope");
  const open = () => {
    if (env.classList.contains("open")) return;
    env.classList.add("open");
    btn.hidden = false; play();
    setTimeout(() => {
      $("#intro").classList.add("gone");
      $("#site").hidden = false;
      observeAll(); petalsOn = true;
      burst(innerWidth / 2, innerHeight / 3, 160);
    }, 1100);
  };
  $("#intro").addEventListener("click", open);
  env.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && open());

  // ── Cake ──
  const candles = $(".candles");
  for (let i = 0; i < 5; i++) candles.append(el("div", "candle", '<div class="flame"></div>'));
  const cake = $("#cake");
  const blow = () => {
    if (cake.classList.contains("out")) return;
    cake.classList.add("out"); $("#wish").hidden = false; $("#cakeHint").textContent = "🎉 Happy Birthday, " + S.shortName + "! 🎉";
    const r = cake.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 200);
    setTimeout(() => burst(innerWidth * .2, innerHeight * .4), 400); setTimeout(() => burst(innerWidth * .8, innerHeight * .4), 800);
  };
  cake.onclick = blow; cake.onkeydown = e => (e.key === "Enter" || e.key === " ") && blow();

  // ── Secret ──
  $("#secretForm").onsubmit = e => {
    e.preventDefault();
    const inp = $("#secretInput");
    if (inp.value.trim().toLowerCase() === String(S.secret.password).toLowerCase()) {
      $("#secretForm").hidden = true; $(".lock").textContent = "🔓";
      const m = $("#secretMsg"); m.innerHTML = (S.secret.photo ? `<img class="secret-photo" src="${S.secret.photo}" alt="Us" />` : "") + S.secret.message.map(t => `<p>${t}</p>`).join(""); m.hidden = false;
      const r = m.getBoundingClientRect(); burst(innerWidth / 2, Math.max(80, r.top), 180);
      const g = S.secret.gift;
      if (g) {
        const gift = $("#gift");
        gift.innerHTML = `<p class="gift-label">🎁 ${g.label}</p><div class="ticket"><p class="gift-title script">${g.title}</p><p class="gift-when">${g.date}<b>${g.time}</b></p><p class="gift-note">${g.note}</p><p class="gift-from">Valid for one. With love, ${g.from} ♥</p></div>`;
        gift.hidden = false;
      }
    } else {
      $("#secretErr").hidden = false; inp.classList.remove("shake"); void inp.offsetWidth; inp.classList.add("shake"); inp.value = "";
    }
  };
})();
