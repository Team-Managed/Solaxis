# Solaxis — Code Standards

## General Principles

1. **Keep modules small and single-purpose**: Each file has one clear responsibility.
2. **Never suppress type errors**: Strict mode (`"strict": true`) is enforced. No `any`, no `@ts-ignore`, no unapproved `eslint-disable`.
3. **Validate all boundaries with Zod**: Every RPC response, parameter input, and configuration object is validated at the boundary before use.
4. **MagicBlock Modern SDK Compliance**: Exclusively use modern SDK v0.16+ APIs (`MagicIntentBundleBuilder`, `#[ephemeral]`, `#[delegate]`). Never use deprecated helper functions.

---

## Anchor & Rust Standards

- **Macro Ordering**: Always annotate the program module with `#[ephemeral]` immediately BEFORE `#[program]`:
  ```rust
  #[ephemeral]
  #[program]
  pub mod solaxis_engine {
      use super::*;
      // instructions...
  }
  ```
- **Delegation Context**: Always use the `#[delegate]` macro on the account context intended for delegation:
  ```rust
  #[delegate]
  #[derive(Accounts)]
  pub struct DelegateTask<'info> {
      pub payer: Signer<'info>,
      /// CHECK: The task PDA delegated to Delegation Program
      #[account(mut, del)]
      pub task_pda: AccountInfo<'info>,
  }
  ```
- **Modern Undelegation**:
  ```rust
  MagicIntentBundleBuilder::new(
      ctx.accounts.payer.to_account_info(),
      ctx.accounts.magic_context.to_account_info(),
      ctx.accounts.magic_program.to_account_info(),
  )
  .commit_and_undelegate(&[ctx.accounts.task_pda.to_account_info()])
  .build_and_invoke()?;
  ```
- **Error Handling**: All custom errors are enumerated in `SolaxisError` with descriptive messages.

---

## TypeScript Standards

- **Strict Typing**: No implicit any. Inferred types exported beside every Zod schema.
- **Connection Separation**: Clearly distinguish between the Base Layer connection (`new Connection("https://api.devnet.solana.com")`) and the Ephemeral Rollup connection (`new ConnectionMagicRouter("https://devnet-router.magicblock.app")`).
- **Router Discovery**:
  ```typescript
  const status = await routerConnection.getDelegationStatus(taskPda);
  const erRpcEndpoint = status.fqdn || "https://devnet-tee.magicblock.app";
  ```
- **No Swallowed Errors**: Catch blocks must either handle the error, retry with backoff, or rethrow with structured context.

---

## File Organization

```
Solaxis/
├── context/                             # Architecture, standards, and specs
│   ├── project-overview.md
│   ├── architecture-context.md
│   ├── brand-identity.md
│   ├── ui-context.md
│   ├── code-standards.md
│   ├── ai-workflow-rules.md
│   ├── progress-tracker.md
│   └── specs/
├── contracts/                       # Solana Anchor Program & solaxis-engine-sdk
│   ├── Anchor.toml
│   ├── Cargo.toml
│   └── programs/solaxis_engine/src/
├── sdk/                             # Public TypeScript Developer SDK
│   ├── package.json
│   └── src/
├── shared/                          # Protocol schemas, types, constants, PDA helpers
│   ├── package.json
│   └── src/
├── cli/                             # Standalone Terminal CLI
│   ├── package.json
│   └── src/
└── app/                             # Next.js Web Developer Console
    ├── package.json
    ├── app/
    ├── components/
    └── lib/
```
