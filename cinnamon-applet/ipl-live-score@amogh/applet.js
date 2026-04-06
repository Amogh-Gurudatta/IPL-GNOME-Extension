// IPL Live Score — Cinnamon Desktop Applet (CJS)
//
// A native panel applet for Linux Mint's Cinnamon DE that streams
// live IPL cricket scores with smart state detection.
//
// CRITICAL: Uses CJS-style imports (NOT GJS/ESM).

const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Settings = imports.ui.settings;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const St = imports.gi.St;
const Lang = imports.lang;
const ByteArray = imports.byteArray;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RSS_URL = "http://static.cricinfo.com/rss/livescores.xml";
const POLL_INTERVAL_SECS = 60;

const IPL_TEAMS = {
    "Chennai Super Kings": "CSK",
    "Delhi Capitals": "DC",
    "Gujarat Titans": "GT",
    "Kolkata Knight Riders": "KKR",
    "Lucknow Super Giants": "LSG",
    "Mumbai Indians": "MI",
    "Punjab Kings": "PBKS",
    "Rajasthan Royals": "RR",
    "Royal Challengers Bengaluru": "RCB",
    "Royal Challengers Bangalore": "RCB",
    "Sunrisers Hyderabad": "SRH",
};

const TEAM_NAMES = Object.keys(IPL_TEAMS);

// ---------------------------------------------------------------------------
// Core Logic (Pure Functions)
// ---------------------------------------------------------------------------

/**
 * Determine whether a match has finished based on the score string.
 *
 * Rules:
 *   - If the chasing team's runs exceed the first team's runs → finished.
 *   - If either team is all out (wickets === 10) → finished.
 */
function isMatchFinished(title) {
    const scoreRegex = /\b(\d+)\/(\d+)\b/g;
    let scores = [];
    let match;
    while ((match = scoreRegex.exec(title)) !== null) {
        scores.push({
            runs: parseInt(match[1], 10),
            wkts: parseInt(match[2], 10),
        });
    }

    if (scores.length < 2) {
        return false;
    }

    const runs1 = scores[0].runs;
    const wkts1 = scores[0].wkts;
    const runs2 = scores[1].runs;
    const wkts2 = scores[1].wkts;

    if (runs2 > runs1) return true;
    if (wkts1 === 10 || wkts2 === 10) return true;

    return false;
}

/**
 * Shorten full team names to abbreviations.
 */
function shortenTitle(titleText) {
    let shortened = titleText;
    for (let fullName in IPL_TEAMS) {
        // Use split/join for replaceAll compatibility in CJS
        shortened = shortened.split(fullName).join(IPL_TEAMS[fullName]);
    }
    return shortened;
}

// ---------------------------------------------------------------------------
// Cinnamon Applet
// ---------------------------------------------------------------------------

class IplLiveScoreApplet extends Applet.TextIconApplet {

    constructor(metadata, orientation, panelHeight, instanceId) {
        super(orientation, panelHeight, instanceId);

        this.metadata = metadata;
        this._orientation = orientation;
        this._instanceId = instanceId;

        // Panel appearance
        this.set_applet_icon_symbolic_name("applications-games-symbolic");
        this.set_applet_label("🏏 Loading IPL...");
        this.set_applet_tooltip("IPL Live Score — Click for details");

        // Build popup menu
        this.menuManager = new PopupMenu.PopupMenuManager(this);
        this.menu = new Applet.AppletPopupMenu(this, orientation);
        this.menuManager.addMenu(this.menu);

        // Soup session (Soup 3 API)
        this._session = new Soup.Session();

        // Polling
        this._timeoutId = null;

        // Initial fetch
        this._fetchScore();
        this._startPolling();
    }

    // -----------------------------------------------------------------------
    // Applet lifecycle
    // -----------------------------------------------------------------------

    on_applet_clicked() {
        this.menu.toggle();
    }

