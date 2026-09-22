---
"beatmapper": minor
---

## Technical Changes

Added new capabilities to the testing framework for running integration tests via Vitest's [Browser Mode](https://vitest.dev/guide/browser) and [Playwright](https://playwright.dev/docs/api/class-playwright).
- The install step for Playwright is now bundled directly into the workspace's setup task for both local installs and CI workflows. Any browsers that are not supported on the runner's operating system will be automatically skipped when running integration tests.
- Some helper methods were added to allow you to compose new render functions for testing environments, which provides a nicer syntax when working with providers and exposing their contexts.
