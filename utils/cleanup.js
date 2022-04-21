const { writeStatsBeforeClosing, errorLogging } = require("../middleware/logging");

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