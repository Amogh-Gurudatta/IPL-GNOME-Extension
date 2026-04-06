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
If you cloned this repository, we provide a highly intelligent, auto-detecting `Makefile` that scans your OS and Desktop Environment to install the correct native version automatically.

Open a terminal in the project root and run:
```bash
make install
```
*This will evaluate your environment (`$XDG_CURRENT_DESKTOP`, `uname -s`, etc.) and automatically compile/install the correct widget.*

#### Manual Overrides
To force an installation for a specific environment, or view all installation options, run:
```bash
make help
```

---

### Method 2: Manual Install from GitHub Releases
If you downloaded the pre-packaged files from the **[Releases](https://github.com/Amogh-Gurudatta/IPL-Live-Score/releases)** page, follow these instructions based on the file you downloaded:

- **GNOME (`ipl-live-score-gnome.zip`)**:
  ```bash
  gnome-extensions install ipl-live-score-gnome.zip
  # Log out and log back in, then enable via GNOME Extensions app
  ```

- **KDE Plasma (`ipl-live-score-kde.plasmoid`)**:
  ```bash
  kpackagetool6 -i ipl-live-score-kde.plasmoid
  # Add to your panel via the "Add Widgets" menu
  ```

- **Cinnamon (`ipl-live-score-cinnamon.zip`)**:
  Extract the ZIP and place the isolated `ipl-live-score@amogh` folder directly into `~/.local/share/cinnamon/applets/`
  
- **COSMIC** (Source Build):
  You will need to manually clone this repository and run `make install-cosmic` to build the applet locally, as COSMIC updates rapidly and binaries are hardware-dependent.

#### Window Managers & macOS (`ipl_score.py`)
If you downloaded the standalone **Universal Python Script**:
Make the script executable (`chmod +x ipl_score.py`) and move it to `~/.local/bin/ipl_score`, then hook it into your bar:
- **Waybar**: Add to config: `"custom/ipl": { "exec": "~/.local/bin/ipl_score --format waybar", "return-type": "json", "interval": 60 }`
- **Polybar**: `exec = ~/.local/bin/ipl_score --format text | head -1`
- **dwm**: `xsetroot -name "$(~/.local/bin/ipl_score --format dwm)"`
- **macOS xbar**: Copy the script into `~/Library/Application Support/xbar/plugins/ipl_score.1m.py` and ensure the `.1m.py` suffix is intact.

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
