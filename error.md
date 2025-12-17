$ cd C:\Users\nikol\Desktop\new-apps\1\tdd\voice-clipboard; docker compose ps
NAME                    IMAGE                 COMMAND                  SERVICE   CREATED          STATUS                         PORTS
voice-clipboard-api-1   voice-clipboard-api   "docker-entrypoint.s…"   api       16 seconds ago   Restarting (1) 5 seconds ago   
voice-clipboard-web-1   voice-clipboard-web   "/docker-entrypoint.…"   web       16 seconds ago   Up 14 seconds                  0.0.0.0:6747->80/tcp, [::]:6747->80/tcp
$ cd C:\Users\nikol\Desktop\new-apps\1\tdd\voice-clipboard; docker compose logs api --tail 10
api-1  | Error: Cannot find module '/app/dist/backend/src/server.js'
api-1  |     at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
api-1  |     at Module._load (node:internal/modules/cjs/loader:1038:27)
api-1  |     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:164:12)
api-1  |     at node:internal/main/run_main_module:28:49 {
api-1  |   code: 'MODULE_NOT_FOUND',
api-1  |   requireStack: []
api-1  | }
api-1  | 
api-1  | Node.js v20.19.6
$ 