// Middleware function to log requests
function logRequests(req, res, next) {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const origin = req.headers.origin || req.headers.referer || 'unknown';
    const method = req.method;
    const url = req.originalUrl;
    const timestamp = new Date().toISOString();
    
    console.log(`${clientIp} ${origin} ${method} ${url} ${timestamp}`);
    console.log('-----------------------------------------------------------------------------------------');
    
    next();
}

module.exports = logRequests;
