/* ============================================================
   JanoVGC — Site content
   ------------------------------------------------------------
   Tournament record sourced from VGC History:
   https://vgchistory.com/players/jan-altisent-bresco
   Team sheets provided by Jan (pokepast.es).

   Each Pokémon:
     name  — display name
     slug  — PokéAPI id used to fetch the sprite
     item, ability, tera — details shown on hover
     moves — the four moves

   Sprites are loaded at runtime from PokéAPI (js/main.js).
   ============================================================ */

window.JANO_DATA = {

  /* Hero stat counters. */
  stats: [
    { value: "10", label: "Logged Events" },
    { value: "29th", label: "Best Finish" },
    { value: "4", label: "Seasons" },
    { value: "54", label: "Games Won" }
  ],

  /* Season-by-season story built from the real event timeline. */
  history: [
    {
      year: "2023",
      title: "Onto the European stage",
      desc: "Jano's logged circuit opens in the 2023 season across Reg A–E: a tough debut at Bochum Regionals, a 6-3 run at EUIC 2023 in London, and Lille Regionals to close the stretch."
    },
    {
      year: "2024",
      title: "Breakout results",
      desc: "A strong 2024: 29th at the Utrecht Special Event (9-5), a 9-6 run to 64th at EUIC 2024 on the same team, and a day-two appearance at the Bologna Special Event with Calyrex-Shadow."
    },
    {
      year: "2025",
      title: "EUIC regular",
      desc: "Returns to the London International (EUIC 2025) under Reg G with a Terapagos core, going 5-3 against Europe's best."
    },
    {
      year: "2025–26",
      title: "Reg H & the new season",
      desc: "Opens the 2026 season with an 8-3 run to 33rd at Gdańsk Regionals under Reg H, then Frankfurt Regionals, and a 5-3 showing at Birmingham Regionals in January 2026."
    }
  ],

  /* Notable results from the logged record. */
  tops: [
    { tier: "top", medal: "🏅", placement: "29th",  event: "Utrecht Special Event",     meta: "Utrecht · Mar 2024 · 9-5", format: "REG F" },
    { tier: "top", medal: "🏅", placement: "33rd",  event: "Gdańsk Regionals 2026",     meta: "Gdańsk · Nov 2025 · 8-3", format: "REG H" },
    { tier: "top", medal: "🏅", placement: "64th",  event: "EUIC 2024",                 meta: "London · Apr 2024 · 9-6", format: "REG F" },
    { tier: "top", medal: "🏅", placement: "108th", event: "Birmingham Regionals 2026", meta: "Birmingham · Jan 2026 · 5-3", format: "REG F" },
    { tier: "top", medal: "🏅", placement: "111th", event: "EUIC 2023",                 meta: "London · Apr 2023 · 6-3", format: "REG A-E" },
    { tier: "top", medal: "🏅", placement: "164th", event: "Frankfurt Regionals 2026",  meta: "Frankfurt · Sep 2025 · 5-3", format: "REG H" }
  ],

  /* One entry per logged event (newest first), with real rosters. */
  teams: [
    {
      name: "Birmingham Regionals 2026",
      format: "REG F",
      result: "108th · 5-3 · Birmingham, Jan 24–25, 2026",
      note: "2026 season opener in the UK under Regulation F.",
      pokepaste: "https://pokepast.es/7235fe3d6f9d9aae",
      mons: [
        { name: "Landorus",          slug: "landorus-incarnate", item: "Life Orb",       ability: "Sheer Force",     tera: "Steel", moves: ["Earth Power", "Sludge Bomb", "Substitute", "Protect"] },
        { name: "Raging Bolt",       slug: "raging-bolt",        item: "Assault Vest",   ability: "Protosynthesis",  tera: "Fairy", moves: ["Thunderclap", "Draco Meteor", "Electroweb", "Snarl"] },
        { name: "Urshifu",           slug: "urshifu-single-strike", item: "Focus Sash",  ability: "Unseen Fist",     tera: "Dark",  moves: ["Wicked Blow", "Close Combat", "Sucker Punch", "Detect"] },
        { name: "Flutter Mane",      slug: "flutter-mane",       item: "Booster Energy", ability: "Protosynthesis",  tera: "Fairy", moves: ["Moonblast", "Icy Wind", "Taunt", "Protect"] },
        { name: "Incineroar",        slug: "incineroar",         item: "Sitrus Berry",   ability: "Intimidate",      tera: "Ghost", moves: ["Flare Blitz", "Parting Shot", "Will-O-Wisp", "Fake Out"] },
        { name: "Ogerpon-Wellspring", slug: "ogerpon-wellspring-mask", item: "Wellspring Mask", ability: "Water Absorb", tera: "Water", moves: ["Ivy Cudgel", "Horn Leech", "Follow Me", "Spiky Shield"] }
      ]
    },
    {
      name: "Gdańsk Regionals 2026",
      format: "REG H",
      result: "33rd · 8-3 · Gdańsk, Nov 1–2, 2025",
      note: "Career-best logged run — an 8-3 record under Regulation H.",
      pokepaste: "https://pokepast.es/d8b2701c013dfe22",
      mons: [
        { name: "Ursaluna-Bloodmoon", slug: "ursaluna-bloodmoon", item: "Assault Vest",  ability: "Mind's Eye",   tera: "Water", moves: ["Blood Moon", "Hyper Voice", "Earth Power", "Vacuum Wave"] },
        { name: "Gholdengo",          slug: "gholdengo",          item: "Life Orb",       ability: "Good as Gold", tera: "Water", moves: ["Make It Rain", "Shadow Ball", "Nasty Plot", "Protect"] },
        { name: "Dragonite",          slug: "dragonite",          item: "Loaded Dice",    ability: "Multiscale",   tera: "Fairy", moves: ["Scale Shot", "Tailwind", "Protect", "Haze"] },
        { name: "Rillaboom",          slug: "rillaboom",          item: "Miracle Seed",   ability: "Grassy Surge", tera: "Fire",  moves: ["High Horsepower", "Grassy Glide", "Wood Hammer", "Fake Out"] },
        { name: "Annihilape",         slug: "annihilape",         item: "Sitrus Berry",   ability: "Defiant",      tera: "Fire",  moves: ["Rage Fist", "Drain Punch", "Protect", "Bulk Up"] },
        { name: "Maushold",           slug: "maushold-family-of-four", item: "Focus Sash", ability: "Friend Guard", tera: "Ghost", moves: ["Super Fang", "Beat Up", "Follow Me", "Protect"] }
      ]
    },
    {
      name: "Frankfurt Regionals 2026",
      format: "REG H",
      result: "164th · 5-3 · Frankfurt, Sep 13–14, 2025",
      note: "Early 2026-season Regional in Germany.",
      pokepaste: "https://pokepast.es/00e3b3517287d437",
      mons: [
        { name: "Volcarona",          slug: "volcarona",          item: "Covert Cloak",  ability: "Flame Body",   tera: "Fairy",  moves: ["Tera Blast", "Heat Wave", "Protect", "Quiver Dance"] },
        { name: "Ursaluna-Bloodmoon", slug: "ursaluna-bloodmoon", item: "Focus Sash",    ability: "Mind's Eye",   tera: "Normal", moves: ["Blood Moon", "Hyper Voice", "Earth Power", "Protect"] },
        { name: "Dragonite",          slug: "dragonite",          item: "Loaded Dice",   ability: "Multiscale",   tera: "Fairy",  moves: ["Scale Shot", "Tailwind", "Protect", "Haze"] },
        { name: "Rillaboom",          slug: "rillaboom",          item: "Assault Vest",  ability: "Grassy Surge", tera: "Water",  moves: ["High Horsepower", "Grassy Glide", "Wood Hammer", "Fake Out"] },
        { name: "Annihilape",         slug: "annihilape",         item: "Lum Berry",     ability: "Defiant",      tera: "Water",  moves: ["Rage Fist", "Close Combat", "Taunt", "Final Gambit"] },
        { name: "Incineroar",         slug: "incineroar",         item: "Safety Goggles", ability: "Intimidate",  tera: "Ghost",  moves: ["Flare Blitz", "Parting Shot", "Fake Out", "Knock Off"] }
      ]
    },
    {
      name: "EUIC 2025",
      format: "REG G",
      result: "341st · 5-3 · London, Feb 21–23, 2025",
      note: "European International Championships under Regulation G.",
      pokepaste: "https://pokepast.es/483dc4c584a177cd",
      mons: [
        { name: "Terapagos",          slug: "terapagos-terastal", item: "Leftovers",     ability: "Tera Shift",     tera: "Stellar", moves: ["Calm Mind", "Tera Starstorm", "Substitute", "Protect"] },
        { name: "Flutter Mane",       slug: "flutter-mane",       item: "Booster Energy", ability: "Protosynthesis", tera: "Grass",   moves: ["Moonblast", "Taunt", "Thunder Wave", "Icy Wind"] },
        { name: "Urshifu-Rapid-Strike", slug: "urshifu-rapid-strike", item: "Mystic Water", ability: "Unseen Fist", tera: "Poison",  moves: ["Surging Strikes", "Close Combat", "Aqua Jet", "Protect"] },
        { name: "Amoonguss",          slug: "amoonguss",          item: "Rocky Helmet",  ability: "Regenerator",    tera: "Water",   moves: ["Sludge Bomb", "Protect", "Rage Powder", "Spore"] },
        { name: "Rillaboom",          slug: "rillaboom",          item: "Assault Vest",  ability: "Grassy Surge",   tera: "Fire",    moves: ["U-turn", "Grassy Glide", "Wood Hammer", "Fake Out"] },
        { name: "Incineroar",         slug: "incineroar",         item: "Safety Goggles", ability: "Intimidate",    tera: "Ghost",   moves: ["Will-O-Wisp", "Parting Shot", "Fake Out", "Knock Off"] }
      ]
    },
    {
      name: "Bologna Special Event 2024",
      format: "REG G",
      result: "352nd · 4-4 · Bologna, Jun 1–2, 2024",
      note: "Restricted build around Calyrex-Shadow.",
      pokepaste: "https://pokepast.es/0c9e59bb6c953db3",
      mons: [
        { name: "Urshifu-Rapid-Strike", slug: "urshifu-rapid-strike", item: "Focus Sash", ability: "Unseen Fist", tera: "Water", moves: ["Surging Strikes", "Close Combat", "Aqua Jet", "Detect"] },
        { name: "Rillaboom",          slug: "rillaboom",          item: "Assault Vest",  ability: "Grassy Surge", tera: "Fire",  moves: ["U-turn", "Grassy Glide", "Wood Hammer", "Fake Out"] },
        { name: "Clefairy",           slug: "clefairy",           item: "Eviolite",      ability: "Friend Guard", tera: "Grass", moves: ["Follow Me", "Helping Hand", "Protect", "Heal Pulse"] },
        { name: "Incineroar",         slug: "incineroar",         item: "Safety Goggles", ability: "Intimidate",  tera: "Ghost", moves: ["Taunt", "Parting Shot", "Fake Out", "Knock Off"] },
        { name: "Tornadus",           slug: "tornadus-incarnate", item: "Covert Cloak",  ability: "Prankster",    tera: "Dark",  moves: ["Tailwind", "Bleakwind Storm", "Taunt", "Rain Dance"] },
        { name: "Calyrex-Shadow",     slug: "calyrex-shadow",     item: "Spell Tag",     ability: "As One",       tera: "Fairy", moves: ["Astral Barrage", "Draining Kiss", "Nasty Plot", "Protect"] }
      ]
    },
    {
      name: "EUIC 2024",
      format: "REG F",
      result: "64th · 9-6 · London, Apr 5–7, 2024",
      note: "Nine wins at the London International — same team used at Utrecht.",
      pokepaste: "https://pokepast.es/81c2df9f0fe45b9e",
      mons: [
        { name: "Incineroar",         slug: "incineroar",         item: "Sitrus Berry",   ability: "Intimidate",     tera: "Ghost", moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Will-O-Wisp"] },
        { name: "Raging Bolt",        slug: "raging-bolt",        item: "Assault Vest",   ability: "Protosynthesis", tera: "Fairy", moves: ["Thunderclap", "Electroweb", "Draco Meteor", "Snarl"] },
        { name: "Ogerpon-Wellspring", slug: "ogerpon-wellspring-mask", item: "Wellspring Mask", ability: "Water Absorb", tera: "Water", moves: ["Spiky Shield", "Ivy Cudgel", "Horn Leech", "Follow Me"] },
        { name: "Flutter Mane",       slug: "flutter-mane",       item: "Booster Energy", ability: "Protosynthesis", tera: "Fairy", moves: ["Protect", "Moonblast", "Icy Wind", "Taunt"] },
        { name: "Landorus",           slug: "landorus-incarnate", item: "Life Orb",       ability: "Sheer Force",    tera: "Steel", moves: ["Protect", "Earth Power", "Sludge Bomb", "Substitute"] },
        { name: "Urshifu",            slug: "urshifu-single-strike", item: "Focus Sash",  ability: "Unseen Fist",    tera: "Dark",  moves: ["Detect", "Close Combat", "Wicked Blow", "Sucker Punch"] }
      ]
    },
    {
      name: "Utrecht Special Event 2024",
      format: "REG F",
      result: "29th · 9-5 · Utrecht, Mar 2–3, 2024",
      note: "Best logged placement — 29th with a 9-5 record (same team as EUIC 2024).",
      pokepaste: "https://pokepast.es/81c2df9f0fe45b9e",
      mons: [
        { name: "Incineroar",         slug: "incineroar",         item: "Sitrus Berry",   ability: "Intimidate",     tera: "Ghost", moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Will-O-Wisp"] },
        { name: "Raging Bolt",        slug: "raging-bolt",        item: "Assault Vest",   ability: "Protosynthesis", tera: "Fairy", moves: ["Thunderclap", "Electroweb", "Draco Meteor", "Snarl"] },
        { name: "Ogerpon-Wellspring", slug: "ogerpon-wellspring-mask", item: "Wellspring Mask", ability: "Water Absorb", tera: "Water", moves: ["Spiky Shield", "Ivy Cudgel", "Horn Leech", "Follow Me"] },
        { name: "Flutter Mane",       slug: "flutter-mane",       item: "Booster Energy", ability: "Protosynthesis", tera: "Fairy", moves: ["Protect", "Moonblast", "Icy Wind", "Taunt"] },
        { name: "Landorus",           slug: "landorus-incarnate", item: "Life Orb",       ability: "Sheer Force",    tera: "Steel", moves: ["Protect", "Earth Power", "Sludge Bomb", "Substitute"] },
        { name: "Urshifu",            slug: "urshifu-single-strike", item: "Focus Sash",  ability: "Unseen Fist",    tera: "Dark",  moves: ["Detect", "Close Combat", "Wicked Blow", "Sucker Punch"] }
      ]
    },
    {
      name: "Lille Regionals 2024",
      format: "REG A-E",
      result: "387th · 3-5 · Lille, Oct 21–22, 2023",
      note: "Regional in France to open the 2024 season.",
      pokepaste: "https://pokepast.es/72e5dc893d19ee7a",
      mons: [
        { name: "Ogerpon-Wellspring", slug: "ogerpon-wellspring-mask", item: "Wellspring Mask", ability: "Water Absorb", tera: "Water", moves: ["Spiky Shield", "Follow Me", "Ivy Cudgel", "Horn Leech"] },
        { name: "Chien-Pao",          slug: "chien-pao",          item: "Focus Sash",    ability: "Sword of Ruin",  tera: "Dark",   moves: ["Icicle Crash", "Sucker Punch", "Haze", "Protect"] },
        { name: "Landorus-Therian",   slug: "landorus-therian",   item: "Choice Scarf",  ability: "Intimidate",     tera: "Flying", moves: ["Tera Blast", "U-turn", "Stomping Tantrum", "Rock Slide"] },
        { name: "Heatran",            slug: "heatran",            item: "Ability Shield", ability: "Flash Fire",    tera: "Grass",  moves: ["Protect", "Flash Cannon", "Heat Wave", "Earth Power"] },
        { name: "Flutter Mane",       slug: "flutter-mane",       item: "Choice Specs",  ability: "Protosynthesis", tera: "Fairy",  moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Icy Wind"] },
        { name: "Iron Hands",         slug: "iron-hands",         item: "Assault Vest",  ability: "Quark Drive",    tera: "Fire",   moves: ["Fake Out", "Wild Charge", "Drain Punch", "Heavy Slam"] }
      ]
    },
    {
      name: "EUIC 2023",
      format: "REG A-E",
      result: "111th · 6-3 · London, Apr 14–16, 2023",
      note: "Solid 6-3 run at the London International.",
      pokepaste: "https://pokepast.es/1e7e06278deb4873",
      mons: [
        { name: "Corviknight",        slug: "corviknight",        item: "Lum Berry",     ability: "Mirror Armor",   tera: "Dragon", moves: ["Roost", "Tailwind", "U-turn", "Brave Bird"] },
        { name: "Amoonguss",          slug: "amoonguss",          item: "Sitrus Berry",  ability: "Regenerator",    tera: "Water",  moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"] },
        { name: "Arcanine",           slug: "arcanine",           item: "Safety Goggles", ability: "Intimidate",    tera: "Grass",  moves: ["Flare Blitz", "Protect", "Will-O-Wisp", "Snarl"] },
        { name: "Palafin",            slug: "palafin-zero",       item: "Mystic Water",  ability: "Zero to Hero",   tera: "Water",  moves: ["Jet Punch", "Wave Crash", "Haze", "Protect"] },
        { name: "Ting-Lu",            slug: "ting-lu",            item: "Assault Vest",  ability: "Vessel of Ruin", tera: "Poison", moves: ["Rock Tomb", "Heavy Slam", "Stomping Tantrum", "Fissure"] },
        { name: "Flutter Mane",       slug: "flutter-mane",       item: "Choice Specs",  ability: "Protosynthesis", tera: "Fairy",  moves: ["Thunderbolt", "Moonblast", "Shadow Ball", "Dazzling Gleam"] }
      ]
    },
    {
      name: "Bochum Regionals 2023",
      format: "REG A-E",
      result: "560th · 0-4 · Bochum, Feb 25–26, 2023",
      note: "First logged event on the circuit.",
      pokepaste: "https://pokepast.es/2d2a45e6cc861f3c",
      mons: [
        { name: "Dondozo",            slug: "dondozo",            item: "Leftovers",     ability: "Unaware",        tera: "Steel",  moves: ["Wave Crash", "Earthquake", "Yawn", "Heavy Slam"] },
        { name: "Arcanine",           slug: "arcanine",           item: "Safety Goggles", ability: "Intimidate",    tera: "Normal", moves: ["Flare Blitz", "Will-O-Wisp", "Extreme Speed", "Protect"] },
        { name: "Flutter Mane",       slug: "flutter-mane",       item: "Life Orb",      ability: "Protosynthesis", tera: "Grass",  moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Protect"] },
        { name: "Iron Moth",          slug: "iron-moth",          item: "Booster Energy", ability: "Quark Drive",   tera: "Grass",  moves: ["Heat Wave", "Acid Spray", "Energy Ball", "Protect"] },
        { name: "Dragonite",          slug: "dragonite",          item: "Choice Band",   ability: "Multiscale",     tera: "Normal", moves: ["Ice Spinner", "Extreme Speed", "Stomping Tantrum", "Aerial Ace"] },
        { name: "Tatsugiri",          slug: "tatsugiri-curly",    item: "Choice Scarf",  ability: "Commander",      tera: "Steel",  moves: ["Muddy Water", "Draco Meteor", "Dragon Pulse", "Icy Wind"] }
      ]
    }
  ],

  /* Jano Pkm YouTube channel. */
  channelUrl: "https://www.youtube.com/@JanoVGC",

  /* Real videos from the Jano Pkm channel (newest first). */
  videos: [
    { id: "2VoDTZx8GC4", title: "Volví a Jugar Mi Misma Composición 1 Año Después", desc: "Volviendo a una composición un año después · 2025" },
    { id: "YxrACPdsBiE", title: "JanoVGC vs OgreVGC", desc: "Supernova VGC vs Paldean Ruins · 2025" },
    { id: "75ganLT23lY", title: "JanoVGC vs Kera — FINAL", desc: "League Challenge Zaragoza, febrero · 2025" },
    { id: "A6ivcNsdgXM", title: "Jan Altisent vs Rafa Torres", desc: "League Cup La Nave Madrid · Swiss Round 7 · 2024" },
    { id: "IqBb3SGQNfg", title: "JanoVGC vs Jayballester", desc: "Supernova VGC vs ECORP · 2024" },
    { id: "njnyuPIBy7M", title: "JanoVGC vs Drake", desc: "Supernova VGC vs Lyok Fox · 2024" },
    { id: "6cDds3fruJA", title: "Bo3 contra Rastboro Rayquaza", desc: "Pretorneo VCL · 2023" },
    { id: "ELoj6fwopmE", title: "Bo1 vs Team Curry", desc: "Pretorneo VCL · 2023" },
    { id: "exeyUto-E2c", title: "Cómo Iniciarse en VGC en 3 Minutos", desc: "Guía para empezar en competitivo · 2020" }
  ],

  /* Coaching plans. featured highlights the recommended plan. */
  coachingPlans: [
    {
      name: "Single Session",
      price: "€25",
      per: "/ session",
      featured: false,
      perks: ["60-minute video call", "Replay review", "One focus area of your choice", "Written follow-up notes"]
    },
    {
      name: "4-Session Block",
      price: "€85",
      per: "/ block",
      featured: true,
      perks: ["Four 60-minute sessions", "Teambuilding + matchup theory", "Homework between sessions", "Priority scheduling", "Discount vs. single sessions"]
    },
    {
      name: "Season Partner",
      price: "€200",
      per: "/ season",
      featured: false,
      perks: ["Ongoing support all season", "Pre-event prep & team checks", "Live tournament support chat", "Replay reviews on demand"]
    }
  ]
};
