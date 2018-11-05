const fs = require('fs');

function readStoredData() {
  try {
    return JSON.parse(fs.readFileSync('phantomRoles.json', 'utf-8'));
  } catch (e) {
    return {};
  }
}

function writeOutput(data) {
  fs.writeFile(`phantomRoles.json`, JSON.stringify(data), function(err, data){
    if (err) console.log(err);
    console.log("Successfully Written to File.");
  });
}

module.exports = {
  writeOutput,
  readStoredData
};
