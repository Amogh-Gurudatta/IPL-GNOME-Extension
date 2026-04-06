# 🏏 IPL Live Score — Desktop Extension

**Live IPL scores on your desktop. Any DE. Any OS. Zero fuss.**

A collection of native widgets and scripts that stream live Indian Premier League scores directly into your desktop panel — whether you use GNOME, KDE Plasma, COSMIC, Cinnamon, Sway/Hyprland, i3, dwm, XFCE, MATE, or macOS.

---

## 📦 Platforms

| Platform | Type | Location |
|---|---|---|
| **GNOME Shell 45–50** | Native Extension (GJS) | [`gnome-extension/`](gnome-extension/) |
| **KDE Plasma 6** | Native Plasmoid (QML) | [`kde-plasmoid/`](kde-plasmoid/) |
| **COSMIC** (System76) | Native Applet (Rust) | [`cosmic-applet/`](cosmic-applet/) |
| **Cinnamon** (Linux Mint) | Native Applet (CJS) | [`cinnamon-applet/`](cinnamon-applet/) |
| **Waybar** (Sway/Hyprland) | Python Script → JSON | [`universal-script/`](universal-script/) |
| **Polybar** (i3/bspwm) | Python Script → Text | [`universal-script/`](universal-script/) |
| **dwm** | Python Script → xsetroot | [`universal-script/`](universal-script/) |
| **XFCE Genmon** | Python Script → Text | [`universal-script/`](universal-script/) |
| **MATE Desktop** | Python Script → Text | [`universal-script/`](universal-script/) |
| **macOS** (xbar/SwiftBar) | Python Script → xbar format | [`universal-script/`](universal-script/) |

---

## ✨ Core Features (Shared Across All Platforms)

### 📡 Live Score Ticker
- Displays the active IPL match score using abbreviated team names (CSK, RCB, MI, etc.)
- The 🏏 emoji marks the currently batting team

### 🧠 Smart State Math
- Cricinfo's RSS feed leaves a buggy `*` on completed matches
- Our engine parses the actual runs/wickets to determine the true match state
- A match is only classified as "live" if it has a `*` **AND** isn't mathematically over

### 🏗️ Priority Selector
- **Live Match** → **Completed Match** → **Scheduled Match**
- On double-header days, the truly live match always wins

### 📋 Categorized Dashboard
All platforms display matches sorted into:
- 🔴 **ONGOING** — Live matches in progress
- ✅ **COMPLETED** — Finished matches with final scores
- 📅 **SCHEDULED** — Upcoming matches

---

## 🚀 Installation & Usage

### 1. GNOME Shell Extension

The GNOME extension is the most feature-rich variant, with a smart polling engine (deep sleep modes), Libadwaita settings UI, match-end desktop notifications, and favorite-team highlighting.

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

Log out and log back in (or restart GNOME Shell with `Alt+F2` → `r`) to activate.

---

### 2. KDE Plasma 6 Plasmoid

A native QML/JS widget with a compact panel ticker and a categorized popup.

**Install:**
```bash
kpackagetool6 -i kde-plasmoid/
```

Then right-click your panel → **Add Widgets** → search for **"IPL Live Score"** → drag it to your panel.

**Uninstall:**
```bash
kpackagetool6 -r com.github.amogh.ipllivescore
```

---

### 3. COSMIC Desktop Applet (System76)

A native Rust applet built with `libcosmic` and `iced`. Displays a compact panel string that expands into a categorized popup on click.

**Build and install:**
```bash
cd cosmic-applet/
cargo build --release
# Copy the binary to your PATH
sudo cp target/release/cosmic-applet-ipl-score /usr/local/bin/
```

**Run:**
```bash
cosmic-applet-ipl-score
```

> **Note:** This applet targets the stable COSMIC Epoch 1 (v1.0+) stack and utilizes standard libcosmic widgets.

---

### 4. Cinnamon Desktop Applet (Linux Mint)

A native CJS applet for Linux Mint's Cinnamon desktop environment with a panel ticker, popup menu, and categorized match display.

**Install from source:**
```bash
cp -r cinnamon-applet/ipl-live-score@amogh ~/.local/share/cinnamon/applets/
```

Then right-click your panel → **Add applets to the panel** → search for **"IPL Live Score"** → add it to your panel.

**Uninstall:**
```bash
rm -rf ~/.local/share/cinnamon/applets/ipl-live-score@amogh
```

> **Note:** Uses CJS (CommonJS) imports — compatible with Cinnamon 5.4 through 6.4.

---

### 5. Waybar (Sway / Hyprland)

Uses the zero-dependency Python script with Waybar's native JSON protocol. The tooltip shows all categorized matches.

**Add to `~/.config/waybar/config`:**
```json
"custom/ipl": {
    "exec": "python3 /path/to/universal-script/ipl_score.py --format waybar",
    "return-type": "json",
    "interval": 60,
    "tooltip": true
}
```

---

### 6. Polybar (i3 / bspwm)

