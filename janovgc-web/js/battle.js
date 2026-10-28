/* ============================================================
   JanoVGC Battle Lab
   ------------------------------------------------------------
   A dependency-free, Showdown-inspired 6v6 singles exhibition.
   It intentionally uses simplified battle mechanics rather than
   claiming simulator parity with Pokémon Showdown or the games.
   Pokémon stats, typing, move data, and artwork come from PokéAPI.
   ============================================================ */

(function () {
  "use strict";

  const siteData = window.JANO_DATA || {};
  const POKE_API = "https://pokeapi.co/api/v2";
  const STORAGE_KEY = "janovgc-battle-builder-v1";
  const LEVEL = 50;
  const EMPTY_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3C/svg%3E";
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 0 : ms));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomChoice = (list) => list[Math.floor(Math.random() * list.length)];
  const escapeHtml = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const toId = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  /* Offensive type chart: super-effective, resisted, immune. */
  const TYPE_CHART = {
    normal:   { strong: [], weak: ["rock", "steel"], immune: ["ghost"] },
    fire:     { strong: ["grass", "ice", "bug", "steel"], weak: ["fire", "water", "rock", "dragon"], immune: [] },
    water:    { strong: ["fire", "ground", "rock"], weak: ["water", "grass", "dragon"], immune: [] },
    electric: { strong: ["water", "flying"], weak: ["electric", "grass", "dragon"], immune: ["ground"] },
    grass:    { strong: ["water", "ground", "rock"], weak: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], immune: [] },
    ice:      { strong: ["grass", "ground", "flying", "dragon"], weak: ["fire", "water", "ice", "steel"], immune: [] },
    fighting: { strong: ["normal", "ice", "rock", "dark", "steel"], weak: ["poison", "flying", "psychic", "bug", "fairy"], immune: ["ghost"] },
    poison:   { strong: ["grass", "fairy"], weak: ["poison", "ground", "rock", "ghost"], immune: ["steel"] },
    ground:   { strong: ["fire", "electric", "poison", "rock", "steel"], weak: ["grass", "bug"], immune: ["flying"] },
    flying:   { strong: ["grass", "fighting", "bug"], weak: ["electric", "rock", "steel"], immune: [] },
    psychic:  { strong: ["fighting", "poison"], weak: ["psychic", "steel"], immune: ["dark"] },
    bug:      { strong: ["grass", "psychic", "dark"], weak: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], immune: [] },
    rock:     { strong: ["fire", "ice", "flying", "bug"], weak: ["fighting", "ground", "steel"], immune: [] },
    ghost:    { strong: ["psychic", "ghost"], weak: ["dark"], immune: ["normal"] },
    dragon:   { strong: ["dragon"], weak: ["steel"], immune: ["fairy"] },
    dark:     { strong: ["psychic", "ghost"], weak: ["fighting", "dark", "fairy"], immune: [] },
    steel:    { strong: ["ice", "rock", "fairy"], weak: ["fire", "water", "electric", "steel"], immune: [] },
    fairy:    { strong: ["fighting", "dragon", "dark"], weak: ["fire", "poison", "steel"], immune: [] },
    stellar:  { strong: [], weak: [], immune: [] }
  };

  const MOVE_FALLBACKS = {
    protect: { power: 0, type: "normal", category: "status", accuracy: null, priority: 4, pp: 10 },
    detect: { power: 0, type: "fighting", category: "status", accuracy: null, priority: 4, pp: 5 },
    "spiky-shield": { power: 0, type: "grass", category: "status", accuracy: null, priority: 4, pp: 10 },
    "follow-me": { power: 0, type: "normal", category: "status", accuracy: null, priority: 2, pp: 20 },
    "rage-powder": { power: 0, type: "bug", category: "status", accuracy: null, priority: 2, pp: 20 },
    "helping-hand": { power: 0, type: "normal", category: "status", accuracy: null, priority: 5, pp: 20 },
    "will-o-wisp": { power: 0, type: "fire", category: "status", accuracy: 85, priority: 0, pp: 15 },
    "thunder-wave": { power: 0, type: "electric", category: "status", accuracy: 90, priority: 0, pp: 20 },
    spore: { power: 0, type: "grass", category: "status", accuracy: 100, priority: 0, pp: 15 },
    yawn: { power: 0, type: "normal", category: "status", accuracy: null, priority: 0, pp: 10 },
    taunt: { power: 0, type: "dark", category: "status", accuracy: 100, priority: 0, pp: 20 },
    "nasty-plot": { power: 0, type: "dark", category: "status", accuracy: null, priority: 0, pp: 20 },
    "calm-mind": { power: 0, type: "psychic", category: "status", accuracy: null, priority: 0, pp: 20 },
    "quiver-dance": { power: 0, type: "bug", category: "status", accuracy: null, priority: 0, pp: 20 },
    "bulk-up": { power: 0, type: "fighting", category: "status", accuracy: null, priority: 0, pp: 20 },
    tailwind: { power: 0, type: "flying", category: "status", accuracy: null, priority: 0, pp: 15 },
    haze: { power: 0, type: "ice", category: "status", accuracy: null, priority: 0, pp: 30 },
    "rain-dance": { power: 0, type: "water", category: "status", accuracy: null, priority: 0, pp: 5 },
    substitute: { power: 0, type: "normal", category: "status", accuracy: null, priority: 0, pp: 10 },
    roost: { power: 0, type: "flying", category: "status", accuracy: null, priority: 0, pp: 5 },
    "heal-pulse": { power: 0, type: "psychic", category: "status", accuracy: null, priority: 0, pp: 10 },
    "parting-shot": { power: 0, type: "dark", category: "status", accuracy: 100, priority: 0, pp: 20 },
    "super-fang": { power: 0, type: "normal", category: "physical", accuracy: 90, priority: 0, pp: 10 },
    fissure: { power: 0, type: "ground", category: "physical", accuracy: 30, priority: 0, pp: 5 },
    "final-gambit": { power: 0, type: "fighting", category: "special", accuracy: 100, priority: 0, pp: 5 },
    "beat-up": { power: 10, type: "dark", category: "physical", accuracy: 100, priority: 0, pp: 10 },
    "tera-starstorm": { power: 120, type: "stellar", category: "special", accuracy: 100, priority: 0, pp: 5 },
    struggle: { power: 50, type: "normal", category: "physical", accuracy: null, priority: 0, pp: 1 }
  };

  const SELF_STATUS_MOVES = new Set([
    "protect", "detect", "spiky-shield", "nasty-plot", "calm-mind", "quiver-dance",
    "bulk-up", "tailwind", "rain-dance", "substitute", "roost", "heal-pulse",
    "follow-me", "rage-powder", "helping-hand", "haze"
  ]);
  const PROTECT_MOVES = new Set(["protect", "detect", "spiky-shield"]);
  const CONDITIONAL_PRIORITY = new Set(["sucker-punch", "thunderclap"]);
  const ALWAYS_CRIT = new Set(["wicked-blow", "surging-strikes"]);
  const DRAIN_MOVES = new Set(["drain-punch", "draining-kiss", "horn-leech"]);
  const RECOIL_MOVES = new Set(["flare-blitz", "wild-charge", "wave-crash", "wood-hammer"]);

  const pokemonCache = new Map();
  const moveCache = new Map();
  let root = null;
  let catalog = [];
  let selectedSlugs = [];
  let opponentIndex = 0;
  let catalogQuery = "";
  let setupMessage = "";
  let game = null;
  let entityCounter = 0;

  function typeEffectiveness(attackType, defenderTypes) {
    const chart = TYPE_CHART[attackType] || TYPE_CHART.normal;
    return (defenderTypes || ["normal"]).reduce((multiplier, type) => {
      if (chart.immune.includes(type)) return 0;
      if (chart.strong.includes(type)) return multiplier * 2;
      if (chart.weak.includes(type)) return multiplier * 0.5;
      return multiplier;
    }, 1);
  }

  function getCurrentTypes(mon) {
    if (mon.teraActive && mon.teraType !== "stellar") return [mon.teraType];
    return mon.types;
  }

  function stageMultiplier(stage) {
    const safeStage = clamp(stage || 0, -6, 6);
    return safeStage >= 0 ? (2 + safeStage) / 2 : 2 / (2 - safeStage);
  }

  function getFallbackPokemon(slug) {
    return {
      slug,
      name: slug,
      types: ["normal"],
      stats: { hp: 85, attack: 85, defense: 85, specialAttack: 85, specialDefense: 85, speed: 85 },
      artwork: null,
      sprite: null
    };
  }

  function fetchPokemon(slug) {
    if (pokemonCache.has(slug)) return pokemonCache.get(slug);
    const request = fetch(`${POKE_API}/pokemon/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`PokéAPI returned ${response.status}`);
        return response.json();
      })
      .then((json) => {
        const values = Object.fromEntries(json.stats.map((entry) => [entry.stat.name, entry.base_stat]));
        const sprites = json.sprites || {};
        const other = sprites.other || {};
        return {
          slug,
          name: json.name,
          types: json.types.map((entry) => entry.type.name),
          stats: {
            hp: values.hp || 85,
            attack: values.attack || 85,
            defense: values.defense || 85,
            specialAttack: values["special-attack"] || 85,
            specialDefense: values["special-defense"] || 85,
            speed: values.speed || 85
          },
          artwork: (other["official-artwork"] && other["official-artwork"].front_default) ||
            (other.home && other.home.front_default) || sprites.front_default || null,
          sprite: sprites.front_default || null
        };
      })
      .catch(() => getFallbackPokemon(slug));
    pokemonCache.set(slug, request);
    return request;
  }

  function fetchMove(displayName) {
    const id = toId(displayName);
    if (moveCache.has(id)) return moveCache.get(id);
    const fallback = MOVE_FALLBACKS[id] || {};
    const request = fetch(`${POKE_API}/move/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`PokéAPI returned ${response.status}`);
        return response.json();
      })
      .then((json) => ({
        id,
        name: displayName,
        power: fallback.power != null ? fallback.power : (json.power || 0),
        type: fallback.type || (json.type && json.type.name) || "normal",
        category: fallback.category || (json.damage_class && json.damage_class.name) || "physical",
        accuracy: fallback.accuracy !== undefined ? fallback.accuracy : json.accuracy,
        priority: fallback.priority != null ? fallback.priority : (json.priority || 0),
        maxPp: fallback.pp || json.pp || 10,
        effectChance: json.effect_chance || 0
      }))
      .catch(() => ({
        id,
        name: displayName,
        power: fallback.power != null ? fallback.power : 70,
        type: fallback.type || "normal",
        category: fallback.category || "physical",
        accuracy: fallback.accuracy !== undefined ? fallback.accuracy : 100,
        priority: fallback.priority || 0,
        maxPp: fallback.pp || 10,
        effectChance: 0
      }));
    moveCache.set(id, request);
    return request;
  }

  function buildCatalog() {
    const builds = new Map();
    (siteData.teams || []).forEach((team) => {
      (team.mons || []).forEach((mon) => {
        if (!mon || typeof mon !== "object" || !mon.slug || builds.has(mon.slug)) return;
        builds.set(mon.slug, {
          ...mon,
          moves: [...(mon.moves || [])],
          sourceTeam: team.name,
          sourceFormat: team.format
        });
      });
    });
    return Array.from(builds.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  function findBuild(slug) {
    return catalog.find((build) => build.slug === slug);
  }

  function saveBuilder() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        selectedSlugs,
        opponent: siteData.teams[opponentIndex] ? siteData.teams[opponentIndex].name : ""
      }));
    } catch (_) {
      // Storage is optional; the battle remains fully functional without it.
    }
  }

  function restoreBuilder() {
    opponentIndex = Math.max(0, (siteData.teams || []).findIndex((team) => team.name.includes("Gdańsk")));
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved) return;
      const available = new Set(catalog.map((build) => build.slug));
      selectedSlugs = Array.isArray(saved.selectedSlugs)
        ? saved.selectedSlugs.filter((slug, index, list) => available.has(slug) && list.indexOf(slug) === index).slice(0, 6)
        : [];
      const savedOpponent = (siteData.teams || []).findIndex((team) => team.name === saved.opponent);
      if (savedOpponent >= 0) opponentIndex = savedOpponent;
    } catch (_) {
      selectedSlugs = [];
    }
  }

  function spriteMarkup(slug, name, extraClass = "") {
    return `<span class="battle-sprite ${extraClass}" data-battle-sprite="${escapeHtml(slug)}">
      <img src="${EMPTY_IMAGE}" alt="${escapeHtml(name)}" loading="lazy" />
    </span>`;
  }

  function hydrateBattleSprites(scope) {
    $$('[data-battle-sprite]', scope).forEach((holder) => {
      const slug = holder.dataset.battleSprite;
      const image = $("img", holder);
      if (!slug || !image) return;
      fetchPokemon(slug).then((pokemon) => {
        if (!holder.isConnected) return;
        const source = pokemon.artwork || pokemon.sprite;
        if (source) image.src = source;
        else holder.classList.add("battle-sprite--missing");
        image.addEventListener("error", () => holder.classList.add("battle-sprite--missing"), { once: true });
      });
    });
  }

  function opponentPreviewHtml(team) {
    return `<div class="battle-opponent-preview" aria-label="Jano's selected roster">
      ${(team.mons || []).map((mon) => `
        <div class="battle-preview-mon" title="${escapeHtml(mon.name)}">
          ${spriteMarkup(mon.slug, mon.name)}
          <span>${escapeHtml(mon.name)}</span>
        </div>`).join("")}
    </div>`;
  }

  function selectedSlotsHtml() {
    return Array.from({ length: 6 }, (_, index) => {
      const build = findBuild(selectedSlugs[index]);
      if (!build) {
        return `<div class="builder-slot builder-slot--empty">
          <span class="builder-slot-number">${index + 1}</span>
          <span>Empty slot</span>
        </div>`;
      }
      return `<button class="builder-slot builder-slot--filled" type="button"
        data-battle-action="remove" data-slug="${escapeHtml(build.slug)}"
        aria-label="Remove ${escapeHtml(build.name)} from your team">
        ${index === 0 ? '<span class="builder-lead">Lead</span>' : ""}
        ${spriteMarkup(build.slug, build.name)}
        <strong>${escapeHtml(build.name)}</strong>
        <small>${escapeHtml(build.tera)} Tera · click to remove</small>
      </button>`;
    }).join("");
  }

  function catalogCardsHtml() {
    const words = catalogQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const visible = catalog.filter((build) => {
      const haystack = `${build.name} ${build.sourceTeam} ${build.sourceFormat} ${(build.moves || []).join(" ")}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });

    if (!visible.length) {
      return '<p class="battle-empty">No Pokémon match that search.</p>';
    }

    return visible.map((build) => {
      const selected = selectedSlugs.includes(build.slug);
      return `<button class="catalog-mon${selected ? " is-selected" : ""}" type="button"
        data-battle-action="add" data-slug="${escapeHtml(build.slug)}" ${selected ? "disabled" : ""}>
        ${spriteMarkup(build.slug, build.name)}
        <span class="catalog-mon-copy">
          <strong>${escapeHtml(build.name)}</strong>
          <small>${escapeHtml(build.item)} · Tera ${escapeHtml(build.tera)}</small>
          <em>${escapeHtml(build.sourceFormat)} set</em>
        </span>
        <span class="catalog-add" aria-hidden="true">${selected ? "✓" : "+"}</span>
      </button>`;
    }).join("");
  }

  function renderCatalogOnly() {
    const list = $("#battle-catalog-list", root);
    if (!list) return;
    list.innerHTML = catalogCardsHtml();
    hydrateBattleSprites(list);
  }

  function renderBuilder() {
    const opponent = siteData.teams[opponentIndex] || siteData.teams[0];
    const complete = selectedSlugs.length === 6;
    root.innerHTML = `
      <div class="battle-builder">
        <section class="builder-panel builder-panel--settings">
          <div class="builder-panel-head">
            <span class="builder-step">01</span>
            <div><p>Choose your opponent</p><h3>Jano's tournament team</h3></div>
          </div>
          <label class="battle-label" for="battle-opponent">Tournament roster</label>
          <select class="battle-select" id="battle-opponent">
            ${siteData.teams.map((team, index) => `<option value="${index}" ${index === opponentIndex ? "selected" : ""}>${escapeHtml(team.name)} · ${escapeHtml(team.format)}</option>`).join("")}
          </select>
          <p class="builder-opponent-result">${escapeHtml(opponent.result)}</p>
          ${opponentPreviewHtml(opponent)}
        </section>

        <section class="builder-panel builder-panel--team">
          <div class="builder-panel-head builder-panel-head--row">
            <div class="builder-heading-copy">
              <span class="builder-step">02</span>
              <div><p>Build your side</p><h3>Your six Pokémon</h3></div>
            </div>
            <strong class="builder-count${complete ? " is-complete" : ""}">${selectedSlugs.length}/6</strong>
          </div>
          <p class="builder-help">Pick six unique Pokémon from Jano's competitive roster archive. Slot 1 becomes your lead.</p>
          <div class="builder-slots">${selectedSlotsHtml()}</div>
          <div class="builder-actions">
            <button class="btn btn-ghost" type="button" data-battle-action="random-team">Random six</button>
            <button class="btn btn-ghost" type="button" data-battle-action="clear-team" ${selectedSlugs.length ? "" : "disabled"}>Clear</button>
            <button class="btn btn-primary builder-start" type="button" data-battle-action="start" ${complete ? "" : "disabled"}>Battle Jano</button>
          </div>
          ${setupMessage ? `<p class="builder-message" role="status">${escapeHtml(setupMessage)}</p>` : ""}
        </section>

        <section class="builder-panel builder-panel--catalog">
          <div class="builder-panel-head">
            <span class="builder-step">03</span>
            <div><p>Team builder</p><h3>Competitive roster library</h3></div>
          </div>
          <label class="battle-search-wrap" for="battle-search">
            <span aria-hidden="true">⌕</span>
            <input id="battle-search" class="battle-search" type="search" value="${escapeHtml(catalogQuery)}"
              placeholder="Search Pokémon, move, format or event…" autocomplete="off" />
          </label>
          <div class="battle-catalog" id="battle-catalog-list">${catalogCardsHtml()}</div>
        </section>
      </div>`;
    hydrateBattleSprites(root);
  }

  function renderLoading() {
    root.innerHTML = `
      <div class="battle-loading" role="status" aria-live="polite">
        <span class="battle-loader" aria-hidden="true"></span>
        <p>Preparing both teams…</p>
        <strong>Loading stats, typings and moves from PokéAPI</strong>
      </div>`;
  }

  function calculateStats(baseStats) {
    const iv = 31;
    const evContribution = 21; // roughly 84 EVs per stat for a neutral exhibition spread
    return {
      hp: Math.floor(((2 * baseStats.hp + iv + evContribution) * LEVEL) / 100) + LEVEL + 10,
      attack: Math.floor(((2 * baseStats.attack + iv + evContribution) * LEVEL) / 100) + 5,
      defense: Math.floor(((2 * baseStats.defense + iv + evContribution) * LEVEL) / 100) + 5,
      specialAttack: Math.floor(((2 * baseStats.specialAttack + iv + evContribution) * LEVEL) / 100) + 5,
      specialDefense: Math.floor(((2 * baseStats.specialDefense + iv + evContribution) * LEVEL) / 100) + 5,
      speed: Math.floor(((2 * baseStats.speed + iv + evContribution) * LEVEL) / 100) + 5
    };
  }

  async function createCombatant(build, sideKey, index) {
    const [pokemon, moves] = await Promise.all([
      fetchPokemon(build.slug),
      Promise.all((build.moves || []).map(fetchMove))
    ]);
    const stats = calculateStats(pokemon.stats);
    return {
      id: `${sideKey}-${index}-${++entityCounter}`,
      sideKey,
      build: { ...build, moves: [...(build.moves || [])] },
      name: build.name,
      slug: build.slug,
      item: build.item || "No item",
      ability: build.ability || "No ability",
      teraType: String(build.tera || pokemon.types[0] || "normal").toLowerCase(),
      teraActive: false,
      types: pokemon.types,
      artwork: pokemon.artwork || pokemon.sprite,
      stats,
      baseAttack: pokemon.stats.attack,
      maxHp: stats.hp,
      hp: stats.hp,
      moves: moves.map((move) => ({ ...move, pp: move.maxPp })),
      stages: { attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      status: null,
      sleepTurns: 0,
      drowsyTurns: 0,
      tauntTurns: 0,
      substituteHp: 0,
      protected: false,
      protectKind: "",
      flinched: false,
      focusBoost: 1,
      activeTurns: 0,
      hasActedSinceEntry: false,
      hasSwitched: false,
      berryUsed: false,
      sashUsed: false,
      flashFire: false,
      fainted: false
    };
  }

  async function prepareTeam(builds, sideKey) {
    return Promise.all(builds.map((build, index) => createCombatant(build, sideKey, index)));
  }

  function addLog(message, tone = "normal") {
    if (!game) return;
    game.logs.push({ message, tone, id: `${Date.now()}-${game.logs.length}` });
    if (game.logs.length > 120) game.logs.shift();
  }

  function activeMon(sideKey) {
    const side = game[sideKey];
    return side && side.team[side.active];
  }

  function opponentKey(sideKey) {
    return sideKey === "player" ? "ai" : "player";
  }

  function sideLabel(sideKey) {
    return sideKey === "player" ? "You" : "Jano";
  }

  function aliveBench(sideKey) {
    const side = game[sideKey];
    return side.team.map((mon, index) => ({ mon, index }))
      .filter((entry) => entry.index !== side.active && !entry.mon.fainted);
  }

  function allFainted(sideKey) {
    return game[sideKey].team.every((mon) => mon.fainted);
  }

  function statLabel(stat) {
    return ({
      attack: "Attack", defense: "Defense", specialAttack: "Sp. Atk",
      specialDefense: "Sp. Def", speed: "Speed"
    })[stat] || stat;
  }

  function changeStage(mon, stat, amount, announce = true, causedByOpponent = false) {
    const previous = mon.stages[stat] || 0;
    mon.stages[stat] = clamp(previous + amount, -6, 6);
    const actual = mon.stages[stat] - previous;
    if (announce) {
      if (!actual) addLog(`${mon.name}'s ${statLabel(stat)} cannot change further.`);
      else addLog(`${mon.name}'s ${statLabel(stat)} ${actual > 0 ? "rose" : "fell"}${Math.abs(actual) > 1 ? " sharply" : ""}!`, actual > 0 ? "good" : "bad");
    }
    if (actual < 0 && causedByOpponent && mon.ability === "Defiant") {
      const before = mon.stages.attack;
      mon.stages.attack = clamp(mon.stages.attack + 2, -6, 6);
      if (mon.stages.attack !== before) addLog(`${mon.name}'s Defiant sharply raised its Attack!`, "good");
    }
  }

  function heal(mon, amount, reason) {
    if (mon.fainted || mon.hp <= 0) return 0;
    const healed = Math.min(Math.max(1, Math.floor(amount)), mon.maxHp - mon.hp);
    if (healed <= 0) return 0;
    mon.hp += healed;
    addLog(`${mon.name} restored ${healed} HP${reason ? ` with ${reason}` : ""}.`, "good");
    return healed;
  }

  function damageDirect(mon, amount, reason) {
    if (mon.fainted) return 0;
    const damage = Math.min(mon.hp, Math.max(1, Math.floor(amount)));
    mon.hp -= damage;
    if (reason) addLog(`${mon.name} lost ${damage} HP ${reason}.`, "bad");
    if (mon.hp <= 0) faint(mon);
    return damage;
  }

  function faint(mon) {
    if (mon.fainted) return;
    mon.hp = 0;
    mon.fainted = true;
    mon.protected = false;
    addLog(`${mon.name} fainted!`, "faint");
  }

  function maybeUseSitrus(mon) {
    if (mon.fainted || mon.berryUsed || mon.item !== "Sitrus Berry" || mon.hp > mon.maxHp / 2) return;
    mon.berryUsed = true;
    heal(mon, mon.maxHp / 4, "its Sitrus Berry");
  }

  function dealDamage(target, amount, source, move) {
    let damage = Math.max(1, Math.floor(amount));
    if (target.substituteHp > 0) {
      const absorbed = Math.min(target.substituteHp, damage);
      target.substituteHp -= damage;
      addLog(`${target.name}'s substitute took ${absorbed} damage.`);
      if (target.substituteHp <= 0) {
        target.substituteHp = 0;
        addLog(`${target.name}'s substitute faded!`, "bad");
      }
      return { damage: absorbed, substitute: true };
    }

    if (!target.sashUsed && target.item === "Focus Sash" && target.hp === target.maxHp && damage >= target.hp) {
      damage = target.hp - 1;
      target.sashUsed = true;
      addLog(`${target.name} held on using its Focus Sash!`, "good");
    }

    damage = Math.min(target.hp, damage);
    target.hp -= damage;
    addLog(`${target.name} lost ${damage} HP.`, "damage");
    if (target.hp <= 0) faint(target);
    else maybeUseSitrus(target);
    return { damage, substitute: false };
  }

  function applyStatus(target, status, sourceMove) {
    if (target.substituteHp > 0) {
      addLog(`${target.name}'s substitute blocked ${sourceMove}.`);
      return false;
    }
    if (target.status) {
      addLog(`${target.name} already has a status condition.`);
      return false;
    }
    const types = getCurrentTypes(target);
    if (status === "burn" && types.includes("fire")) {
      addLog(`${target.name} cannot be burned.`);
      return false;
    }
    if (status === "paralysis" && types.includes("ground")) {
      addLog(`It doesn't affect ${target.name}…`, "bad");
      return false;
    }
    if (status === "sleep" && types.includes("grass") && sourceMove === "Spore") {
      addLog(`${target.name} is immune to Spore.`);
      return false;
    }
    target.status = status;
    if (status === "sleep") target.sleepTurns = 1 + Math.floor(Math.random() * 3);
    const messages = {
      burn: `${target.name} was burned!`,
      paralysis: `${target.name} is paralyzed! It may be unable to move!`,
      sleep: `${target.name} fell asleep!`,
      poison: `${target.name} was poisoned!`
    };
    addLog(messages[status] || `${target.name} was afflicted by ${status}.`, "bad");
    return true;
  }

  function resetStages(mon) {
    Object.keys(mon.stages).forEach((stat) => { mon.stages[stat] = 0; });
  }

  function clearSwitchVolatiles(mon) {
    resetStages(mon);
    mon.substituteHp = 0;
    mon.tauntTurns = 0;
    mon.drowsyTurns = 0;
    mon.protected = false;
    mon.protectKind = "";
    mon.flinched = false;
    mon.focusBoost = 1;
    mon.flashFire = false;
  }

  function effectiveSpeed(mon, side) {
    let speed = mon.stats.speed * stageMultiplier(mon.stages.speed);
    if (mon.status === "paralysis") speed *= 0.5;
    if (mon.item === "Choice Scarf") speed *= 1.5;
    if (side.tailwindTurns > 0) speed *= 2;
    return speed;
  }

  function onEnter(sideKey, initial = false) {
    const mon = activeMon(sideKey);
    const foe = activeMon(opponentKey(sideKey));
    if (!mon || mon.fainted) return;
    mon.protected = false;
    mon.hasActedSinceEntry = false;
    mon.activeTurns = 0;
    if (!initial) addLog(`${sideLabel(sideKey)} sent out ${mon.name}!`, sideKey === "player" ? "good" : "bad");

    if (mon.ability === "Intimidate" && foe && !foe.fainted) {
      addLog(`${mon.name}'s Intimidate activates!`);
      changeStage(foe, "attack", -1, true, true);
    }
    if (mon.ability === "Grassy Surge") {
      game.terrain = "grassy";
      game.terrainTurns = 5;
      addLog(`Grass spread across the battlefield!`, "field");
    }
    if (mon.ability === "Zero to Hero" && mon.hasSwitched) {
      addLog(`${mon.name} returned in its Hero form!`, "good");
    }
  }

  function performSwitch(sideKey, index, forced = false, deferEntry = false) {
    const side = game[sideKey];
    const old = activeMon(sideKey);
    const next = side.team[index];
    if (!next || next.fainted || index === side.active) return false;

    if (old) {
      if (!old.fainted && !forced) {
        old.hasSwitched = true;
        if (old.ability === "Regenerator") heal(old, old.maxHp / 3, "Regenerator");
      }
      clearSwitchVolatiles(old);
    }
    side.active = index;
    if (!deferEntry) onEnter(sideKey);
    return true;
  }

  function chooseBestBench(sideKey) {
    const opponent = activeMon(opponentKey(sideKey));
    const choices = aliveBench(sideKey);
    if (!choices.length) return -1;
    return choices
      .map((entry) => {
        const health = entry.mon.hp / entry.mon.maxHp;
        const bestMatchup = Math.max(...entry.mon.moves.map((move) => {
          if (!move.power) return 15;
          return move.power * typeEffectiveness(resolveMoveType(entry.mon, move), getCurrentTypes(opponent));
        }));
        return { ...entry, score: health * 45 + bestMatchup + Math.random() * 12 };
      })
      .sort((a, b) => b.score - a.score)[0].index;
  }

  function pivotIfPossible(sideKey) {
    const index = chooseBestBench(sideKey);
    if (index >= 0) performSwitch(sideKey, index);
  }

  function resolveMoveType(actor, move) {
    if (move.id === "tera-blast" && actor.teraActive && actor.teraType !== "stellar") return actor.teraType;
    if (move.id === "ivy-cudgel" && actor.slug === "ogerpon-wellspring-mask") return "water";
    if (move.id === "tera-starstorm") return "stellar";
    return move.type || "normal";
  }

  function stabMultiplier(actor, moveType) {
    const originallyStab = actor.types.includes(moveType);
    if (!actor.teraActive) return originallyStab ? 1.5 : 1;
    if (actor.teraType === "stellar") return originallyStab ? 2 : 1.2;
    if (moveType === actor.teraType) return originallyStab ? 2 : 1.5;
    return originallyStab ? 1.5 : 1;
  }

  function itemDamageMultiplier(actor, moveType, category) {
    let multiplier = 1;
    if (actor.item === "Life Orb") multiplier *= 1.3;
    if (actor.item === "Choice Band" && category === "physical") multiplier *= 1.5;
    if (actor.item === "Choice Specs" && category === "special") multiplier *= 1.5;
    if (actor.item === "Mystic Water" && moveType === "water") multiplier *= 1.2;
    if (actor.item === "Miracle Seed" && moveType === "grass") multiplier *= 1.2;
    if (actor.item === "Spell Tag" && moveType === "ghost") multiplier *= 1.2;
    if (actor.item === "Wellspring Mask" && moveType === "water") multiplier *= 1.2;
    if (actor.item === "Booster Energy") multiplier *= 1.12;
    return multiplier;
  }

  function moveHitCount(actor, move, sideKey) {
    if (move.id === "surging-strikes") return 3;
    if (move.id === "scale-shot") return actor.item === "Loaded Dice" ? 4 : 2 + Math.floor(Math.random() * 4);
    if (move.id === "beat-up") return game[sideKey].team.filter((mon) => !mon.fainted && !mon.status).length;
    return 1;
  }

  function calculateDamage(actor, target, move, powerOverride = null) {
    const moveType = resolveMoveType(actor, move);
    const defenderTypes = getCurrentTypes(target);
    const effectiveness = moveType === "stellar" ? 1 : typeEffectiveness(moveType, defenderTypes);
    if (effectiveness === 0) return { damage: 0, effectiveness, critical: false, hits: 1, moveType };

    if (move.id === "fissure") {
      return { damage: target.hp, effectiveness, critical: false, hits: 1, moveType };
    }
    if (move.id === "super-fang") {
      return { damage: Math.max(1, Math.floor(target.hp / 2)), effectiveness, critical: false, hits: 1, moveType };
    }
    if (move.id === "final-gambit") {
      return { damage: actor.hp, effectiveness, critical: false, hits: 1, moveType };
    }

    const power = Math.max(1, powerOverride || move.power || (move.id === "beat-up" ? 10 : 70));
    let category = move.category;
    if (move.id === "tera-blast" && actor.teraActive) {
      category = actor.stats.attack > actor.stats.specialAttack ? "physical" : "special";
    }
    const attackStatName = category === "special" ? "specialAttack" : "attack";
    const defenseStatName = category === "special" ? "specialDefense" : "defense";
    const critical = ALWAYS_CRIT.has(move.id) || Math.random() < 0.0625;

    let attackStage = actor.stages[attackStatName];
    let defenseStage = target.stages[defenseStatName];
    if (target.ability === "Unaware") attackStage = 0;
    if (actor.ability === "Unaware") defenseStage = 0;
    if (critical) {
      attackStage = Math.max(0, attackStage);
      defenseStage = Math.min(0, defenseStage);
    }

    let attack = actor.stats[attackStatName] * stageMultiplier(attackStage);
    let defense = target.stats[defenseStatName] * stageMultiplier(defenseStage);
    if (category === "special" && target.item === "Assault Vest") defense *= 1.5;
    if (category === "physical" && actor.status === "burn") attack *= 0.5;
    if (actor.ability === "Zero to Hero" && actor.hasSwitched) attack *= 1.3;
    if (actor.ability === "Sword of Ruin" && category === "physical") defense *= 0.75;
    if (target.ability === "Vessel of Ruin" && category === "special") attack *= 0.75;

    let modifier = stabMultiplier(actor, moveType) * effectiveness;
    modifier *= 0.85 + Math.random() * 0.15;
    modifier *= itemDamageMultiplier(actor, moveType, category);
    modifier *= actor.focusBoost || 1;
    if (actor.flashFire && moveType === "fire") modifier *= 1.5;
    if (target.ability === "Multiscale" && target.hp === target.maxHp) modifier *= 0.5;
    if (actor.ability === "Sheer Force" && move.effectChance) modifier *= 1.3;
    if (critical) modifier *= 1.5;
    if (game.weather === "rain") {
      if (moveType === "water") modifier *= 1.5;
      if (moveType === "fire") modifier *= 0.5;
    }
    if (game.terrain === "grassy" && moveType === "grass") modifier *= 1.3;

    const base = (((2 * LEVEL / 5 + 2) * power * attack / Math.max(1, defense)) / 50) + 2;
    return { damage: Math.max(1, Math.floor(base * modifier)), effectiveness, critical, hits: 1, moveType };
  }

  function checkAbilityImmunity(target, moveType) {
    if (target.ability === "Water Absorb" && moveType === "water") {
      heal(target, target.maxHp / 4, "Water Absorb");
      addLog(`${target.name} absorbed the Water-type attack!`, "good");
      return true;
    }
    if (target.ability === "Flash Fire" && moveType === "fire") {
      target.flashFire = true;
      addLog(`${target.name}'s Flash Fire absorbed the attack!`, "good");
      return true;
    }
    return false;
  }

  function handleStatusMove(actor, target, move, sideKey) {
    const side = game[sideKey];
    switch (move.id) {
      case "protect":
      case "detect":
      case "spiky-shield":
        actor.protected = true;
        actor.protectKind = move.id;
        addLog(`${actor.name} protected itself!`, "good");
        return true;
      case "nasty-plot":
        changeStage(actor, "specialAttack", 2);
        return true;
      case "calm-mind":
        changeStage(actor, "specialAttack", 1);
        changeStage(actor, "specialDefense", 1);
        return true;
      case "quiver-dance":
        changeStage(actor, "specialAttack", 1);
        changeStage(actor, "specialDefense", 1);
        changeStage(actor, "speed", 1);
        return true;
      case "bulk-up":
        changeStage(actor, "attack", 1);
        changeStage(actor, "defense", 1);
        return true;
      case "tailwind":
        side.tailwindTurns = 4;
        addLog(`A Tailwind blew behind ${sideLabel(sideKey)}'s team!`, "field");
        return true;
      case "rain-dance":
        game.weather = "rain";
        game.weatherTurns = 5;
        addLog(`Rain began to fall!`, "field");
        return true;
      case "haze":
        resetStages(actor);
        resetStages(target);
        addLog(`All stat changes were eliminated!`, "field");
        return true;
      case "substitute": {
        const cost = Math.floor(actor.maxHp / 4);
        if (actor.substituteHp > 0 || actor.hp <= cost) {
          addLog(`${actor.name} couldn't make a substitute.`);
          return true;
        }
        actor.hp -= cost;
        actor.substituteHp = cost;
        addLog(`${actor.name} put in a substitute!`, "good");
        return true;
      }
      case "roost":
      case "heal-pulse":
        heal(actor, actor.maxHp / 2, move.name);
        return true;
      case "will-o-wisp":
        applyStatus(target, "burn", move.name);
        return true;
      case "thunder-wave":
        applyStatus(target, "paralysis", move.name);
        return true;
      case "spore":
        applyStatus(target, "sleep", move.name);
        return true;
      case "yawn":
        if (!target.status && !target.drowsyTurns) {
          target.drowsyTurns = 2;
          addLog(`${target.name} grew drowsy!`, "bad");
        } else addLog(`${target.name} resisted the drowsiness.`);
        return true;
      case "taunt":
        target.tauntTurns = 3;
        addLog(`${target.name} fell for the taunt!`, "bad");
        return true;
      case "follow-me":
      case "rage-powder":
      case "helping-hand":
        actor.focusBoost = 1.3;
        addLog(`${actor.name} focused its next attack!`, "good");
        return true;
      case "parting-shot":
        changeStage(target, "attack", -1, true, true);
        changeStage(target, "specialAttack", -1, true, true);
        pivotIfPossible(sideKey);
        return true;
      default:
        addLog(`${move.name} had no extra effect in this singles exhibition.`);
        return true;
    }
  }

  function handleAfterDamage(actor, target, move, result, sideKey) {
    if (result.hits > 1) addLog(`It hit ${result.hits} times!`);
    if (result.critical) addLog(`A critical hit!`, "critical");
    if (result.effectiveness > 1) addLog(`It's super effective!`, "good");
    if (result.effectiveness > 0 && result.effectiveness < 1) addLog(`It's not very effective…`);

    if (!target.fainted && !result.substitute) {
      if (move.id === "fake-out") {
        target.flinched = true;
        addLog(`${target.name} flinched!`, "bad");
      }
      if (["icy-wind", "electroweb", "rock-tomb"].includes(move.id)) changeStage(target, "speed", -1, true, true);
      if (move.id === "snarl") changeStage(target, "specialAttack", -1, true, true);
      if (move.id === "acid-spray") changeStage(target, "specialDefense", -2, true, true);
      if (move.id === "moonblast" && Math.random() < 0.3) changeStage(target, "specialAttack", -1, true, true);
      if (move.id === "sludge-bomb" && Math.random() < 0.3) applyStatus(target, "poison", move.name);
      if (["heat-wave", "flare-blitz"].includes(move.id) && Math.random() < 0.1) applyStatus(target, "burn", move.name);
      if (move.id === "icicle-crash" && Math.random() < 0.3) target.flinched = true;
    }

    if (["draco-meteor"].includes(move.id)) changeStage(actor, "specialAttack", -2);
    if (move.id === "make-it-rain") changeStage(actor, "specialAttack", -1);
    if (move.id === "close-combat") {
      changeStage(actor, "defense", -1);
      changeStage(actor, "specialDefense", -1);
    }
    if (move.id === "scale-shot") {
      changeStage(actor, "defense", -1);
      changeStage(actor, "speed", 1);
    }

    if (DRAIN_MOVES.has(move.id) && !actor.fainted) heal(actor, result.damage / 2, move.name);
    if (RECOIL_MOVES.has(move.id) && !actor.fainted) damageDirect(actor, result.damage / 3, "from recoil");
    if (actor.item === "Life Orb" && result.damage > 0 && !actor.fainted) damageDirect(actor, actor.maxHp / 10, "from its Life Orb");
    if (move.id === "final-gambit" && !actor.fainted) faint(actor);
    if (move.id === "u-turn" && !actor.fainted) pivotIfPossible(sideKey);
    actor.focusBoost = 1;
  }

  function canAct(actor) {
    if (actor.status === "sleep") {
      if (actor.sleepTurns <= 0) {
        actor.status = null;
        addLog(`${actor.name} woke up!`, "good");
      } else {
        actor.sleepTurns -= 1;
        addLog(`${actor.name} is fast asleep.`, "bad");
        return false;
      }
    }
    if (actor.flinched) {
      actor.flinched = false;
      addLog(`${actor.name} flinched and couldn't move!`, "bad");
      return false;
    }
    if (actor.status === "paralysis" && Math.random() < 0.25) {
      addLog(`${actor.name} is fully paralyzed!`, "bad");
      return false;
    }
    return true;
  }

  function activateTera(sideKey, actor) {
    const side = game[sideKey];
    if (side.teraUsed || actor.teraActive) return;
    side.teraUsed = true;
    actor.teraActive = true;
    addLog(`${actor.name} Terastallized into the ${actor.teraType.toUpperCase()} type!`, "tera");
  }

  async function executeMoveAction(action, opposingAction) {
    const sideKey = action.sideKey;
    const actor = activeMon(sideKey);
    const target = activeMon(opponentKey(sideKey));
    if (!actor || actor.fainted || actor.id !== action.actorId || !target || target.fainted) return;

    const move = action.move;
    const wasFresh = !actor.hasActedSinceEntry;
    actor.hasActedSinceEntry = true;
    if (!canAct(actor)) return;

    if (move.id === "fake-out" && !wasFresh) {
      addLog(`${actor.name} used Fake Out, but it failed!`);
      return;
    }
    if (actor.tauntTurns > 0 && move.category === "status") {
      addLog(`${actor.name} can't use ${move.name} after the taunt!`, "bad");
      return;
    }
    if (CONDITIONAL_PRIORITY.has(move.id) && (!opposingAction || opposingAction.type !== "move" || opposingAction.move.category === "status")) {
      addLog(`${actor.name} used ${move.name}, but it failed!`);
      return;
    }

    if (!action.isStruggle) move.pp = Math.max(0, move.pp - 1);
    addLog(`${actor.name} used ${move.name}!`, sideKey === "player" ? "player-move" : "ai-move");

    const accuracy = move.accuracy == null ? 100 : move.accuracy;
    if (Math.random() * 100 >= accuracy) {
      addLog(`${actor.name}'s attack missed!`, "bad");
      return;
    }

    const targetsSelf = SELF_STATUS_MOVES.has(move.id);
    if (!targetsSelf && target.protected && actor.ability !== "Unseen Fist") {
      addLog(`${target.name} protected itself!`, "good");
      if (target.protectKind === "spiky-shield" && move.category === "physical") {
        damageDirect(actor, actor.maxHp / 8, "on the Spiky Shield");
      }
      return;
    }

    if (move.category === "status") {
      if (!targetsSelf && target.ability === "Good as Gold") {
        addLog(`${target.name}'s Good as Gold blocked the status move!`, "good");
        return;
      }
      handleStatusMove(actor, target, move, sideKey);
      return;
    }

    const moveType = resolveMoveType(actor, move);
    if (checkAbilityImmunity(target, moveType)) return;
    const hitCount = moveHitCount(actor, move, sideKey);
    if (hitCount <= 0) {
      addLog(`${actor.name} had no teammate able to join Beat Up.`);
      return;
    }
    const summary = {
      damage: 0,
      effectiveness: moveType === "stellar" ? 1 : typeEffectiveness(moveType, getCurrentTypes(target)),
      critical: false,
      hits: 0,
      moveType,
      substitute: true
    };
    if (summary.effectiveness === 0) {
      addLog(`It doesn't affect ${target.name}…`, "bad");
      return;
    }

    const beatUpParticipants = move.id === "beat-up"
      ? game[sideKey].team.filter((mon) => !mon.fainted && !mon.status)
      : [];
    for (let hitNumber = 0; hitNumber < hitCount; hitNumber += 1) {
      const participant = beatUpParticipants[hitNumber];
      const hitPower = participant ? Math.floor((participant.baseAttack || 85) / 10) + 5 : null;
      const hit = calculateDamage(actor, target, move, hitPower);
      const dealt = dealDamage(target, hit.damage, actor, move);
      summary.damage += dealt.damage;
      summary.critical = summary.critical || hit.critical;
      summary.hits += 1;
      if (!dealt.substitute) summary.substitute = false;
      if (target.fainted) break;
    }
    handleAfterDamage(actor, target, move, summary, sideKey);
  }

  function actionPriority(action) {
    if (action.type === "switch") return 7;
    let priority = action.move.priority || 0;
    const actor = game[action.sideKey].team.find((mon) => mon.id === action.actorId);
    if (actor && actor.ability === "Prankster" && action.move.category === "status") priority += 1;
    return priority;
  }

  function makeMoveAction(sideKey, moveIndex, tera = false) {
    const actor = activeMon(sideKey);
    const available = actor.moves.filter((move) => move.pp > 0);
    if (moveIndex < 0 || !available.length) {
      return {
        type: "move", sideKey, actorId: actor.id, moveIndex: -1, tera,
        isStruggle: true,
        move: { id: "struggle", name: "Struggle", ...MOVE_FALLBACKS.struggle, pp: 1, maxPp: 1 }
      };
    }
    return { type: "move", sideKey, actorId: actor.id, moveIndex, tera, isStruggle: false, move: actor.moves[moveIndex] };
  }

  function makeSwitchAction(sideKey, index) {
    return { type: "switch", sideKey, actorId: activeMon(sideKey).id, switchIndex: index };
  }

  function statusMoveScore(move, actor, target, side) {
    const hpRatio = actor.hp / actor.maxHp;
    switch (move.id) {
      case "protect": case "detect": case "spiky-shield": return hpRatio < 0.35 ? 58 : 12 + Math.random() * 22;
      case "roost": case "heal-pulse": return hpRatio < 0.55 ? 85 - hpRatio * 50 : 6;
      case "nasty-plot": case "calm-mind": case "quiver-dance": case "bulk-up": return actor.activeTurns < 2 && hpRatio > 0.55 ? 55 : 18;
      case "tailwind": return side.tailwindTurns > 0 ? 3 : 48;
      case "rain-dance": return game.weather === "rain" ? 2 : 35;
      case "haze": return Object.values(target.stages).some((stage) => stage > 0) ? 62 : 5;
      case "will-o-wisp": case "thunder-wave": case "spore": case "yawn": return target.status || target.drowsyTurns ? 4 : 52;
      case "taunt": return target.tauntTurns > 0 ? 3 : 38;
      case "substitute": return actor.substituteHp > 0 || hpRatio < 0.35 ? 3 : 35;
      case "parting-shot": return aliveBench(actor.sideKey).length ? 46 : 4;
      case "follow-me": case "rage-powder": case "helping-hand": return actor.focusBoost > 1 ? 4 : 26;
      default: return 12;
    }
  }

  function estimateMoveScore(move, actor, target, side) {
    if (move.pp <= 0) return -1000;
    if (move.category === "status") return statusMoveScore(move, actor, target, side) + Math.random() * 8;
    const type = resolveMoveType(actor, move);
    const effectiveness = type === "stellar" ? 1 : typeEffectiveness(type, getCurrentTypes(target));
    if (!effectiveness) return -50;
    let score = (move.power || (move.id === "super-fang" ? 80 : 65)) * effectiveness * stabMultiplier(actor, type);
    score *= (move.accuracy == null ? 100 : move.accuracy) / 100;
    if ((move.priority || 0) > 0 && target.hp / target.maxHp < 0.3) score *= 1.35;
    if (DRAIN_MOVES.has(move.id) && actor.hp / actor.maxHp < 0.5) score *= 1.2;
    if (move.id === "fissure") score = 72;
    if (CONDITIONAL_PRIORITY.has(move.id)) score *= 0.8;
    return score + Math.random() * 18;
  }

  function aiMoveIsUsable(move, actor, target, playerAction) {
    if (move.pp <= 0) return false;
    if (move.id === "fake-out" && actor.hasActedSinceEntry) return false;
    if (actor.tauntTurns > 0 && move.category === "status") return false;
    if (CONDITIONAL_PRIORITY.has(move.id) &&
      (!playerAction || playerAction.type !== "move" || playerAction.move.category === "status")) return false;

    if (move.category !== "status") {
      const type = resolveMoveType(actor, move);
      if (type !== "stellar" && typeEffectiveness(type, getCurrentTypes(target)) === 0) return false;
      if (target.ability === "Water Absorb" && type === "water") return false;
      if (target.ability === "Flash Fire" && type === "fire") return false;
      return true;
    }

    if (SELF_STATUS_MOVES.has(move.id)) {
      if (move.id === "substitute" && (actor.substituteHp > 0 || actor.hp <= actor.maxHp / 4)) return false;
      if (["roost", "heal-pulse"].includes(move.id) && actor.hp === actor.maxHp) return false;
      return true;
    }
    if (target.ability === "Good as Gold") return false;
    if (["will-o-wisp", "thunder-wave", "spore", "yawn"].includes(move.id) && (target.status || target.drowsyTurns)) return false;
    if (["will-o-wisp", "thunder-wave", "spore"].includes(move.id) && target.substituteHp > 0) return false;
    const targetTypes = getCurrentTypes(target);
    if (move.id === "will-o-wisp" && targetTypes.includes("fire")) return false;
    if (move.id === "thunder-wave" && targetTypes.includes("ground")) return false;
    if (move.id === "spore" && targetTypes.includes("grass")) return false;
    return true;
  }

  function chooseAiAction(playerAction) {
    const side = game.ai;
    const actor = activeMon("ai");
    const target = activeMon("player");
    const scored = actor.moves.map((move, index) => ({ index, move, score: estimateMoveScore(move, actor, target, side) }))
      .filter((entry) => aiMoveIsUsable(entry.move, actor, target, playerAction))
      .sort((a, b) => b.score - a.score);
    const bench = aliveBench("ai");
    const healthRatio = actor.hp / actor.maxHp;
    const poorMatchup = !scored.length || scored[0].score < 28;
    if (bench.length && ((healthRatio < 0.22 && Math.random() < 0.5) || (poorMatchup && Math.random() < 0.7))) {
      const index = chooseBestBench("ai");
      if (index >= 0) return makeSwitchAction("ai", index);
    }
    if (!scored.length) return makeMoveAction("ai", -1, false);
    const pool = scored.slice(0, Math.min(3, scored.length));
    const picked = Math.random() < 0.72 ? pool[0] : randomChoice(pool);
    const tera = !side.teraUsed && !actor.teraActive &&
      (picked.score > 145 || healthRatio < 0.42) && Math.random() < 0.58;
    return makeMoveAction("ai", picked.index, tera);
  }

  async function executeAction(action, opposingAction, battle) {
    if (game !== battle) return;
    const currentActor = activeMon(action.sideKey);
    if (!currentActor || currentActor.fainted || currentActor.id !== action.actorId) return;
    if (action.type === "switch") {
      performSwitch(action.sideKey, action.switchIndex);
      renderBattle();
      await wait(420);
      return;
    }
    await executeMoveAction(action, opposingAction);
    renderBattle();
    await wait(520);
  }

  function endTurnEffects() {
    ["player", "ai"].forEach((sideKey) => {
      const mon = activeMon(sideKey);
      if (!mon || mon.fainted) return;
      mon.protected = false;
      mon.protectKind = "";
      mon.flinched = false;
      mon.activeTurns += 1;
      if (mon.tauntTurns > 0) mon.tauntTurns -= 1;
      if (mon.drowsyTurns > 0) {
        mon.drowsyTurns -= 1;
        if (mon.drowsyTurns === 0 && !mon.status) applyStatus(mon, "sleep", "Yawn");
      }
      if (mon.status === "burn") damageDirect(mon, mon.maxHp / 16, "from its burn");
      if (mon.status === "poison") damageDirect(mon, mon.maxHp / 8, "from poison");
      if (!mon.fainted && mon.item === "Leftovers") heal(mon, mon.maxHp / 16, "Leftovers");
      if (!mon.fainted && game.terrain === "grassy") heal(mon, mon.maxHp / 16, "the grassy terrain");
    });

    [game.player, game.ai].forEach((side) => {
      if (side.tailwindTurns > 0) side.tailwindTurns -= 1;
    });
    if (game.weatherTurns > 0) {
      game.weatherTurns -= 1;
      if (!game.weatherTurns) {
        game.weather = null;
        addLog(`The rain stopped.`, "field");
      }
    }
    if (game.terrainTurns > 0) {
      game.terrainTurns -= 1;
      if (!game.terrainTurns) {
        game.terrain = null;
        addLog(`The grass disappeared from the battlefield.`, "field");
      }
    }
  }

  function finishBattle(winner) {
    game.phase = "finished";
    game.processing = false;
    game.winner = winner;
    if (winner === "player") addLog(`You defeated the Jano Bot!`, "victory");
    else if (winner === "ai") addLog(`Jano wins the exhibition. Good game!`, "defeat");
    else addLog(`The battle ended in a draw.`, "field");
  }

  function evaluateOutcome() {
    const playerOut = allFainted("player");
    const aiOut = allFainted("ai");
    if (playerOut && aiOut) finishBattle("draw");
    else if (aiOut) finishBattle("player");
    else if (playerOut) finishBattle("ai");
    return playerOut || aiOut;
  }

  function resolveFaintedActives() {
    if (evaluateOutcome()) return;
    const playerNeedsReplacement = activeMon("player").fainted;
    const aiNeedsReplacement = activeMon("ai").fainted;
    game.pendingAiReplacement = null;

    if (aiNeedsReplacement) {
      const replacement = chooseBestBench("ai");
      if (replacement >= 0) {
        if (playerNeedsReplacement) game.pendingAiReplacement = replacement;
        else performSwitch("ai", replacement, true);
      }
    }
    if (playerNeedsReplacement) game.forcedSwitch = true;
  }

  async function resolveTurn(playerAction) {
    if (!game || game.processing || game.phase !== "battle") return;
    const battle = game;
    battle.processing = true;
    battle.switchMode = false;
    battle.teraQueued = false;
    const aiAction = chooseAiAction(playerAction);

    addLog(`Turn ${battle.turn}`, "turn");
    [playerAction, aiAction].forEach((action) => {
      if (action.type !== "move" || !action.tera) return;
      const actor = battle[action.sideKey].team.find((mon) => mon.id === action.actorId);
      if (actor && !actor.fainted && battle[action.sideKey].active === battle[action.sideKey].team.indexOf(actor)) {
        activateTera(action.sideKey, actor);
      }
    });

    const actions = [playerAction, aiAction].sort((left, right) => {
      const priorityDifference = actionPriority(right) - actionPriority(left);
      if (priorityDifference) return priorityDifference;
      const leftActor = battle[left.sideKey].team.find((mon) => mon.id === left.actorId);
      const rightActor = battle[right.sideKey].team.find((mon) => mon.id === right.actorId);
      const speedDifference = effectiveSpeed(rightActor, battle[right.sideKey]) - effectiveSpeed(leftActor, battle[left.sideKey]);
      return speedDifference || (Math.random() < 0.5 ? -1 : 1);
    });

    renderBattle();
    await wait(280);
    if (game !== battle) return;
    for (const action of actions) {
      const other = action === playerAction ? aiAction : playerAction;
      await executeAction(action, other, battle);
      if (game !== battle || battle.phase === "finished") return;
    }

    if (game === battle && battle.phase !== "finished") {
      endTurnEffects();
      resolveFaintedActives();
      if (battle.phase !== "finished") battle.turn += 1;
      battle.processing = false;
      renderBattle();
    }
  }

  function hpBarClass(mon) {
    const ratio = mon.hp / mon.maxHp;
    if (ratio <= 0.2) return "is-critical";
    if (ratio <= 0.5) return "is-low";
    return "";
  }

  function statusCode(mon) {
    return ({ burn: "BRN", paralysis: "PAR", sleep: "SLP", poison: "PSN" })[mon.status] || "";
  }

  function miniRosterHtml(sideKey) {
    const side = game[sideKey];
    return `<div class="battle-team-strip battle-team-strip--${sideKey}" aria-label="${escapeHtml(side.name)} team">
      ${side.team.map((mon, index) => `
        <span class="battle-team-icon${mon.fainted ? " is-fainted" : ""}${index === side.active ? " is-active" : ""}"
          title="${escapeHtml(mon.name)}${mon.fainted ? " — fainted" : ""}">
          ${spriteMarkup(mon.slug, mon.name)}
        </span>`).join("")}
    </div>`;
  }

  function healthPanelHtml(sideKey) {
    const mon = activeMon(sideKey);
    const percent = Math.max(0, Math.round(mon.hp / mon.maxHp * 100));
    const status = statusCode(mon);
    return `<div class="battle-health-panel battle-health-panel--${sideKey}">
      <div class="battle-health-name">
        <strong>${escapeHtml(mon.name)}</strong>
        <span>Lv. ${LEVEL}</span>
        ${mon.teraActive ? `<i class="tera-gem" title="Terastallized">◆ ${escapeHtml(mon.teraType)}</i>` : ""}
      </div>
      <div class="battle-hp-track" role="progressbar" aria-label="${escapeHtml(mon.name)} health"
        aria-valuemin="0" aria-valuemax="${mon.maxHp}" aria-valuenow="${mon.hp}">
        <span class="battle-hp-fill ${hpBarClass(mon)}" style="width:${percent}%"></span>
      </div>
      <div class="battle-health-meta">
        <span>${sideKey === "player" ? `${mon.hp} / ${mon.maxHp}` : `${percent}%`}</span>
        ${status ? `<b class="battle-status battle-status--${escapeHtml(mon.status)}">${status}</b>` : ""}
        ${mon.substituteHp > 0 ? '<b class="battle-sub">SUB</b>' : ""}
      </div>
    </div>`;
  }

  function activeArtworkHtml(sideKey) {
    const mon = activeMon(sideKey);
    return `<div class="battle-active-mon battle-active-mon--${sideKey}${mon.fainted ? " is-fainted" : ""}">
      ${spriteMarkup(mon.slug, mon.name, sideKey === "player" ? "battle-sprite--player" : "battle-sprite--ai")}
      ${mon.substituteHp > 0 ? '<span class="substitute-orb" title="Substitute">SUB</span>' : ""}
    </div>`;
  }

  function fieldBadgesHtml() {
    const badges = [];
    if (game.weather === "rain") badges.push("☂ Rain");
    if (game.terrain === "grassy") badges.push("♧ Grassy Terrain");
    if (game.player.tailwindTurns > 0) badges.push(`↝ Your Tailwind ${game.player.tailwindTurns}`);
    if (game.ai.tailwindTurns > 0) badges.push(`↜ Jano's Tailwind ${game.ai.tailwindTurns}`);
    if (!badges.length) return "";
    return `<div class="battle-field-badges">${badges.map((badge) => `<span>${escapeHtml(badge)}</span>`).join("")}</div>`;
  }

  function logHtml() {
    return game.logs.map((entry) => `<p class="battle-log-line battle-log-line--${escapeHtml(entry.tone)}">${escapeHtml(entry.message)}</p>`).join("");
  }

  function switchChoicesHtml(forced) {
    const choices = aliveBench("player");
    return `<div class="battle-command-copy">
        <span>${forced ? "Choose a replacement" : "Switch Pokémon"}</span>
        <strong>${forced ? "Your active Pokémon fainted" : "Who will come in?"}</strong>
      </div>
      <div class="battle-switch-grid">
        ${choices.map(({ mon, index }) => {
          const percent = Math.round(mon.hp / mon.maxHp * 100);
          return `<button type="button" class="battle-switch-button" data-battle-action="${forced ? "forced-switch" : "choose-switch"}" data-index="${index}">
            ${spriteMarkup(mon.slug, mon.name)}
            <span><strong>${escapeHtml(mon.name)}</strong><small>${percent}% HP</small></span>
          </button>`;
        }).join("")}
      </div>
      ${forced ? "" : '<button class="battle-text-button" type="button" data-battle-action="cancel-switch">← Back to moves</button>'}`;
  }

  function moveControlsHtml() {
    const actor = activeMon("player");
    const noPp = actor.moves.every((move) => move.pp <= 0);
    const moves = noPp
      ? [{ id: "struggle", name: "Struggle", type: "normal", category: "physical", pp: 1, maxPp: 1 }]
      : actor.moves;
    return `<div class="battle-command-copy">
        <span>What will</span>
        <strong>${escapeHtml(actor.name)} do?</strong>
      </div>
      <div class="battle-move-grid">
        ${moves.map((move, index) => `<button type="button" class="battle-move type-${escapeHtml(move.type || "normal")}" data-battle-action="move" data-index="${noPp ? -1 : index}" ${move.pp <= 0 ? "disabled" : ""}>
          <strong>${escapeHtml(move.name)}</strong>
          <span><em>${escapeHtml(move.type || "normal")}</em><small>PP ${move.pp}/${move.maxPp}</small></span>
        </button>`).join("")}
      </div>
      <div class="battle-command-footer">
        <button type="button" class="battle-terastallize${game.teraQueued ? " is-active" : ""}" data-battle-action="toggle-tera"
          ${game.player.teraUsed ? "disabled" : ""}>
          <span>◆</span> ${game.player.teraUsed ? "Tera used" : `Terastallize · ${escapeHtml(actor.teraType)}`}
        </button>
        <button type="button" class="battle-utility" data-battle-action="open-switch" ${aliveBench("player").length ? "" : "disabled"}>Switch</button>
        <button type="button" class="battle-utility battle-utility--danger" data-battle-action="forfeit">Forfeit</button>
      </div>`;
  }

  function finishedControlsHtml() {
    const won = game.winner === "player";
    const draw = game.winner === "draw";
    return `<div class="battle-result ${won ? "battle-result--win" : draw ? "battle-result--draw" : "battle-result--loss"}">
      <span>${won ? "🏆" : draw ? "🤝" : "⚔"}</span>
      <p>${won ? "Victory" : draw ? "Draw" : "Good game"}</p>
      <h3>${won ? "You defeated the Jano Bot!" : draw ? "Both teams went down." : "Jano won this exhibition."}</h3>
      <div class="battle-result-actions">
        <button class="btn btn-primary" type="button" data-battle-action="rematch">Rematch</button>
        <button class="btn btn-ghost" type="button" data-battle-action="edit-team">Edit team</button>
      </div>
    </div>`;
  }

  function commandPanelHtml() {
    if (game.phase === "finished") return finishedControlsHtml();
    if (game.processing) {
      return `<div class="battle-thinking"><span class="battle-loader" aria-hidden="true"></span><strong>Resolving the turn…</strong></div>`;
    }
    if (game.forcedSwitch) return switchChoicesHtml(true);
    if (game.switchMode) return switchChoicesHtml(false);
    return moveControlsHtml();
  }

  function renderBattle() {
    if (!game) return;
    const opponentTeam = siteData.teams[opponentIndex];
    root.innerHTML = `
      <div class="battle-room">
        <div class="battle-room-bar">
          <div><span class="live-dot"></span><strong>Jano Battle Room</strong><small>6v6 Singles Exhibition</small></div>
          <div><span>Turn ${game.turn}</span><button type="button" data-battle-action="edit-team" ${game.processing ? "disabled" : ""}>Exit room</button></div>
        </div>
        <div class="battle-room-grid">
          <section class="battlefield${game.weather === "rain" ? " is-raining" : ""}${game.terrain === "grassy" ? " is-grassy" : ""}" aria-label="Battlefield">
            <div class="battle-trainer battle-trainer--ai">
              <span>JANO BOT</span><strong>${escapeHtml(opponentTeam.name)}</strong>
            </div>
            ${miniRosterHtml("ai")}
            ${healthPanelHtml("ai")}
            ${activeArtworkHtml("ai")}
            <div class="battle-platform battle-platform--ai"></div>
            <div class="battle-platform battle-platform--player"></div>
            ${activeArtworkHtml("player")}
            ${healthPanelHtml("player")}
            ${miniRosterHtml("player")}
            <div class="battle-trainer battle-trainer--player"><span>CHALLENGER</span><strong>You</strong></div>
            ${fieldBadgesHtml()}
          </section>
          <aside class="battle-side-panel">
            <div class="battle-log" id="battle-log" role="log" aria-live="polite" aria-label="Battle log">${logHtml()}</div>
            <div class="battle-commands">${commandPanelHtml()}</div>
          </aside>
        </div>
        <p class="battle-engine-note">Arcade rules: stats and move data come from PokéAPI; complex VGC mechanics are simplified for this browser exhibition.</p>
      </div>`;
    hydrateBattleSprites(root);
    window.requestAnimationFrame(() => {
      const log = $("#battle-log", root);
      if (log) log.scrollTop = log.scrollHeight;
    });
  }

  async function startBattle() {
    if (selectedSlugs.length !== 6 || game && game.processing) return;
    setupMessage = "";
    renderLoading();
    const playerBuilds = selectedSlugs.map(findBuild).filter(Boolean);
    const opponent = siteData.teams[opponentIndex];
    try {
      const [playerTeam, aiTeam] = await Promise.all([
        prepareTeam(playerBuilds, "player"),
        prepareTeam(opponent.mons, "ai")
      ]);
      game = {
        phase: "battle",
        turn: 1,
        processing: false,
        switchMode: false,
        forcedSwitch: false,
        pendingAiReplacement: null,
        teraQueued: false,
        winner: null,
        weather: null,
        weatherTurns: 0,
        terrain: null,
        terrainTurns: 0,
        logs: [],
        player: { name: "You", team: playerTeam, active: 0, teraUsed: false, tailwindTurns: 0 },
        ai: { name: "Jano Bot", team: aiTeam, active: 0, teraUsed: false, tailwindTurns: 0 }
      };
      addLog(`You challenged Jano's ${opponent.name} team!`, "turn");
      addLog(`You sent out ${activeMon("player").name}!`, "player-move");
      addLog(`Jano sent out ${activeMon("ai").name}!`, "ai-move");
      onEnter("player", true);
      onEnter("ai", true);
      saveBuilder();
      renderBattle();
    } catch (error) {
      game = null;
      setupMessage = "The battle could not load. Check your connection and try again.";
      renderBuilder();
    }
  }

  function randomizeTeam() {
    const shuffled = [...catalog];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    selectedSlugs = shuffled.slice(0, 6).map((build) => build.slug);
    setupMessage = "Random team ready. Click any slot to replace it.";
    saveBuilder();
    renderBuilder();
  }

  function returnToBuilder() {
    game = null;
    setupMessage = "Your team is saved. Adjust it or start another battle.";
    renderBuilder();
  }

  function wireEvents() {
    root.addEventListener("input", (event) => {
      if (event.target.id !== "battle-search") return;
      catalogQuery = event.target.value;
      renderCatalogOnly();
    });

    root.addEventListener("change", (event) => {
      if (event.target.id !== "battle-opponent") return;
      opponentIndex = clamp(Number(event.target.value) || 0, 0, siteData.teams.length - 1);
      setupMessage = "";
      saveBuilder();
      renderBuilder();
    });

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-battle-action]");
      if (!button || button.disabled) return;
      const action = button.dataset.battleAction;

      if (action === "add") {
        const slug = button.dataset.slug;
        if (selectedSlugs.length < 6 && findBuild(slug) && !selectedSlugs.includes(slug)) {
          selectedSlugs.push(slug);
          setupMessage = "";
          saveBuilder();
          renderBuilder();
        }
        return;
      }
      if (action === "remove") {
        selectedSlugs = selectedSlugs.filter((slug) => slug !== button.dataset.slug);
        setupMessage = "";
        saveBuilder();
        renderBuilder();
        return;
      }
      if (action === "random-team") {
        randomizeTeam();
        return;
      }
      if (action === "clear-team") {
        selectedSlugs = [];
        setupMessage = "Team cleared.";
        saveBuilder();
        renderBuilder();
        return;
      }
      if (action === "start" || action === "rematch") {
        startBattle();
        return;
      }
      if (action === "edit-team") {
        if (game && game.processing) return;
        returnToBuilder();
        return;
      }
      if (!game || game.phase !== "battle" || game.processing) return;

      if (action === "toggle-tera") {
        if (!game.player.teraUsed) game.teraQueued = !game.teraQueued;
        renderBattle();
        return;
      }
      if (action === "open-switch") {
        game.switchMode = true;
        game.teraQueued = false;
        renderBattle();
        return;
      }
      if (action === "cancel-switch") {
        game.switchMode = false;
        renderBattle();
        return;
      }
      if (action === "move") {
        const index = Number(button.dataset.index);
        resolveTurn(makeMoveAction("player", index, game.teraQueued));
        return;
      }
      if (action === "choose-switch") {
        const index = Number(button.dataset.index);
        resolveTurn(makeSwitchAction("player", index));
        return;
      }
      if (action === "forced-switch") {
        const index = Number(button.dataset.index);
        const aiReplacement = game.pendingAiReplacement;
        if (aiReplacement != null) {
          const playerSwitched = performSwitch("player", index, true, true);
          const aiSwitched = playerSwitched && performSwitch("ai", aiReplacement, true, true);
          if (playerSwitched && aiSwitched) {
            game.forcedSwitch = false;
            game.pendingAiReplacement = null;
            onEnter("player");
            onEnter("ai");
            renderBattle();
          }
        } else if (performSwitch("player", index, true)) {
          game.forcedSwitch = false;
          renderBattle();
        }
        return;
      }
      if (action === "forfeit") {
        addLog(`You forfeited the battle.`, "defeat");
        finishBattle("ai");
        renderBattle();
      }
    });
  }

  function initBattleLab() {
    root = document.getElementById("battle-app");
    if (!root || !Array.isArray(siteData.teams) || !siteData.teams.length) return;
    catalog = buildCatalog();
    restoreBuilder();
    wireEvents();
    renderBuilder();
  }

  document.addEventListener("DOMContentLoaded", initBattleLab);
})();
