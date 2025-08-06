# Contributor's Guide

Thank you for taking the time to contribute!

Any contributions to this project are welcome and encouraged, regardless of programming expertise.
If you're not sure where to start or how contributing works, you can refer to [these articles](https://contributing.md/) which may give you some useful pointers and insights.

## For Users

Before you jump the gun, we ask that you first and foremost check the following feeds to see if your issue has already been addressed or resolved:

- [**Issues**](https://github.com/bsmg/beatmapper/issues): bug reports, feature requests
- [**Discussions**](https://github.com/bsmg/beatmapper/discussions): feedback, support, etc.

If you issue has already been listed, you're welcome to add a comment if you have any additional context to contribute!

When creating a new issue, please use the corresponding templates to better organize the context surrounding your issue and make it as easy as possible for maintainers to address your issue in a timely manner.

## For Developers

This project is bootstrapped with a modified [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) template.

### Prerequisites

- [Node.js](https://nodejs.dev/en/learn/) (LTS is recommended)
- [Visual Studio Code](https://code.visualstudio.com/docs/sourcecontrol/overview#_branches-and-tags)

### Project Setup

The documentation site has a [very detailed guide](https://beatmapper.app/docs/running-locally) on how to build the web application on your local machine.

Once you have a local copy of the project on your machine, we'd recommend taking these additional steps before you start making any code modifications:

1. [Create a new fork](https://guides.github.com/activities/forking/) of the repository, so that all of your modifications can be tracked on *your* copy of the repository.
2. [Create a new dedicated branch](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-and-deleting-branches-within-your-repository#creating-a-branch) for your changes
  and sync it to your workspace.
3. Read through the guides and resources within the [Knowledge Base](#knowledge-base) located at the bottom of this guide, 
  so that you can familiarize yourself with the technologies used in this project.

#### Git Hooks

Pre-commit hooks are configured via [lefthook](https://github.com/evilmartians/lefthook) to run linters/formatters automatically before making commits to the repository.

**These hooks are not enabled by default**, but you can run `yarn lefthook install` to enable them for your workspace.

### Submitting a Pull Request

If you think you're ready to make a pull request, be sure to run through the following checklist to ensure your code is production-ready:

- [ ] If you did not activate the available git hooks for your workspace, run the following command to manually run the linter/formatter on your changes: `yarn check --write {files}`.
- [ ] Run `yarn test run` to ensure all unit tests are passing.
- [ ] Make a production build for your application (`yarn build && yarn preview`) and ensure your changes are stable and no critical errors are present.
- [ ] Review your changes, and run `yarn version <major|minor|patch> --deferred` to add a changeset. This will make it easier for maintainers to integrate your changes properly for a future release.
  - Use `patch` if your changes are strictly stability or performance improvements.
  - Use `minor` if new features are added and/or non-breaking changes are introduced.
  - Use `major` for *any and all* breaking changes (i.e. localstorage, redux state, etc).

Once submitted, a maintainer will review your pull request and, once approved, integrate your changes into a staging branch for future release.

## Knowledge Base

These are some of the more useful guides and documentation for the core technologies used in the project:

- [Ark UI](https://ark-ui.com/docs/overview/introduction)
- [Biome](https://biomejs.dev/guides/getting-started/)
- [Drei](https://drei.docs.pmnd.rs/getting-started/introduction)
- [Lefthook](https://lefthook.dev)
- [Lucide](https://lucide.dev/guide/packages/lucide-react)
- [MDX](https://mdxjs.com)
- [Panda CSS](https://panda-css.com/docs/overview/getting-started)
- [React](https://react.dev/learn)
- [React Spring](https://www.react-spring.dev)
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [React Postprocessing](https://react-postprocessing.docs.pmnd.rs/introduction)
- [Redux](https://redux.js.org/introduction/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started)
- [TanStack Form](https://tanstack.com/form/latest/docs/framework/react/overview)
- [TanStack Pacer](https://tanstack.com/pacer/latest/docs/framework/react/overview)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Table](https://tanstack.com/table/latest/docs/framework/react/overview)
- [three.js](https://threejs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [unstorage](https://unstorage.unjs.io)
- [Valibot](https://valibot.dev/guides/introduction)
- [Velite](https://velite.js.org/guide/quick-start)
- [Vite](https://vite.dev/guide)
- [Vite PWA](https://vite-pwa-org.netlify.app)
- [Vitest](https://vitest.dev/guide)

- [BeatSaber-JSMap](https://github.com/KivalEvan/BeatSaber-JSMap)