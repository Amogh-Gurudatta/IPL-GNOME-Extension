# 🏏 IPL Live Score — Desktop Extension

**Live IPL scores on your desktop. Any DE. Any OS. Zero fuss.**

A collection of native widgets and scripts that stream live Indian Premier League scores directly into your desktop panel — whether you use GNOME, KDE Plasma, COSMIC, Cinnamon, Sway/Hyprland, i3, dwm, XFCE, MATE, or macOS.

---

## ✨ Core Features

### 📡 Live Score Ticker
- Displays the active IPL match score using abbreviated team names (CSK, RCB, MI, etc.)
- The 🏏 emoji marks the currently batting team

### 📋 Categorized Dashboard
All platforms display matches dynamically sorted into:
- 🔴 **ONGOING** — Live matches in progress
- ✅ **COMPLETED** — Finished matches with final scores
- 📅 **SCHEDULED** — Upcoming matches

### 🧠 Smart State Math & Priority Engine
- **Bug-free detection:** Cricinfo's RSS feed leaves a buggy `*` on completed matches. Our engine parses the actual runs/wickets to determine the true match state.
- **Priority Selector:** Automatically brings the most relevant match to the front (Live Match > Completed Match > Scheduled Match).

---

## 🖥️ Supported Platforms

| Platform | Type | Extension / Script Location | Status |
|---|---|---|---|
| **GNOME Shell 45–50** | Native Extension (GJS) | [`gnome-extension/`](gnome-extension/) | ✅ Supported |
| **KDE Plasma 6** | Native Plasmoid (QML) | [`kde-plasmoid/`](kde-plasmoid/) | ✅ Supported |
| **COSMIC** (System76) | Native Applet (Rust) | [`cosmic-applet/`](cosmic-applet/) | ✅ Supported |
| **Cinnamon** (Linux Mint) | Native Applet (CJS) | [`cinnamon-applet/`](cinnamon-applet/) | ✅ Supported |
| **macOS** (xbar/SwiftBar) | Python Script | [`universal-script/`](universal-script/) | ✅ Supported |
| **Waybar** (Sway/Hyprland) | Python Script | [`universal-script/`](universal-script/) | ✅ Supported |
| **Polybar** (i3/bspwm) | Python Script | [`universal-script/`](universal-script/) | ✅ Supported |
| **dwm** | Python Script | [`universal-script/`](universal-script/) | ✅ Supported |
| **XFCE Genmon** | Python Script | [`universal-script/`](universal-script/) | ✅ Supported |
| **MATE Desktop** | Python Script | [`universal-script/`](universal-script/) | ✅ Supported |

---

## 🚀 Installation & Usage

### Method 1: The Auto-Installer (Recommended)
Use the included `Makefile` to auto-detect your OS and Desktop Environment to install the correct widget.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amogh-Gurudatta/IPL-Live-Score.git
   cd IPL-Live-Score
   ```

2. **Run the installer:**
   ```bash
   make install
   ```
   *This will evaluate your environment (`$XDG_CURRENT_DESKTOP`, `uname -s`, etc.) and automatically compile/install the correct widget.*

#### Manual Overrides
To force an installation for a specific environment (e.g., if auto-detect fails), or to view all available installation options, run:
```bash
make help
```

---

### Method 2: Manual Install from GitHub Releases
Alternatively, download the pre-packaged files directly from the **[Releases](https://github.com/Amogh-Gurudatta/IPL-Live-Score/releases)** page and install manually:

#### 1. GNOME (`ipl-live-score-gnome.zip`)
1. Open a terminal and install the extension:
   ```bash
   gnome-extensions install ipl-live-score-gnome.zip
   ```
2. **Important:** Log out and log back in, or restart GNOME Shell (Alt+F2 -> `r` -> Enter, on X11).
3. Open the **Extensions** app and enable "IPL Live Score".

#### 2. KDE Plasma (`ipl-live-score-kde.plasmoid`)
1. Open a terminal and install the plasmoid:
   ```bash
   kpackagetool6 -i ipl-live-score-kde.plasmoid
   ```
2. Right-click your panel -> **Enter Edit Mode** -> **Add Widgets**.
3. Search for "IPL Live Score" and drag it onto your panel.

#### 3. Cinnamon (`ipl-live-score-cinnamon.zip`)
1. Extract the ZIP file.
2. Move the nested `ipl-live-score@amogh` folder into your local applets directory:
   ```bash
   mv ipl-live-score@amogh ~/.local/share/cinnamon/applets/
   ```
3. Right-click your panel -> **Applets** -> **Manage** tab, find "IPL Live Score", and click the `+` icon to add it.

#### 4. COSMIC
Since COSMIC is still under heavy development and binaries are hardware-dependent, it is highly recommended to build from source. Clone this repository and run `make install-cosmic`.

#### 5. Window Managers & macOS (`ipl_score.py`)
If you downloaded the standalone **Universal Python Script**:
1. Make the script executable and copy it to a location in your PATH:
   ```bash
   chmod +x ipl_score.py
   mkdir -p ~/.local/bin
   mv ipl_score.py ~/.local/bin/ipl_score
   ```
2. Hook it into your bar of choice:
   - **Waybar**: Add to your config: `"custom/ipl": { "exec": "~/.local/bin/ipl_score --format waybar", "return-type": "json", "interval": 60 }`
   - **Polybar**: `exec = ~/.local/bin/ipl_score --format text | head -1`
   - **dwm**: `xsetroot -name "$(~/.local/bin/ipl_score --format dwm)"`
   - **macOS xbar**: Move the script into your plugins directory and ensure the `.1m.py` suffix is intact for a 1-minute refresh rate:
     ```bash
     mv ~/.local/bin/ipl_score ~/Library/Application\ Support/xbar/plugins/ipl_score.1m.py
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

The extension fetches `http://static.cricinfo.com/rss/livescores.xml` — a tiny, static XML file that Cricinfo has served reliably for over a decade. This logic is identically implemented across all platforms — in JavaScript (GNOME/KDE/Cinnamon), Python (Universal Script), and Rust (COSMIC).

---

## 🏗️ Project Structure

```text
.
├── gnome-extension/               # GNOME Shell 45-50 (GJS + Soup 3)
├── kde-plasmoid/                  # KDE Plasma 6 (QML + JS)
├── cosmic-applet/                 # COSMIC DE (Rust + iced)
├── cinnamon-applet/               # Cinnamon DE (CJS + Soup 3)
├── universal-script/              # Waybar/Polybar/dwm/XFCE/xbar/MATE (Python)
├── Makefile                       # OS/DE Auto-detecting installer
└── README.md
```

---

## 📄 License

Released under the [MIT License](LICENSE).

---

## 🙏 Credits

- **Data Source**: [ESPN Cricinfo](https://www.espncricinfo.com) RSS Feed
- **GNOME**: [gjs.guide](https://gjs.guide/extensions/)
- **KDE**: [Plasma Developer Documentation](https://develop.kde.org/docs/plasma/)
- **COSMIC**: [System76 COSMIC](https://github.com/pop-os/cosmic-epoch)
- **Cinnamon**: [Linux Mint Developer Guide](https://projects.linuxmint.com/reference/git/cinnamon-tutorials/write-applet.html)
- **xbar**: [xbar Plugin API](https://github.com/matryer/xbar-plugins)
