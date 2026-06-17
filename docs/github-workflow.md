# GitHub Workflow

## Branch Model

```text
main
  stable production branch

dev
  integration branch for reviewed work

authentication-ft
reports-gen-ft
beneficiary-management-ft
  feature branches created from dev
```

## Required Flow

1. Create a GitHub issue.
2. Create a feature branch from `dev`.
3. Commit with a clear message.
4. Open a pull request against `dev`.
5. Review and merge into `dev`.
6. Promote `dev` to `main` only through a reviewed release PR.

## GitHub CLI Examples

Create an issue:

```bash
gh issue create --title "Set up authentication" --label feature,backend --body "Implement Sanctum authentication, roles, permissions, and policy checks."
```

Create a feature branch:

```bash
git checkout dev
git pull origin dev
git checkout -b authentication-ft
```

Create a PR against `dev`:

```bash
gh pr create --base dev --head authentication-ft --title "Add authentication foundation" --body "Adds Sanctum authentication foundation and role-aware access controls."
```

