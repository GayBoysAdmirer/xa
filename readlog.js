const fs = require('fs');
const path = '/root/.npm/_logs/2024-07-08T15_11_22_053Z-debug-0.log';

fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading log file:', err);
        return;
    }
    console.log('Log file contents:\n', data);
});
