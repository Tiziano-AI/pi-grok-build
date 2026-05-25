# Vision

Pi Grok Build lets Pi use Grok Build's native coding-agent strengths without weakening Pi's authority, evidence discipline, or package-source trust boundary.

The product should feel obvious to a Pi caller:

```text
doctor today

future:
start → status → result
cancel/cleanup when needed
```

Design commitments:

- one Pi-native model-facing tool: `grok_build`
- one source-inspectable package: `pi-grok-build`
- current bootstrap behavior that is honest about not launching Grok Build
- curated lifecycle actions instead of public raw Grok Build launch plumbing
- explicit consent and operator-owned policy before any provider/subscription use
- bounded previews and retained artifacts for full output
- source/package/Pi-loader/live-proof separation
- no CDX/Codex dependency
- no MCP bridge as the Pi integration surface
- no source-uninspectable runtime dependencies

Power belongs behind elegant surfaces. Pi agents should delegate useful work to Grok Build only after the package can prove what it launches, what it owns, what it returns, what it can delete, and what remains the parent agent's responsibility.
