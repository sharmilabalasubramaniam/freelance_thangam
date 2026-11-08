const fs = require('fs');
let code = fs.readFileSync('client/src/services/api.js', 'utf8');

const target = `    async deleteEnquiry(id) {
      return this._request(\`/enquiries/\${id}\`, {
        method: 'DELETE'
      });
    }`;

const addition = `    async deleteEnquiry(id) {
      return this._request(\`/enquiries/\${id}\`, {
        method: 'DELETE'
      });
    },

    /**
     * Download secure CSV of enquiries
     */
    getExportCsvUrl() {
      return \`\${this.baseUrl}/admin/export-csv\`;
    }`;

if (code.includes(target)) {
  code = code.replace(target, addition);
  fs.writeFileSync('client/src/services/api.js', code, 'utf8');
  console.log('Successfully updated client/src/services/api.js with getExportCsvUrl');
} else {
  console.log('Target not found in api.js');
}

