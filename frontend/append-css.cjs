const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'App.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const additionalMediaQueries = `
  .reports-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media screen and (max-width: 767px) {
    .reports-grid {
      grid-template-columns: 1fr;
    }
  }
`;

fs.writeFileSync(cssPath, cssContent + additionalMediaQueries);
console.log('Appended reports-grid CSS Successfully');
