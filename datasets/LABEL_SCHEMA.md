# UAE7Guard Label Schema (Phase-1)

Each line in dataset files must be a valid JSON object (NDJSON format).

Required fields:

- `id`: unique label id (string)
- `createdAt`: ISO-8601 timestamp
- `analyst`: reviewer identifier
- `chainId`: EVM chain id (integer)
- `entity`: object
  - `type`: `address` | `transaction`
  - `value`: address or tx hash
- `decisionLabel`: `ALLOW` | `REVIEW` | `BLOCK`
- `groundTruth`: object
  - `isMalicious`: boolean
  - `category`: short taxonomy label (for example `address_poisoning`, `scam_router`, `benign_transfer`)
- `signals`: array of evidence objects
  - `type`: signal id (for example `blacklist_match`, `delegatecall_detected`)
  - `severity`: `low` | `medium` | `high` | `critical`
  - `source`: optional provider name

Optional fields:

- `notes`: free-form analyst context
- `links`: array of investigation links

Use this schema to compute precision/recall/FPR by decision bucket.
