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

This project is bootstrapped with a modified [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [Typescript](https://www.typescriptlang.org/) template.

### Prerequisites

- [Node.js](https://nodejs.dev/en/learn/) (LTS is recommended)
- [Visual Studio Code](https://code.visualstudio.com/docs/sourcecontrol/overview#_branches-and-tags)

### Project Setup

1. Install [Node.js](https://nodejs.dev/en/learn/how-to-install-nodejs/) and [Visual Studio Code](https://code.visualstudio.com/Download) if you haven't already.
2. [Create a new fork](https://guides.github.com/activities/forking/) of the repository and [clone it](https://code.visualstudio.com/docs/sourcecontrol/overview#_cloning-a-repository) to your local machine.
3. [Create a new dedicated branch](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-and-deleting-branches-within-your-repository#creating-a-branch) and sync it to your workspace.
4. If you're using Visual Studio Code, install the recommended workspace extensions (the editor should prompt you to do so). This will enable useful integrations for your workspace.
5. Open a new terminal in your cloned directory and run `yarn install`. This will install all necessary dependencies to bundle the application.
6. Make your changes! You can run `yarn dev` to start a local development environment or `yarn build` + `yarn preview` for a production environment.
7. Once the server is running, you can open the `localhost` link that appears in console to access the app on your local machine.

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

These are some useful guides and documentation for the core technologies used in the project:

- [Ark UI](https://ark-ui.com/docs/overview/introduction)
- [Drei](https://drei.docs.pmnd.rs/getting-started/introduction)
- [Panda CSS](https://panda-css.com/docs/overview/getting-started)
- [React](https://react.dev/learn)
- [React Spring](https://www.react-spring.dev)
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [React Postprocessing](https://react-postprocessing.docs.pmnd.rs/introduction)
- [Redux](https://redux.js.org/introduction/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started)
- [TanStack Form](https://tanstack.com/form/latest/docs/framework/react/overview)
- [TanStack Pacer](https://tanstack.com/pacer/latest/docs/framework/react/overview)
- [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [TanStack Table](https://tanstack.com/table/latest/docs/framework/react/overview)
- [three.js](https://threejs.org)
- [Valibot](https://valibot.dev/guides/introduction)
- [Velite](https://velite.js.org/guide/quick-start)
- [Vite](https://vite.dev/guide)
- [Vitest](https://vitest.dev/guide)

- [BeatSaber-JSMap](https://github.com/KivalEvan/BeatSaber-JSMap)