# Vision

Pi Grok Build lets Pi use Grok Build's native coding-agent strengths through a small, trustworthy Pi package surface.

The product should feel obvious to a Pi caller:

```text
doctor today
preflight today

future:
start → status → result
cancel/cleanup when needed
```

Design commitments:

- one Pi-native model-facing tool: `grok_build`
- one source-inspectable package: `pi-grok-build`
- honest bootstrap behavior with safe doctor and preflight paths
- curated lifecycle actions instead of raw launch plumbing
- explicit consent and operator-owned policy before provider/subscription use
- bounded previews and retained artifacts for full output
- source/package/Pi-loader/live-proof separation

Power belongs behind elegant surfaces. Pi agents should delegate useful work to Grok Build only after the package can prove what it launches, what it owns, what it returns, what it can clean up, and what remains the parent agent's responsibility.
