---
trigger: always_on
---

# CodeGraph

This project is indexed with CodeGraph.

- Call `codegraph_explore` before manual file exploration. Make the query specific (feature, file, or symbol name).
- Treat explore results as already read.
- Before editing shared code (functions, components, hooks, API routes), check callers/impact and list affected files first.
- SQL/schema/migration files, configs, `.env`, and docs aren't indexed, so read them directly.