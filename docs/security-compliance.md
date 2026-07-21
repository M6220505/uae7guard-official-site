# UAE7Guard Security and Compliance Notes

## Product positioning

UAE7Guard is positioned as **Web3 fraud prevention and wallet risk intelligence for MENA users and businesses**.

Primary audiences:

1. Consumer wallet safety: simple warnings before users sign risky approvals or transfers.
2. Business/API risk scoring: rate-limited API endpoints, API-key authentication, reports, and future SLAs.
3. UAE/MENA compliance: Arabic/English UX, AML/sanctions enrichment, and audit-friendly reporting.

## Production controls added

- API-key authentication through `UAE7GUARD_API_KEY` and the `x-api-key` header.
- In-memory rate limiting through `API_RATE_LIMIT_WINDOW_MS` and `API_RATE_LIMIT_MAX`.
- Live blockchain intelligence through RPC reads and Etherscan-family explorers where keys are configured.
- Pre-sign transaction simulation messaging focused on plain-language user protection.

## Required production integrations

- Reliable RPC provider: Alchemy or per-chain `CHAIN_<id>_RPC_URL`.
- Explorer keys: `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, `POLYGONSCAN_API_KEY`, `BASESCAN_API_KEY`, `ARBISCAN_API_KEY`, `OPTIMISTIC_ETHERSCAN_API_KEY`.
- Commercial threat feeds: Chainalysis/TRM/Forta credentials where licensing permits.

## Disclaimer

UAE7Guard reports are risk signals. They do not guarantee complete scam detection and are not legal, financial, tax, or investment advice.
