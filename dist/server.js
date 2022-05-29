import http from "http";
import { requestHandler } from "./routes";
// const http = require('http');
const server = http.createServer(requestHandler);
server.listen(3000);
//# sourceMappingURL=server.js.map