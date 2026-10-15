# Security Specification

## Data Invariants
1. `cbse_pyqs`: Publicly readable by all students so they can access educational resources and past question papers. Only authenticated users with admin privileges (or verified admin email / backend) can create, update, or delete question papers.
2. `users`: Each user document `/users/{userId}` can only be written by the authenticated user whose `request.auth.uid == userId`. User profile reads for private PII are restricted to the owner.
3. Path variables and document IDs must be valid string identifiers (`isValidId`).
4. Timestamps and string lengths must conform to bounded schema limits to prevent Denial of Wallet attacks.

## The Dirty Dozen Payloads
1. Unauthenticated write to `/cbse_pyqs/new_paper` -> Rejected.
2. Injected 2MB payload into `subject` -> Rejected by length constraints.
3. Non-URL string in `paper_url` -> Rejected by URL validation.
4. User attempting to create or update another user's document `/users/{victimId}` -> Rejected by owner check.
5. Injected invalid ID with path traversal characters `../` -> Rejected by `isValidId`.
6. Non-existent field injection (shadow update) -> Rejected by schema checking.
7. Spoofed admin role injection into user profile -> Rejected.
8. Unauthenticated delete on `/cbse_pyqs/{id}` -> Rejected.
9. Malformed standard value (e.g. standard: "99") -> Rejected by enum check.
10. Unverified email writing to admin collections -> Rejected.
11. Update gap trying to tamper with immutable document IDs -> Rejected.
12. Attempt to list another user's private data -> Rejected.
