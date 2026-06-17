# Branch Protection

## Goal

Production merges should require automated checks and pull request review.

## Required Branch Rules

### `main`

Protect `main` with:

- Require a pull request before merging.
- Require at least one approval.
- Dismiss stale approvals when new commits are pushed.
- Require conversation resolution.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Restrict force pushes.
- Restrict branch deletion.

Required checks:

- `backend-tests`
- `codeql-php`

### `dev`

Protect `dev` with:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Require conversation resolution.

Required checks:

- `backend-tests`
- `codeql-php`

## Automated Workflows

Backend CI runs on pull requests and pushes to `dev` and `main`.

It checks:

- Composer configuration
- Dependency installation
- Laravel Pint formatting in check mode for changed backend PHP files
- Backend test suite

CodeQL runs on pull requests, pushes, and a weekly schedule.

It checks:

- PHP security issues
- PHP quality issues

## Merge Standard

No feature branch should merge into `dev` or `main` when required checks are failing.

`main` should receive changes through release pull requests only.
