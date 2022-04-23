const { writeStatsBeforeClosing, errorLogging } = require("../middleware/logging");

// This cleanup function adds some methods to the NodeJS process: when the app is closed, they write down stats on the disk. 
// Since the stats are not business critical, I didn't add a timed recurring method that exports stats to the disk every X hours - that'd be a smart backup mechanism, to save at least partial data in case of power issues.

process.stdin.resume();

process.on("SIGTERM", () => {
    console.log("Cleanup SIGTERM")
    writeStatsBeforeClosing().finally(() => { process.exit(0) });
})
process.on("SIGINT", () => {
    console.log("Cleanup SIGINT")
    writeStatsBeforeClosing().finally(() => { process.exit(0) });
})
process.on("EXIT", () => {
    console.log("Cleanup EXIT")
    writeStatsBeforeClosing().finally(() => { process.exit(0) });
})

module.exports.default = process;