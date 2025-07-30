const fs = require("fs");
const path = require("path");

const baseDir = path.join(__dirname, "public/data");
const outputFile = path.join(__dirname, "public", "fileList.json");
const years = fs.readdirSync(baseDir);

const result = {};

years.forEach((year) => {
  const yearDir = path.join(baseDir, year);
  if (fs.statSync(yearDir).isDirectory()) {
    const files = fs
      .readdirSync(yearDir)
      .filter((file) => /^delays\d{2}\.csv$/.test(file)) // Filter files matching the pattern
      .map((file) => file.match(/^delays(\d{2})\.csv$/)[1]); // Extract the month number
    result[year] = files;
    // JSON-Datei schreiben
  }
});

fs.writeFile(outputFile, JSON.stringify(result, null, 2), (err) => {
  if (err) {
    console.error("Fehler beim Schreiben der fileList.json:", err);
  } else {
    console.log(`fileList.json wurde erstellt.`);
  }
});
