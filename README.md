# LiveConnect

Go Live. Connect. Talk.

Live video, voice rooms and chat app for Android and iOS.

## Structure
- apps/mobile - Expo React Native app (empty, to be built)
- apps/api - Backend API (empty placeholder)
- apps/admin - Admin dashboard (empty, to be built)
- packages/ - shared code, types, config
- infrastructure/ - database, livekit, redis, docker, deployment
- docs/ - documentation
- scripts/ - helper scripts
- tests/ - tests

## Add your API (Termux)
1. bash scripts/import-api.sh
   (or: bash scripts/import-api.sh /path/to/your/api)
2. cd apps/api && npm install
3. Create apps/api/.env yourself. Secrets are never copied.
