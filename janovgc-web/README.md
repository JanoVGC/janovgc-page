# JanoVGC — Jan Altisent Brescó

A single-page website showcasing the competitive Pokémon (VGC) history of
**Jan Altisent Brescó ("JanoVGC")**: his tournament journey, real teams and
results, a playable **Jano Battle Bot**, coaching, and embedded **Jano Pkm**
YouTube videos.

Built with plain HTML, CSS, and JavaScript — no build step or installed runtime
dependencies.

## Run it

The site uses PokéAPI, YouTube embeds, and Google Fonts, so run it through a
local HTTP server rather than opening `index.html` as a `file://` URL.

On this Windows machine, open PowerShell in the project folder and run:

```powershell
npx.cmd --yes serve . -l 8000
```

Then visit <http://localhost:8000>.

If Python is installed, this also works:

```powershell
python -m http.server 8000
```

## Project structure

```text
janovgc-web/
├─ index.html         # Page markup and section layout
├─ css/
│  ├─ styles.css      # Main theme and responsive styles
│  └─ battle.css      # Team builder, battlefield, and battle controls
└─ js/
   ├─ data.js         # Real teams, results, videos, and coaching content
   ├─ main.js         # Main-page rendering and interactions
   └─ battle.js       # Team builder, PokéAPI adapter, battle engine, and AI
```

## Editing the content

Open **`js/data.js`**. The main sections are driven from these properties:

| Section | Property in `data.js` | Notes |
|---|---|---|
| Hero counters | `stats` | Value and label |
| Competitive history | `history` | Year, title, and description |
| Results | `tops` | Placement, event, record, and ruleset |
| Teams | `teams` | Real six-Pokémon sets and Poképaste links |
| YouTube | `channelUrl`, `videos` | Channel URL and real YouTube video IDs |
| Coaching | `coachingPlans` | Set `featured: true` to highlight a plan |

Each Pokémon in `teams` uses this shape:

```js
{
  name: "Flutter Mane",
  slug: "flutter-mane", // PokéAPI identifier
  item: "Booster Energy",
  ability: "Protosynthesis",
  tera: "Fairy",
  moves: ["Moonblast", "Icy Wind", "Taunt", "Protect"]
}
```

## Jano Battle Bot

The Battle Lab is a browser-only **6v6 singles exhibition** with an original,
Pokémon Showdown-inspired interface. It lets a visitor:

- Choose any of Jano's stored tournament teams as the bot opponent.
- Build six unique Pokémon from Jano's complete roster archive.
- Search the roster by Pokémon, event, format, or move.
- Save the builder selection in local browser storage.
- Use four moves, switch Pokémon, Terastallize, track PP and status, and play
  until either full team is defeated.
- Rematch or return to the builder after the result.

The engine in `js/battle.js` loads base stats, types, move metadata, and artwork
from [PokéAPI](https://pokeapi.co/). It includes type effectiveness, STAB,
priority, speed order, accuracy, damage variance, selected item/ability effects,
status conditions, stat stages, Tailwind, rain, grassy terrain, Substitute,
Protect-family moves, forced switches, and a matchup-aware AI.

This is intentionally an arcade simulator, not a complete cartridge or Pokémon
Showdown rules implementation. Complex doubles-specific mechanics are adapted
or simplified because the exhibition format is singles.

## YouTube videos

For a URL such as `https://www.youtube.com/watch?v=ABC123xyz`, the video ID is
the part after `v=`. Add or replace an entry in `videos`:

```js
{ id: "ABC123xyz", title: "My video", desc: "Short description" }
```

## Coaching contract

The coaching form currently validates input and displays an in-page confirmation.
To receive real requests, connect `wireForm` in `js/main.js` to an email service,
backend endpoint, or form provider.

---

Pokémon is © The Pokémon Company. This is an unofficial fan site. The Battle
Lab is not affiliated with Pokémon Showdown.
