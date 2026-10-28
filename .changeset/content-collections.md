---
"beatmapper": minor
---

## Technical Changes

- Migrated from Velite to [Content Collections](https://www.content-collections.dev) and a [Sätteri](https://satteri.bruits.org)-based processing pipeline. This new pipeline offers faster compilation of MDX content via a Rust-based parser and more flexibility for plugins that extend the syntax.
	- Sharp is no longer bundled as a transitive dependency, since the package recently introduced a broken shim that can break the install step on certain environments. It also wasn't really that useful for our original content processing workflow.
	- All collections now use Valibot for schema validation as opposed to Zod, as Content Collections is fully Standard Schema compliant and allows us to align all schemas with one validation library as opposed to two.
	- All custom syntax tree mutations and transformations were ported to local MDAST/HAST plugins, so we can own the supply chain for functionality and align generated data structures (like table of contents) more closely with the frontend.
