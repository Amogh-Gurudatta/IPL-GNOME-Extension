# 🏏 IPL Live Score — Linux Desktop Extension

**Live IPL scores on your desktop. Any DE. Zero dependencies.**

A collection of native widgets and scripts that stream live Indian Premier League scores directly into your Linux desktop panel — whether you use GNOME, KDE Plasma, Sway/Hyprland, i3, or XFCE.

---

## 📦 Platforms

| Platform | Type | Location |
|---|---|---|
| **GNOME Shell 45–50** | Native Extension (GJS) | [`gnome-extension/`](gnome-extension/) |
| **KDE Plasma 6** | Native Plasmoid (QML) | [`kde-plasmoid/`](kde-plasmoid/) |
| **Waybar** (Sway/Hyprland) | Python Script → JSON | [`universal-script/`](universal-script/) |
| **Polybar** (i3/bspwm) | Python Script → Text | [`universal-script/`](universal-script/) |
| **XFCE Genmon** | Python Script → Text | [`universal-script/`](universal-script/) |

---

## ✨ Core Features (Shared Across All Platforms)

### 📡 Live Score Ticker
- Displays the active IPL match score using abbreviated team names (CSK, RCB, MI, etc.)
- The 🏏 emoji marks the currently batting team

### 🧠 Smart State Math
- Cricinfo's RSS feed leaves a buggy `*` on completed matches.
- Our engine parses the actual runs/wickets to determine the true match state.
- A match is only classified as "live" if it has a `*` **AND** isn't mathematically over.

### 🏗️ Priority Selector
- **Live Match** → **Completed Match** → **Scheduled Match**
- On double-header days, the truly live match always wins.

### 📋 Categorized Dashboard
All platforms display matches sorted into:
- 🔴 **ONGOING** — Live matches in progress
- ✅ **COMPLETED** — Finished matches with final scores
- 📅 **SCHEDULED** — Upcoming matches

---

## 🚀 Installation & Usage

### 1. GNOME Shell Extension
The GNOME extension is a fully-fledged desktop applet featuring a smart polling engine (deep sleep modes), Libadwaita settings, and match-end notifications.

**Install from ZIP:**
```bash
gnome-extensions install ipl-live-score@amogh.shell-extension.zip
gnome-extensions enable ipl-live-score@amogh
```

**Install from source:**
```bash
glib-compile-schemas gnome-extension/schemas/
ln -sf "$(pwd)/gnome-extension" ~/.local/share/gnome-shell/extensions/ipl-live-score@amogh
gnome-extensions enable ipl-live-score@amogh
```

### 2. KDE Plasma 6 Plasmoid
A native QML/JS widget that uses `XMLHttpRequest`, presenting a compact panel ticker and a categorized expander popup.

**Install via `kpackagetool6`:**
```bash
kpackagetool6 -i kde-plasmoid/
```
*(For development, you can use `kpackagetool6 -t Plasma/Applet -i kde-plasmoid/`)*

Right-click your panel → **Add Widgets** → Search for "IPL Live Score" → Drag to panel.

### 3. Waybar (Sway / Hyprland)
Uses the zero-dependency universal Python script built specifically to output standard Waybar JSON format.

**Waybar Config (`~/.config/waybar/config`):**
```json
"custom/ipl": {
    "exec": "python3 /path/to/universal-script/ipl_score.py --format waybar",
    "return-type": "json",
    "interval": 60,
    "tooltip": true
}
```

### 4. Polybar (i3 / bspwm)
Uses the universal script but formatted as multi-line plain text.

**Polybar Config (`~/.config/polybar/config.ini`):**
```ini
[module/ipl]
type = custom/script
exec = python3 /path/to/universal-script/ipl_score.py --format text | head -1
interval = 60
```

### 5. XFCE Genmon
Add a "Generic Monitor" panel item to your XFCE panel and set the command to:
```bash
python3 /path/to/universal-script/ipl_score.py --format text | head -1
```

---

## 🔬 Under the Hood

### Why RSS instead of a JSON REST API?

| | JSON REST API | RSS Feed |
|---|---|---|
| **Auth** | Tokens expire, get revoked | None required |
| **Rate Limits** | Aggressive (often 60 req/hr) | Effectively unlimited |
| **Payload Size** | 50–200 KB of nested JSON | ~5 KB of flat XML |
| **Schema Stability** | Breaks frequently | Unchanged for 10+ years |
| **Parsing** | Deep object traversal | Single regex extraction |

The extension fetches `http://static.cricinfo.com/rss/livescores.xml` — a tiny, static XML file that Cricinfo has served reliably for over a decade.

---

## 🏗️ Project Structure

```
.
├── gnome-extension/          # GNOME Shell 45-50 native extension (GJS)
├── kde-plasmoid/             # KDE Plasma 6 native widget (QML)
├── universal-script/         # Universal Waybar/Polybar/XFCE script (Python)
└── README.md                 # Universal instructions
```

---

## 📄 License & Credits

- **License**: MIT
- **Data Source**: [ESPN Cricinfo](https://www.espncricinfo.com) RSS Feed
