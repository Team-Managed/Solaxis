# Solaxis — Development Workflow Rules

## Spec-Driven Approach

Build this project incrementally using a spec-driven workflow. Read `00-product-map.md` before any other spec. Each numbered spec unit defines one implementation increment — its dependencies, scope limits, and a checklist. 

Always implement against the spec. Do not infer or invent behavior that is not defined.

---

## Before Starting Any Unit

Read the following context files in order:

1. `context/project-overview.md` — product definition, goals, deliverables, and scope
2. `context/architecture-context.md` — stack, system boundaries, storage model, and MagicBlock invariants
3. `context/brand-identity.md` — visual language, theme, and color accents
4. `context/ui-context.md` — layout panels, component specifications, and telemetry styling
5. `context/code-standards.md` — Anchor macros, TypeScript, Zod, and file organization
6. `context/ai-workflow-rules.md` — this file
7. `context/progress-tracker.md` — current phase, completed units, open questions, and next steps

---

## Scoping Rules

- Work on one spec unit at a time. Each unit has a defined scope and a "Check When Done" list.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine two spec units into a single implementation step unless their dependency list explicitly permits it.
- Do not combine smart contract changes with UI changes in the same step.
- Verify each unit end to end before moving to the next.

---

## Pipeline Invariants to Enforce

Never violate these during implementation:

1. **Undelegation Callback Guarantee**: The Anchor program must always include `#[ephemeral]` so that the Delegation Program can successfully return ownership to the program on L1.
2. **Router-Resolved Placement**: Never hardcode regional ER endpoints in client code without querying `getDelegationStatus`.
3. **Zero Unhandled Errors**: Every async RPC call must handle connection failures, delegation timeouts, and network retries gracefully.
4. **Verifiable Proof**: Every execution must retain its Solana Devnet transaction signatures for verification.

---

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:
- Architecture changes ➔ `architecture-context.md`
- UI tokens or patterns ➔ `ui-context.md`
- Code standards or conventions ➔ `code-standards.md`
- Any implementation progress ➔ `progress-tracker.md`
