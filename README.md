# Grocery Deal Hunter

Grocery Deal Hunter is a web application designed to help users find the best grocery prices in their area. Instead of manually checking multiple grocery store websites and weekly circulars, users can create a grocery list and compare prices across local stores to find the best available deals.

The application is intended for people who want to save money on groceries and make more informed decisions about where and when to shop.

## Features

### Grocery List Search

Users can create a grocery list and search for prices across grocery stores near them. Location can be set using either a ZIP code or an address and can be updated at any time.

### Favorite Lists and Stores

Users with an account can save frequently used grocery lists and favorite grocery stores. This allows users to more easily keep track of products and stores they regularly shop at.

### Best Single Location

The Best Single Location mode compares the user's entire grocery list across nearby stores and recommends the store with the best overall price. The application will also display two additional stores for comparison.

### Best Weekly Deal

The Best Weekly Deal mode helps users determine where individual items are cheapest based on current weekly deals and coupons.

## MVP

By demo day, users should be able to:

* Use the application without creating an account.
* Add grocery items to a grocery list.
* Enter a ZIP code or address to search nearby stores.
* Compare grocery prices using Best Single Location mode.
* Compare weekly discounts using Best Weekly Deal mode.
* Create a user account.
* Save favorite grocery lists.
* Save favorite grocery stores.

## Future Features

Features that may be added in future versions include:

* Showing which grocery stores offer delivery.
* Adding delivery fees to estimated grocery costs.
* Allowing users to order groceries directly through Grocery Deal Hunter.
* Integrating payment processing.
* Sending users notifications when prices change on selected items.

## Prerequisites

Before running Grocery Deal Hunter locally, make sure you have the required development tools installed.

**TODO:** Add the project's required software and versions here once the team finalizes the technology stack.

Examples may include:

* Node.js
* pnpm
* PostgreSQL
* Prisma
* Git

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd <project-folder>
```

Install dependencies:

```bash
pnpm install
```

**TODO:** Add any required environment variables, database setup, and migration commands.

## Running the Application

Start the development environment:

```bash
pnpm dev
```

**TODO:** Add the local application URL and any additional startup instructions.

## Database

The project uses Prisma to define and manage the database schema.

Database migrations should always be added as new migrations instead of modifying previously committed migrations.

No AI-generated schema or migration should be merged without being manually reviewed and understood by the team.

## Contributing

All development should be completed on a separate branch rather than directly on `main`.

Branches should follow this naming structure:

```text
your-name/branch-name
```

Open a pull request when the work is ready for review. Pull requests may be opened early as drafts.

Every pull request must be reviewed by another team member before it is merged.

### Review Conventions

We use the following labels during code review:

* `q:` — A question that must be answered before merging.
* `blocker:` — A problem that must be fixed before merging.
* `praise:` — Something that was done well.

A pull request should not be approved if:

* The reviewer cannot successfully run the code.
* An existing migration was edited instead of creating a new migration.
* There are unresolved `q:` or `blocker:` comments.

Team members should respond to review requests within 24 hours when possible.

## AI Usage

Our team uses AI as a helper rather than relying on it completely.

AI may be used for repetitive tasks, explanations, debugging assistance, and other work that can improve development speed. However, all AI-generated work must be reviewed and verified before being added to the project.

For important building blocks of the application, team members are expected to understand the code and technical decisions being made.

The team will not delegate the following tasks entirely to AI:

* Database schema design
* Database migrations
* Pull request reviews

The author of a pull request is responsible for understanding every line of code they submit.

## Team

| Name          | GitHub     |
| ------------- | ---------- |
| Sabrina Chen  | sab-chen2  |
| Haider Tauqir | Haidert368 |
| Joseph Tesoro | Joe-C137   |

## Communication and Workflow

The team primarily communicates through Slack.

Team members are expected to respond within approximately 24–48 hours and notify the group as early as possible if they are unable to complete assigned work.

The team currently plans to meet outside of class on Sundays at approximately 12:00 PM.

If a team member becomes stuck, they should first ask another team member for help. If the problem cannot be resolved within the team, the team will ask the TA for assistance and then contact the instructor if additional guidance is needed.

## Project Status

Grocery Deal Hunter is currently under active development as part of the CUNY Tech Prep Fall 2026 program.

The goal is to have a working MVP ready for Week 13 demo day.
