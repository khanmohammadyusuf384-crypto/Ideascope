# IdeaScope Auth Flow (Draft)

This is a simple plan for auth.  
Nothing here is implemented yet.  
This is just so we know how to build it later.

## Why we need this

Right now anyone can call APIs and there is no user identity.  
Later we want each idea/workspace to belong to a user.

## Basic flow (token based)

1. User logs in (future endpoint like `POST /api/auth/login`)
2. Backend checks login details
3. Backend creates token
4. Frontend stores token
5. Frontend sends token with API requests
6. Backend checks token before giving protected data

Short version:

`login -> token -> request -> validation`

## Token details (planned)

Token should include:

- user id (`sub`)
- workspace id (if user selected one)
- created time (`iat`)
- expiry time (`exp`)

## Where token is stored

For now idea is:

- better/safer option later: HTTP-only cookie
- simple option for frontend testing: memory or `localStorage`

## How requests should look

Frontend sends:

`Authorization: Bearer <token>`

## What backend should do on request

- Read token from header
- Validate signature + expiry
- If valid, add user info to request object (`req.auth`)
- If missing/invalid, return `401 Unauthorized`

## Validation examples

Input: "User logs in"  
Output: "System generates token and stores it"

Input: "User requests data"  
Output: "Token is checked before access"

## Future files (not created yet)

- `backend/src/middleware/auth.js`
- `backend/src/routes/auth.js`

Protected routes later will use auth middleware before the route logic.
