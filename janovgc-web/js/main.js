/* ============================================================
   JanoVGC — Rendering & interactivity
   ============================================================ */

(function () {
  "use strict";

  const data = window.JANO_DATA || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));

  /* ---------- Hero stats ---------- */
  function renderStats() {
    const el = $("#hero-stats");
    if (!el || !data.stats) return;
    el.innerHTML = data.stats.map((s) => `
      <div class="stat">
        <b>${escapeHtml(s.value)}</b>
        <span>${escapeHtml(s.label)}</span>
      </div>`).join("");
  }

  /* ---------- History timeline ---------- */
  function renderHistory() {
    const el = $("#timeline");
    if (!el || !data.history) return;
    el.innerHTML = data.history.map((h) => `
      <li class="reveal">
        <span class="tl-year">${escapeHtml(h.year)}</span>
        <h3 class="tl-title">${escapeHtml(h.title)}</h3>
        <p class="tl-desc">${escapeHtml(h.desc)}</p>
      </li>`).join("");
  }

  /* ---------- Tops ---------- */
  function renderTops() {
    const el = $("#tops-grid");
    if (!el || !data.tops) return;
    el.innerHTML = data.tops.map((t) => `
      <article class="top-card ${escapeHtml(t.tier)} reveal">
        <div class="medal">${escapeHtml(t.medal || "🏅")}</div>
        <div class="placement">${escapeHtml(t.placement)}</div>
        <div class="event">${escapeHtml(t.event)}</div>
        <div class="meta">${escapeHtml(t.meta)}</div>
        <span class="tag">${escapeHtml(t.format)}</span>
      </article>`).join("");
  }

  /* ---------- PokéAPI sprite loading (cached) ---------- */
  const POKEAPI = "https://pokeapi.co/api/v2/pokemon/";
  const spriteCache = new Map(); // slug -> Promise<url|null>

  function fetchSprite(slug) {
    if (spriteCache.has(slug)) return spriteCache.get(slug);
    const p = fetch(POKEAPI + encodeURIComponent(slug))
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) return null;
        const s = json.sprites || {};
        // Prefer crisp official artwork, fall back to default front sprite.
        return (
          (s.other && s.other["official-artwork"] && s.other["official-artwork"].front_default) ||
          (s.other && s.other.home && s.other.home.front_default) ||
          s.front_default ||
          null
        );
      })
      .catch(() => null);
    spriteCache.set(slug, p);
    return p;
  }

  function hydrateSprites(scope) {
    $$(".mon[data-slug]", scope).forEach((el) => {
      const slug = el.dataset.slug;
      const img = $(".mon-sprite img", el);
      if (!img) return;
      fetchSprite(slug).then((url) => {
        if (url) {
          img.src = url;
          img.addEventListener("error", () => el.classList.add("no-sprite"), { once: true });
        } else {
          el.classList.add("no-sprite");
        }
      });
    });
  }

  /* ---------- Teams (with format filter + sprites) ---------- */
  function renderTeams() {
    const grid = $("#teams-grid");
    const filters = $("#team-filters");
    if (!grid || !data.teams) return;

    const formats = ["All", ...Array.from(new Set(data.teams.map((t) => t.format)))];

    if (filters) {
      filters.innerHTML = formats.map((f, i) =>
        `<button class="filter-btn${i === 0 ? " active" : ""}" data-format="${escapeHtml(f)}">${escapeHtml(f)}</button>`
      ).join("");
    }

    const monHtml = (m) => {
      // Support both rich objects and plain-string placeholders.
      if (typeof m === "string") {
        return `<li class="mon mon--plain"><span class="mon-name">${escapeHtml(m)}</span></li>`;
      }
      const details = [
        m.item ? `@ ${m.item}` : "",
        m.ability ? `Ability: ${m.ability}` : "",
        m.tera ? `Tera: ${m.tera}` : ""
      ].filter(Boolean).join(" · ");
      const moves = (m.moves || []).map((mv) => `<li>${escapeHtml(mv)}</li>`).join("");
      return `
        <li class="mon" data-slug="${escapeHtml(m.slug)}">
          <div class="mon-sprite">
            <img alt="${escapeHtml(m.name)}" loading="lazy"
                 src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3C/svg%3E" />
          </div>
          <span class="mon-name">${escapeHtml(m.name)}</span>
          <div class="mon-card">
            <strong>${escapeHtml(m.name)}</strong>
            ${details ? `<em>${escapeHtml(details)}</em>` : ""}
            <ul class="mon-moves">${moves}</ul>
          </div>
        </li>`;
    };

    const cardHtml = (t) => `
      <article class="team-card reveal in" data-format="${escapeHtml(t.format)}">
        <div class="team-top">
          <h3>${escapeHtml(t.name)}</h3>
          <span class="format">${escapeHtml(t.format)}</span>
        </div>
        <div class="result">${escapeHtml(t.result)}</div>
        <ul class="team-mons team-mons--sprites">
          ${t.mons.map(monHtml).join("")}
        </ul>
        ${t.note ? `<p class="team-note">${escapeHtml(t.note)}</p>` : ""}
        ${t.pokepaste ? `<a class="team-paste" href="${escapeHtml(t.pokepaste)}" target="_blank" rel="noopener">View full team sheet →</a>` : ""}
      </article>`;

    const paint = (fmt) => {
      const list = fmt === "All" ? data.teams : data.teams.filter((t) => t.format === fmt);
      grid.innerHTML = list.map(cardHtml).join("");
      hydrateSprites(grid);
    };
    paint("All");

    if (filters) {
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-btn");
        if (!btn) return;
        $$(".filter-btn", filters).forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        paint(btn.dataset.format);
      });
    }
  }

  /* ---------- Videos ---------- */
  function renderVideos() {
    const el = $("#videos-grid");
    const channelLink = $("#channel-link");
    if (channelLink && data.channelUrl) channelLink.href = data.channelUrl;
    if (!el || !data.videos) return;
    el.innerHTML = data.videos.map((v) => `
      <article class="video-card reveal">
        <div class="video-embed">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}"
            title="${escapeHtml(v.title)}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
        <div class="video-meta">
          <h3>${escapeHtml(v.title)}</h3>
          <p>${escapeHtml(v.desc || "")}</p>
        </div>
      </article>`).join("");
  }

  /* ---------- Coaching plans ---------- */
  function renderCoaching() {
    const el = $("#coaching-plans");
    if (!el || !data.coachingPlans) return;
    el.innerHTML = data.coachingPlans.map((p) => `
      <article class="plan-card${p.featured ? " featured" : ""} reveal">
        ${p.featured ? `<span class="plan-badge">Most Popular</span>` : ""}
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price">${escapeHtml(p.price)} <small>${escapeHtml(p.per || "")}</small></div>
        <ul>${p.perks.map((perk) => `<li>${escapeHtml(perk)}</li>`).join("")}</ul>
      </article>`).join("");
  }

  /* ---------- Coaching form ---------- */
  function wireForm() {
    const form = $("#contract-form");
    const note = $("#form-note");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#c-name").value.trim();
      const email = $("#c-email").value.trim();
      const agree = $("#c-agree").checked;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !emailOk || !agree) {
        note.textContent = !agree
          ? "Please agree to the coaching terms to continue."
          : "Please enter your name and a valid email.";
        note.className = "form-note err";
        return;
      }
      const plan = $("#c-plan").value;
      note.textContent = `Thanks ${name}! Your request for the "${plan}" plan has been noted. Jano will reach out at ${email}.`;
      note.className = "form-note ok";
      form.reset();
    });
  }

  /* ---------- Mobile nav ---------- */
  function wireNav() {
    const toggle = $(".nav-toggle");
    const links = $(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  function wireReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      items.forEach((i) => i.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((i) => io.observe(i));
  }

  /* ---------- Footer year ---------- */
  function setYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderStats();
    renderHistory();
    renderTops();
    renderTeams();
    renderVideos();
    renderCoaching();
    wireForm();
    wireNav();
    setYear();
    // reveal runs last so freshly-rendered nodes are observed
    wireReveal();
  });
})();
