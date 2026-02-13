const morgan = require('morgan');

morgan.token('timestamp', () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
});

const loggerMiddleware = morgan('[:timestamp] :method :url - :status - :response-time ms');

module.exports = loggerMiddleware;
