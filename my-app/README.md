# Grocery Deal Hunter

A grocery deal hunter built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## First-time setup

You do not need to download Next.js separately or install it globally. This repository already contains the app; installing its dependencies will install Next.js, React, TypeScript, and the other required packages locally.

### 1. Install the tools

- Install the **LTS version of [Node.js](https://nodejs.org/)**. It includes npm, the package manager used here. Next.js requires Node.js 20.9 or newer; see the [official requirements](https://nextjs.org/docs/app/getting-started/installation).
- Install [Git](https://git-scm.com/downloads) to clone the repository and collaborate.
- Use a code editor such as [Visual Studio Code](https://code.visualstudio.com/).

After installing, reopen your terminal or VS Code and check:

```bash
node --version
npm --version
git --version
```

Each command should print a version number.

### 2. Download the project

In a terminal, run:

```bash
git clone --branch develop https://github.com/sab-chen2/grocery-deal-hunter.git
cd grocery-deal-hunter/my-app
```

If you already downloaded or cloned the repository, open it and navigate to its `my-app` folder instead. All npm commands below must run inside `my-app`, where `package.json` is located.

### 3. Install the dependencies

```bash
npm ci
```

This installs the versions recorded in `package-lock.json` into `node_modules`. An internet connection is required. Do this when setting up the project and again after pulling changes to the dependency files.

Do not run `create-next-app`: that creates a new project, and this project already exists.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. If that port is busy, use the local URL printed in the terminal.

Keep the terminal running while working. Saved code changes appear in the browser automatically. Press **Ctrl+C** in the terminal to stop the server.

## Working on the project

The next time you work on the app, open a terminal in `my-app` and run `npm run dev`.

```text
my-app/
|-- app/
|   |-- page.tsx                # Homepage: /
|   |-- layout.tsx              # Shared layout for pages
|   |-- globals.css             # Global styles
|   `-- shoppinglist/
|       `-- page.tsx            # Shopping list route: /shoppinglist
|-- public/                    # Static files, such as images
|-- package.json               # Dependencies and commands
|-- package-lock.json          # Locked dependency versions
`-- tsconfig.json              # TypeScript configuration
```

- Write React pages and components in `.tsx` files; use `.ts` for TypeScript code without JSX.
- `app/page.tsx` is the main page. Other `page.tsx` files define separate routes; they do not automatically appear on the homepage.
- `node_modules/` and `.next/` are generated locally and ignored by Git.
- When intentionally adding a dependency, use `npm install package-name` and commit both `package.json` and `package-lock.json`.

## Available commands

Run these from `my-app`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Check code with ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build after `npm run build` |

## Troubleshooting

- **`node` or `npm` is not recognized:** Install Node.js, then reopen your terminal or VS Code.
- **PowerShell says `npm.ps1` cannot run:** Use `npm.cmd ci` and `npm.cmd run dev`, or switch the VS Code terminal to Command Prompt. The same `npm.cmd` substitution works for the other npm commands.
- **Cannot find `package.json`:** Check that your terminal is inside `grocery-deal-hunter/my-app`.
- **`next` is not recognized or dependencies are missing:** Run `npm ci` inside `my-app`, then retry `npm run dev`.
- **`npm ci` reports a lockfile mismatch:** Ask the teammate who changed dependencies to update and commit `package-lock.json` alongside `package.json`.
- **Font download fails:** The app uses `next/font/google` for Geist fonts. Check your internet connection and access to Google Fonts, then retry.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React documentation](https://react.dev/learn)