    on_applet_removed_from_panel() {
        this._stopPolling();
        if (this._session) {
            this._session.abort();
            this._session = null;
        }
    }

    // -----------------------------------------------------------------------
    // Polling
    // -----------------------------------------------------------------------

    _startPolling() {
        this._stopPolling();
        this._timeoutId = Mainloop.timeout_add_seconds(POLL_INTERVAL_SECS, () => {
            this._fetchScore();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _stopPolling() {
        if (this._timeoutId) {
            Mainloop.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _manualRefresh() {
        this._stopPolling();
        this._fetchScore();
        this._startPolling();
    }

    // -----------------------------------------------------------------------
    // Fallback menu (offline / no matches)
    // -----------------------------------------------------------------------

    _buildFallbackMenu(labelText) {
        this.menu.removeAll();
        this.set_applet_label(labelText);

        let infoItem = new PopupMenu.PopupMenuItem(labelText, { reactive: false });
        this.menu.addMenuItem(infoItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let refreshItem = new PopupMenu.PopupMenuItem("🔄 Refresh Now");
        refreshItem.connect("activate", () => this._manualRefresh());
        this.menu.addMenuItem(refreshItem);
    }

    // -----------------------------------------------------------------------
    // Network — Soup 3 async fetch
    // -----------------------------------------------------------------------

    _fetchScore() {
        if (!this._session) return;

        let message;
        try {
            message = Soup.Message.new("GET", RSS_URL);
        } catch (e) {
            global.logError("[IPL Live Score] Bad URL: " + e.message);
            this._buildFallbackMenu("🏏 IPL: Offline");
            return;
        }

        if (!message) {
            global.logError("[IPL Live Score] Could not create Soup.Message");
            this._buildFallbackMenu("🏏 IPL: Offline");
            return;
        }

        try {
            this._session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (session, result) => {
                    try {
                        let bytes = session.send_and_read_finish(result);

                        let statusCode = message.get_status();
                        if (statusCode !== Soup.Status.OK) {
                            global.logWarning("[IPL Live Score] HTTP " + statusCode);
                            this._buildFallbackMenu("🏏 IPL: Offline");
                            return;
                        }

                        // Decode bytes to string
                        let data = bytes.get_data();
                        let text;
                        if (data instanceof Uint8Array) {
                            text = ByteArray.toString(data);
                        } else {
                            text = data.toString();
                        }

                        this._processXml(text);
                    } catch (innerError) {
                        global.logError("[IPL Live Score] Response error: " + innerError.message);
                        this._buildFallbackMenu("🏏 IPL: Offline");
                    }
                }
            );
        } catch (outerError) {
            global.logError("[IPL Live Score] Request error: " + outerError.message);
            this._buildFallbackMenu("🏏 IPL: Offline");
        }
    }

    // -----------------------------------------------------------------------
    // XML parsing & match processing
    // -----------------------------------------------------------------------

    _processXml(xmlText) {
        // Regex to extract <item> blocks with <title> and <link>
        const matchRegex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<\/item>/gi;

        let iplMatches = [];
        let m;

        while ((m = matchRegex.exec(xmlText)) !== null) {
            let titleText = m[1] || "";
            let linkText = (m[2] || "").trim();

            if (titleText.indexOf("Cricinfo Live Scores") !== -1 || titleText.trim() === "") {
                continue;
            }

            // Filter: must contain an IPL team name
            let isIplMatch = TEAM_NAMES.some(function(team) {
                return titleText.indexOf(team) !== -1;
            });
            if (!isIplMatch) continue;

            // Shorten team names
            let shortened = shortenTitle(titleText);

            // Smart State Math
            let hasAsterisk = shortened.indexOf("*") !== -1;
            let hasStarted = /\d/.test(shortened);
            let finished = isMatchFinished(shortened);
            let isLive = hasAsterisk && !finished;

            // Replace '*' with 🏏 for display
            let displayTitle = shortened.split("*").join("🏏");

            iplMatches.push({
                title: displayTitle,
                link: linkText,
                isLive: isLive,
                hasStarted: hasStarted,
                isFinished: finished,
            });
        }

        if (iplMatches.length === 0) {
            this._buildFallbackMenu("🏏 IPL: No Live Matches");
            return;
        }

        // Reverse so newest matches come first
        iplMatches.reverse();

        // ---------------------------------------------------------------
        // Priority Selector: Live > Started > Scheduled
        // ---------------------------------------------------------------
        let activeMatch =
            iplMatches.find(function(m) { return m.isLive; }) ||
            iplMatches.find(function(m) { return m.hasStarted; }) ||
            iplMatches[0];

        // ---------------------------------------------------------------
        // Build the Dynamic Menu
        // ---------------------------------------------------------------
        this.menu.removeAll();

        let scoreText = activeMatch.title;
        let scoreLink = activeMatch.link;

        // Set panel label
        this.set_applet_label(scoreText);

        // --- Timestamp ---
        let now = new Date();
        let timeStr = now.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        let timeItem = new PopupMenu.PopupMenuItem(
            "Last Updated: " + timeStr, { reactive: false }
        );
        this.menu.addMenuItem(timeItem);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // --- Open in Browser ---
        let openItem = new PopupMenu.PopupMenuItem("🌐 Open Match in Browser");
        openItem.connect("activate", function() {
            try {
                Gio.AppInfo.launch_default_for_uri(scoreLink, null);
            } catch (e) {
                global.logError("[IPL Live Score] Could not open URI: " + e.message);
            }
        });
        this.menu.addMenuItem(openItem);

        // --- Copy Score ---
        let copyItem = new PopupMenu.PopupMenuItem("📋 Copy Score");
        copyItem.connect("activate", function() {
            let clipboard = St.Clipboard.get_default();
            clipboard.set_text(St.ClipboardType.CLIPBOARD, scoreText);
        });
        this.menu.addMenuItem(copyItem);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // --- Categorize remaining matches ---
        let otherMatches = iplMatches.filter(function(m) { return m !== activeMatch; });

        let ongoingMatches = otherMatches.filter(function(m) { return m.isLive; });
        let completedMatches = otherMatches.filter(function(m) { return m.isFinished; });
        let scheduledMatches = otherMatches.filter(function(m) { return !m.hasStarted; });

        let self = this;

        function addCategory(categoryTitle, matchesArray) {
            if (matchesArray.length === 0) return;

            // Non-reactive bold header
            let header = new PopupMenu.PopupMenuItem(categoryTitle, { reactive: false });
            header.label.set_style("font-weight: bold; font-size: 0.9em; color: #aaaaaa;");
            self.menu.addMenuItem(header);

            // Clickable match items
            matchesArray.forEach(function(match) {
                let item = new PopupMenu.PopupMenuItem("  " + match.title);
                item.connect("activate", function() {
                    try {
                        Gio.AppInfo.launch_default_for_uri(match.link, null);
                    } catch (e) {
                        global.logError("[IPL Live Score] Could not open URI: " + e.message);
                    }
                });
                self.menu.addMenuItem(item);
            });

            self.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        }

        addCategory("🔴 ONGOING", ongoingMatches);
        addCategory("✅ COMPLETED", completedMatches);
        addCategory("📅 SCHEDULED", scheduledMatches);

        // --- Refresh Now ---
        let refreshItem = new PopupMenu.PopupMenuItem("🔄 Refresh Now");
        refreshItem.connect("activate", () => this._manualRefresh());
        this.menu.addMenuItem(refreshItem);
    }
}

// ---------------------------------------------------------------------------
// Export — Cinnamon entry point
// ---------------------------------------------------------------------------

function main(metadata, orientation, panelHeight, instanceId) {
    return new IplLiveScoreApplet(metadata, orientation, panelHeight, instanceId);
}
