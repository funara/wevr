---
name: test-mocking-strategy
description: Guidelines on when and how to mock external services (databases, network requests, third-party APIs) during test creation.
---

# Mocking & Test Double Strategy

## Core Principles

- **No Over-Mocking**: Limit mocks to external trust boundaries (e.g., external HTTP endpoints, third-party API clients). Never mock internal domain models, database queries, helper utilities, or core business logic unless absolutely necessary.
- **Contract Verification**: Ensure mock payloads and responses strictly match the actual schema of the external API. Stale mocks that hide schema drift are a major regression risk.
- **Prefer Stubs over Mocks**: Use simple stubs (returning canned data) over complex mock objects with verified call counts and expectations, keeping test setup clean and readable.
- **Standardized Mock Tools**: Utilize standard community tools (e.g., `nock`, `msw`, `unittest.mock`) instead of writing custom, proprietary mock engines.

## Decisions & Boundaries
- **Database Mocks**: Prefer using a lightweight in-memory database (e.g., SQLite in-memory) or database transactions that rollback after each test over mocking SQL connections or ORM calls.
- **HTTP Requests**: Mock network calls at the HTTP layer (using tools like `msw` or `nock`) rather than patching the application-level API client wrapper, ensuring client serialization logic is tested.
- **Time/Date Mocking**: Use deterministic clock wrapper utilities or standard mock timers (e.g., `sinon.useFakeTimers`, `freezegun`) when testing time-sensitive operations (e.g., token expiration, transaction limits).
