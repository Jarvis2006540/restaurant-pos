const fs = require('fs');
const path = require('path');

const appCssPath = path.join(__dirname, 'src', 'App.css');
let appCssContent = fs.readFileSync(appCssPath, 'utf8');

// Align .orders-page and .bill-page padding with .page-container
appCssContent = appCssContent.replace(
  /\.orders-page \{\s*padding: 2rem;/g,
  ".orders-page {\n  padding: 1.5rem;"
);

appCssContent = appCssContent.replace(
  /\.bill-page \{\s*padding: 2rem;/g,
  ".bill-page {\n  padding: 1.5rem;"
);

// Also remove margin-bottom: 2rem from report-summary if it conflicts
appCssContent = appCssContent.replace(
  /\.report-summary \{\s*grid-template-columns: 1fr !important;\s*\}/g,
  ".report-summary {\n    grid-template-columns: 1fr !important;\n  }"
);

fs.writeFileSync(appCssPath, appCssContent);
console.log('Padding aligned across all pages');
