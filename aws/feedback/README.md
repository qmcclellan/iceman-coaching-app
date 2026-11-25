# Iceman feedback API (AWS)

One small API that both Iceman apps send feedback to:

- **Amazon API Gateway (HTTP API):** route `POST /feedback`, CORS limited to the two app sites, throttled.
- **AWS Lambda (Node.js):** `index.mjs` checks the request and saves it.
- **Amazon DynamoDB:** table `IcemanFeedback`, partition key `app`, sort key `sk`.

## Lambda settings

Environment variables:

| Name | Value |
| --- | --- |
| `TABLE_NAME` | `IcemanFeedback` |
| `ALLOWED_APPS` | `iceman-coaching-app,iceman-qb-cards` |
| `ALLOWED_ORIGINS` | the two app site addresses, comma separated, no trailing slash |

The Lambda role only needs `dynamodb:PutItem` on that one table.

## What it accepts

`POST /feedback` with JSON `{ "app": "...", "message": "...", "screen": "...", "sent": "..." }`.
Body up to 4 KB, message up to 2,000 characters, `app` must be one of `ALLOWED_APPS`, and the request's `Origin` must be one of `ALLOWED_ORIGINS`.
Returns `201 {"ok":true}` when saved.

Nothing stored identifies the sender: no IP address, name or email.
