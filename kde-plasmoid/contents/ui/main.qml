import QtQuick
import QtQuick.Layouts
import QtQuick.Controls as QQC2
import org.kde.plasma.plasmoid
import org.kde.plasma.core as PlasmaCore
import org.kde.plasma.components as PlasmaComponents
import org.kde.kirigami as Kirigami

PlasmoidItem {
    id: root

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    readonly property string rssUrl: "http://static.cricinfo.com/rss/livescores.xml"
    readonly property int pollInterval: 60000  // 60 seconds

    readonly property var iplTeams: ({
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
        "Sunrisers Hyderabad": "SRH"
    })

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    property string activeMatchText: "🏏 Loading IPL..."
    property var ongoingMatches: []
    property var completedMatches: []
    property var scheduledMatches: []

    // -----------------------------------------------------------------------
    // Compact Representation (panel bar text)
    // -----------------------------------------------------------------------

    compactRepresentation: PlasmaComponents.Label {
        text: root.activeMatchText
        font.pixelSize: Kirigami.Theme.defaultFont.pixelSize
        Layout.minimumWidth: implicitWidth
        Layout.preferredWidth: implicitWidth

        MouseArea {
            anchors.fill: parent
            onClicked: root.expanded = !root.expanded
        }
    }

    // -----------------------------------------------------------------------
    // Full Representation (expanded popup)
    // -----------------------------------------------------------------------

    fullRepresentation: ColumnLayout {
        spacing: Kirigami.Units.smallSpacing
        Layout.preferredWidth: Kirigami.Units.gridUnit * 22
        Layout.preferredHeight: implicitHeight
        Layout.minimumHeight: Kirigami.Units.gridUnit * 8
        Layout.maximumHeight: Kirigami.Units.gridUnit * 30

        // Active match header
        PlasmaComponents.Label {
            text: root.activeMatchText
            font.bold: true
            font.pixelSize: Kirigami.Theme.defaultFont.pixelSize * 1.1
            Layout.fillWidth: true
            Layout.bottomMargin: Kirigami.Units.smallSpacing
            horizontalAlignment: Text.AlignHCenter
        }

        // Separator
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Kirigami.Theme.disabledTextColor
            opacity: 0.3
        }

        // Scrollable match list
        QQC2.ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true

            ColumnLayout {
                width: parent.width
                spacing: Kirigami.Units.smallSpacing

                // --- ONGOING ---
                Repeater {
                    model: root.ongoingMatches.length > 0 ? 1 : 0
                    PlasmaComponents.Label {
                        text: "🔴 ONGOING"
                        font.bold: true
                        font.pixelSize: Kirigami.Theme.defaultFont.pixelSize * 0.9
                        color: Kirigami.Theme.disabledTextColor
                        Layout.fillWidth: true
                        Layout.topMargin: Kirigami.Units.smallSpacing
                    }
                }
                Repeater {
                    model: root.ongoingMatches
                    PlasmaComponents.Label {
                        text: "  " + modelData
                        Layout.fillWidth: true
                        wrapMode: Text.WordWrap
                    }
                }

                // --- COMPLETED ---
                Repeater {
                    model: root.completedMatches.length > 0 ? 1 : 0
                    PlasmaComponents.Label {
                        text: "✅ COMPLETED"
                        font.bold: true
                        font.pixelSize: Kirigami.Theme.defaultFont.pixelSize * 0.9
                        color: Kirigami.Theme.disabledTextColor
                        Layout.fillWidth: true
                        Layout.topMargin: Kirigami.Units.smallSpacing
                    }
                }
                Repeater {
                    model: root.completedMatches
                    PlasmaComponents.Label {
                        text: "  " + modelData
                        Layout.fillWidth: true
                        wrapMode: Text.WordWrap
                    }
                }

                // --- SCHEDULED ---
                Repeater {
                    model: root.scheduledMatches.length > 0 ? 1 : 0
                    PlasmaComponents.Label {
                        text: "📅 SCHEDULED"
                        font.bold: true
                        font.pixelSize: Kirigami.Theme.defaultFont.pixelSize * 0.9
                        color: Kirigami.Theme.disabledTextColor
                        Layout.fillWidth: true
                        Layout.topMargin: Kirigami.Units.smallSpacing
                    }
                }
                Repeater {
                    model: root.scheduledMatches
                    PlasmaComponents.Label {
                        text: "  " + modelData
                        Layout.fillWidth: true
                        wrapMode: Text.WordWrap
                    }
                }

                // No matches fallback
                Repeater {
                    model: (root.ongoingMatches.length === 0 &&
                            root.completedMatches.length === 0 &&
                            root.scheduledMatches.length === 0) ? 1 : 0
                    PlasmaComponents.Label {
                        text: "No other IPL matches"
                        color: Kirigami.Theme.disabledTextColor
                        Layout.fillWidth: true
                        horizontalAlignment: Text.AlignHCenter
                    }
                }
            }
        }

        // Separator
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: Kirigami.Theme.disabledTextColor
            opacity: 0.3
        }

        // Refresh button
        QQC2.Button {
            text: "Refresh Now"
            icon.name: "view-refresh"
            Layout.fillWidth: true
            onClicked: {
                pollTimer.restart();
                fetchScores();
            }
        }
    }

    // -----------------------------------------------------------------------
    // Core Logic (JS)
    // -----------------------------------------------------------------------

    function isMatchFinished(title) {
        var scoreRegex = /\b(\d+)\/(\d+)\b/g;
        var scores = [];
        var m;
        while ((m = scoreRegex.exec(title)) !== null) {
            scores.push({ runs: parseInt(m[1], 10), wkts: parseInt(m[2], 10) });
        }

        if (scores.length < 2) return false;

        if (scores[1].runs > scores[0].runs) return true;
        if (scores[0].wkts === 10 || scores[1].wkts === 10) return true;

        return false;
    }

    function shortenTitle(title) {
        var result = title;
        var keys = Object.keys(root.iplTeams);
        for (var i = 0; i < keys.length; i++) {
            // Global replace without regex — split and join
            result = result.split(keys[i]).join(root.iplTeams[keys[i]]);
        }
        return result;
    }

    function parseXml(xmlText) {
        // Extract all <item> blocks using regex (QML has no DOMParser)
        var matchRegex = /<item>[\s\S]*?<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>[\s\S]*?<\/item>/gi;
        var teamNames = Object.keys(root.iplTeams);

        var iplMatches = [];
        var execResult;

        while ((execResult = matchRegex.exec(xmlText)) !== null) {
            var titleText = execResult[1] || "";

            // Skip generic channel title
            if (titleText.indexOf("Cricinfo Live Scores") !== -1 || titleText.trim() === "")
                continue;

            // Filter: must contain an IPL team
            var isIpl = false;
            for (var i = 0; i < teamNames.length; i++) {
                if (titleText.indexOf(teamNames[i]) !== -1) {
                    isIpl = true;
                    break;
                }
            }
            if (!isIpl) continue;

            // Shorten team names
            var shortened = shortenTitle(titleText);

            // Smart State Math
            var hasAsterisk = shortened.indexOf("*") !== -1;
            var hasStarted = /\d/.test(shortened);
            var finished = isMatchFinished(shortened);
            var isLive = hasAsterisk && !finished;

            // Replace '*' with 🏏 for display
            var displayTitle = shortened.split("*").join("🏏");

            iplMatches.push({
                title: displayTitle,
                isLive: isLive,
                hasStarted: hasStarted,
                isFinished: finished
            });
        }

        return iplMatches;
    }

    function fetchScores() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== XMLHttpRequest.DONE) return;

            if (xhr.status !== 200) {
                root.activeMatchText = "🏏 IPL: Offline";
                root.ongoingMatches = [];
                root.completedMatches = [];
                root.scheduledMatches = [];
                return;
            }

            var iplMatches = parseXml(xhr.responseText);

            if (iplMatches.length === 0) {
                root.activeMatchText = "🏏 IPL: No Live Matches";
                root.ongoingMatches = [];
                root.completedMatches = [];
                root.scheduledMatches = [];
                return;
            }

            // Reverse so newest matches come first
            iplMatches.reverse();

            // Priority Selector: Live > Started > Scheduled
            var active = null;
            for (var i = 0; i < iplMatches.length; i++) {
                if (iplMatches[i].isLive) { active = iplMatches[i]; break; }
            }
            if (!active) {
                for (var j = 0; j < iplMatches.length; j++) {
                    if (iplMatches[j].hasStarted) { active = iplMatches[j]; break; }
                }
            }
            if (!active) {
                active = iplMatches[0];
            }

            root.activeMatchText = "🏏 " + active.title;

            // Categorize remaining matches
            var ongoing = [], completed = [], scheduled = [];
            for (var k = 0; k < iplMatches.length; k++) {
                var m = iplMatches[k];
                if (m === active) continue;

                if (m.isLive) ongoing.push(m.title);
                else if (m.isFinished) completed.push(m.title);
                else if (!m.hasStarted) scheduled.push(m.title);
            }

            root.ongoingMatches = ongoing;
            root.completedMatches = completed;
            root.scheduledMatches = scheduled;
        };

        xhr.open("GET", root.rssUrl);
        xhr.send();
    }

    // -----------------------------------------------------------------------
    // Timer
    // -----------------------------------------------------------------------

    Timer {
        id: pollTimer
        interval: root.pollInterval
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: fetchScores()
    }
}
