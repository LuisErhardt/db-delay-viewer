const fs = require("fs");
const path = require("path");

const date = new Date().toLocaleDateString("de-DE", {
  timeZone: "Europe/Berlin",
});
const content = `export const BUILD_DATE = '${date}';\n`;

fs.writeFileSync(path.join(__dirname, "../src/build-info.ts"), content);
console.log("Build Datum geschrieben:", date);
