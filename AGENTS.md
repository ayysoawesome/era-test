# Repository Guidelines

## Project Structure & Module Organization

This is a Vite React 19 frontend using TypeScript, Tailwind CSS 4, Radix UI, and shadcn-style UI components. Source code lives in `src/`.

- `src/main.tsx` bootstraps the app; `src/app/` contains providers, routing, and global styles.
- `src/pages/` contains route-level pages.
- `src/widgets/`, `src/features/`, and `src/entities/` follow a feature-sliced structure for larger UI and domain modules.
- `src/shared/` holds reusable API helpers, hooks, routing utilities, and base UI components.
- `src/components/` contains page-specific or legacy shared components.
- Static assets belong in `public/`.

Use the `@/*` alias for imports from `src`, for example `@/shared/ui/button`.

## Build, Test, and Development Commands

Use Yarn 4 via `yarn.cmd` in Windows PowerShell to avoid script execution policy issues.

- `yarn.cmd dev` starts the Vite dev server. The configured default is host `::` and port `8080`.
- `yarn.cmd build` creates a production build in `dist/`.
- `yarn.cmd build:dev` builds with Vite development mode.
- `yarn.cmd preview` serves the built output locally.
- `yarn.cmd lint` runs ESLint across the repository.

The repository uses `nodeLinker: node-modules` in `.yarnrc.yml`; keep `yarn.lock` committed with dependency changes.

## Coding Style & Naming Conventions

Write TypeScript and React components in `.ts` and `.tsx` files. Use PascalCase for components and page files, such as `PricingPage.tsx`, and camelCase for hooks, helpers, variables, and functions.

Prefer composition with existing Radix/shadcn primitives from `src/shared/ui` before adding new UI abstractions. Keep module public exports in local `index.ts` files where that pattern already exists.

Follow the existing style: two-space indentation, double quotes, semicolons, strict TypeScript, and functional React components.

## Testing Guidelines

No test runner or `test` script is currently configured. For now, validate changes with `yarn.cmd lint` and `yarn.cmd build`. If adding tests, add the test script to `package.json`, place tests near the module they cover, and use clear names such as `Button.test.tsx` or `generation-api.test.ts`.

## Commit & Pull Request Guidelines

This directory does not include Git history, so no repository-specific commit convention is available. Use concise imperative commit messages, for example `Add pricing page filters`.

Pull requests should include a short summary, validation steps run, linked issues when applicable, and screenshots or screen recordings for visible UI changes.
