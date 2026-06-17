# Contributing

This repository uses a review-first workflow.

## Branches

- `main` is the stable production branch.
- `dev` is the integration branch for reviewed work.
- Feature branches should use short, readable names ending in `-ft`.

Examples:

- `authentication-ft`
- `beneficiary-management-ft`
- `reports-gen-ft`
- `donor-portal-ft`

Avoid slash-based names such as `feat/authentication`.

## Issues First

Before starting a feature:

1. Create a GitHub issue describing the work.
2. Create the feature branch from `dev`.
3. Reference the issue in commits and the pull request.
4. Open the pull request against `dev`.

## Pull Requests

All feature work must be reviewed through a pull request.

- PR target: `dev`
- PR title: clear and direct
- PR description: detailed enough for review
- Include test notes, screenshots, or API examples where useful
- Do not open feature PRs directly against `main`

## Commit Messages

Use clear, straight-forward commit messages.

Good examples:

- `Add backend scaffold for sponsorship domain`
- `Create GitHub issue and PR templates`
- `Add beneficiary lifecycle documentation`

Avoid vague messages such as:

- `updates`
- `fix stuff`
- `wip`

