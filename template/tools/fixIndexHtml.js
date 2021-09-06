const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '../build/index.html');
fs.readFile(indexHtmlPath, 'utf8', (err, data) => {
  if (err) {
    console.dir(err);
    return;
  }

  const result = data.replace(/"\/static/g, '"./static');
  fs.writeFile(indexHtmlPath, result, 'utf8', e => {
    if (e) {
      console.dir(e);
    }
  });
});
