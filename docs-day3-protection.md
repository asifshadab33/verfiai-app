# Day 3 verification protection

- Fact checks and citation scans reuse complete responses for **24 hours**. SHA-256 keys include caller scope, operation, language, and normalized text. URL paths remain case-sensitive. Only case/whitespace variants are reused; semantic paraphrases are not assumed equivalent.
- `verification_cache` is service-role-only with RLS enabled and no browser access. Expired rows are never served and are cleaned opportunistically on cache writes; this is not guaranteed deletion at exactly 24 hours.
- All fact-check, citation-scan and report entry points reserve a request slot before work, including cache hits. The shared atomic database bucket accepts **5 guest requests/hour** or **20 signed-in requests/day**, with windows starting on the first accepted request. Denied requests do not extend the window. Failures still count for abuse protection.
- Guest abuse buckets use the hosting edge's IP header, not user-agent or client-provided identity. `x-forwarded-for` is accepted only on localhost for testing. If the trusted header is absent in production, guests share a conservative fallback bucket rather than accepting a spoofable header.
- Existing monthly quotas and credits remain unchanged. Complete response cache hits bypass quota reservation and credits; the UI rereads actual usage rather than incrementing a browser counter. Cache misses still require available monthly allowance.
- Rate denials return HTTP **429** and a friendly refresh-window message. The server sets `Retry-After`, but the RPC error serializer currently omits that header on the wire; clients should use the displayed message rather than assume the header exists.
- Existing `research_cache` provider caching and seven-day research-report caching remain intact. The new table caches verification responses, not saved report identities or sharing permissions.

## Budget monitoring

Use **$50/month** as the operator's review threshold for provider spend. Existing `usage_meter` cost estimates support review but are not exact billing totals. No automatic budget alert or spend cutoff is connected by this change; rate limiting and caching cannot guarantee a monthly spend ceiling.

## Checks

Run `bunx vitest run src/lib/verification-policy.test.ts src/lib/verification-guard.integration.test.ts`. Integration tests use server credentials from the environment, never log them, create isolated hashed test buckets, and clean them afterward. Browser verification exercised one real Crossref DOI scan, four cached repeats, and the sixth request's HTTP 429. The backend recorded one response and one quota use. Concurrent database tests accepted exactly five guest and twenty authenticated requests, and verified one-hour/day reset windows.