Uses the Python script in plain text mode. Polybar reads the first line as the module output.

**Add to `~/.config/polybar/config.ini`:**
```ini
[module/ipl]
type = custom/script
exec = python3 /path/to/universal-script/ipl_score.py --format text | head -1
interval = 60
```

---

### 7. dwm

dwm's default status bar is set via `xsetroot -name`. The `--format dwm` flag outputs a clean single-line string designed for this.

**Add to your `~/.xinitrc` (before the `exec dwm` line):**
```bash
while true; do
    xsetroot -name "$(python3 /path/to/universal-script/ipl_score.py --format dwm)"
    sleep 60
done &
```

**One-liner version:**
```bash
while true; do xsetroot -name "$(python3 /path/to/ipl_score.py --format dwm)"; sleep 60; done &
```

---

### 8. XFCE Genmon

Add a **"Generic Monitor"** panel item and set the command to:

```bash
python3 /path/to/universal-script/ipl_score.py --format text | head -1
```

Set the refresh interval to 60 seconds.

---

### 9. macOS (xbar / SwiftBar)

Uses the Python script with the `--format xbar` flag. Compatible with both [xbar](https://xbarapp.com/) and [SwiftBar](https://github.com/swiftbar/SwiftBar).

**Setup:**

1. Install xbar or SwiftBar on your Mac.
2. Copy (or symlink) the script into your xbar plugins directory:
```bash
ln -sf /path/to/universal-script/ipl_score.py ~/Library/Application\ Support/xbar/plugins/ipl_score.60s.py
chmod +x ~/Library/Application\ Support/xbar/plugins/ipl_score.60s.py
```

3. The `60s` in the filename tells xbar to refresh every 60 seconds.

> **Features:** Active match on the menu bar, dropdown with categorized matches, and clickable links that open match pages in your browser.

---

### 10. MATE Desktop

MATE's **Command Applet** displays the output of a shell command on the panel.

**Setup:**

1. Right-click the MATE panel → **Add to Panel** → **Command Applet**.
2. Configure the command:
```bash
python3 /path/to/universal-script/ipl_score.py --format mate
```
3. Set the refresh interval to 60 seconds.

> **Output:** A clean single-line string showing the highest-priority IPL match score.

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

### Smart State Math — Why It Matters

Cricinfo's RSS feed has a known bug: the `*` (batting indicator) sometimes remains on matches that have already ended. A naive check would incorrectly classify these as "live". Our engine solves this:

```
has_asterisk = '*' in title
is_finished  = Team2_runs > Team1_runs  OR  any team all out (wickets == 10)
is_live      = has_asterisk AND NOT is_finished
```

This logic is identically implemented across all platforms — in JavaScript (GNOME/KDE/Cinnamon), Python (universal script), and Rust (COSMIC).

---

## 🏗️ Project Structure

```
.
├── gnome-extension/               # GNOME Shell 45-50 (GJS + Soup 3)
│   ├── extension.js
│   ├── metadata.json
│   ├── prefs.js
│   └── schemas/
│
├── kde-plasmoid/                  # KDE Plasma 6 (QML + JS)
│   ├── metadata.json
│   └── contents/ui/main.qml
│
├── cosmic-applet/                 # COSMIC DE (Rust + iced)
│   ├── Cargo.toml
│   └── src/main.rs
│
├── cinnamon-applet/               # Cinnamon DE (CJS + Soup 3)
│   └── ipl-live-score@amogh/
│       ├── applet.js
│       └── metadata.json
│
├── universal-script/              # Waybar / Polybar / dwm / XFCE / xbar / MATE (Python 3)
│   └── ipl_score.py
│
└── README.md
```

---

## 🖥️ Compatibility

| Platform | Version | Status |
|---|---|---|
| GNOME Shell | 45–50 | ✅ Supported |
| KDE Plasma | 6.0+ | ✅ Supported |
| COSMIC | Epoch 1.0+ | ✅ Supported |
| Cinnamon | 5.4–6.4 | ✅ Supported |
| Waybar | Any | ✅ Supported |
| Polybar | Any | ✅ Supported |
| dwm | Any | ✅ Supported |
| XFCE (Genmon) | Any | ✅ Supported |
| macOS (xbar/SwiftBar) | Any | ✅ Supported |
| MATE Desktop | Any | ✅ Supported |

---

## 📄 License

MIT

---

## 🙏 Credits

- **Data Source**: [ESPN Cricinfo](https://www.espncricinfo.com) RSS Feed
- **GNOME**: [gjs.guide](https://gjs.guide/extensions/)
- **KDE**: [Plasma Developer Documentation](https://develop.kde.org/docs/plasma/)
- **COSMIC**: [System76 COSMIC](https://github.com/pop-os/cosmic-epoch)
- **Cinnamon**: [Linux Mint Developer Guide](https://projects.linuxmint.com/reference/git/cinnamon-tutorials/write-applet.html)
- **xbar**: [xbar Plugin API](https://github.com/matryer/xbar-plugins)
