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

// //catch uncaught exceptions, trace, then exit normally
// process.on('uncaughtException', function (e) {
//     console.log("Cleanup UNCAUGHT")
//     errorLogging(e)
//     writeStatsBeforeClosing().finally(() => { process.exit(99) });

// });

module.exports.default = process;