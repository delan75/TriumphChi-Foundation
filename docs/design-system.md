# Design System Direction

## Product Character

TriumphChi is an operational NGO platform, so the UI should feel calm, trustworthy, dense enough for repeated work, and careful around private child information.

Avoid marketing-heavy composition inside the authenticated app. The staff surfaces should prioritize scanning, filtering, review queues, and clear lifecycle state.

## Visual System

- Style: restrained operational dashboard
- Radius: `6px` to `8px`
- Primary color: foundation green
- Supporting colors: blue for informational states, amber for review/warning states, red for destructive states
- Typography: system sans-serif first, with clear 16px body text
- Icons: Lucide only for structural UI
- Layout: mobile-first with a sticky top header, compact navigation, and responsive data surfaces

## UX Rules

- Public routes must not expose private beneficiary data.
- Beneficiary screens should label private data zones clearly.
- Touch targets should be at least `44px` tall.
- Forms must use visible labels, not placeholder-only labels.
- Tables must remain readable on mobile through responsive overflow or alternate card layouts.
- Status changes must have explicit feedback and audit notes.
- Destructive actions must require confirmation.
- Reports and exports must honor role-based access.

## Core App Areas

- Public site
- Staff operations
- Donor portal
- School portal
- Field officer workflows
- Administrator settings

