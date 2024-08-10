// Middleware function to log requests
function logRequests(req, res, next) {
    console.log(`${req.ip || req.connection.remoteAddress} ${req.headers.origin} ${req.method} ${req.originalUrl} ${new Date().toISOString()}`);
    console.log('-----------------------------------------------------------------------------------------');
    next();
}


module.exports = logRequests;