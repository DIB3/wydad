const app = require('./app');
const http = require('http');
const { initSocket } = require('./socket');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Serveur sur le port ${PORT}`));
