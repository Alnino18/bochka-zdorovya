# E2E Test Infra: "Бочка Здоровья" PWA

## Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests are designed directly from user requirements (`ORIGINAL_REQUEST.md`) and public interface contracts (`PROJECT.md`), maintaining zero coupling to internal private component states.
- **Methodology**: 4-Tier Dual Track design combining Category-Partition, Boundary Value Analysis, Pairwise Combinatorial Testing, and Real-World Administrative Workload Testing.
- **Total Test Cases**: 143 test cases (exceeding minimum requirement of $11 \times 12 + \max(5, 6) = 138$). Total test suite: 172 tests across 22 test files.

## Feature Inventory & Partition Matrix
| # | Feature | Requirement Source | Tier 1 (CP) | Tier 2 (BVA) | Tier 3 (Pairwise) | Tier 4 (Workloads) |
|---|---------|-------------------|:-----------:|:------------:|:-----------------:|:------------------:|
| F1 | PWA Manifest & App Shell | R1 (Manifest, icons, standalone, theme) | 5 | 5 | ✓ | ✓ |
| F2 | Service Worker Offline Cache | R1 (SW lifecycle, Stale-While-Revalidate, offline) | 5 | 5 | ✓ | ✓ |
| F3 | Bilingual UI Switcher | R1 (Instant RU/UZ toggle, dictionary completeness) | 5 | 5 | ✓ | ✓ |
| F4 | Responsive Viewport Layout | R1 (360px mobile to 1920px desktop, touch targets) | 5 | 5 | ✓ | ✓ |
| F5 | Service Catalog & Price List | R2 (8 categories, 10 duration/price items in UZS) | 5 | 5 | ✓ | ✓ |
| F6 | Business Contacts & Actions | R2 (Phone `tel:970020404`, Instagram `@Bochka_zdorovya`) | 5 | 5 | ✓ | ✓ |
| F7 | Baseline Accounting Seeding | R3 (Nov 19 & Nov 20 golden records, idempotence) | 5 | 5 | ✓ | ✓ |
| F8 | Financial Accounting Engine | R3 (Math equations: Gross Rev, Net Balance, Salon Profit) | 5 | 5 | ✓ | ✓ |
| F9 | Local Storage Persistence | R3 (Persistence, JSON export/import, corrupt recovery) | 5 | 5 | ✓ | ✓ |
| F10 | Master Operations & Payouts | R3 (Iro, Max, Komila, sessions, 100k standard share) | 5 | 5 | ✓ | ✓ |
| F11 | Facility Expenses & Bar Sales | R3 (Cleaning 200k, itemized bar sales 440k) | 5 | 5 | ✓ | ✓ |
| F12 | Client Bookings Registry | R3 (Appointments, phone, party size, tap-to-call) | 5 | 5 | ✓ | ✓ |
| **Total** | **12 Features** | | **60** | **60** | **15** | **8** |

## Test Architecture & Layout
```
c:\Users\18aln\Downloads\БочкаЗдоровя\tests/
├── setup.ts                                # JSDOM environment, localStorage.clear, matchMedia polyfills
├── helpers/
│   ├── test-utils.tsx                      # Render helpers, viewport resizer, event dispatchers
│   └── golden-data.ts                      # Authoritative golden baseline records & price constants
├── tier1-features/                         # Tier 1: Category-Partition (60 tests)
│   ├── f01-manifest-shell.test.ts          # F1: Manifest JSON, standalone display, icons (5 tests)
│   ├── f02-service-worker.test.ts          # F2: SW cache strategy, offline fallback (5 tests)
│   ├── f03-bilingual-i18n.test.ts          # F3: RU/UZ toggle, dictionary completeness (5 tests)
│   ├── f04-responsive-layout.test.ts       # F4: Viewports 360px-1920px, bottom nav, headers (5 tests)
│   ├── f05-price-catalog.test.ts           # F5: 8 categories, 10 duration/price combinations (5 tests)
│   ├── f06-contacts-actions.test.ts        # F6: Phone dialer tel: & Instagram links (5 tests)
│   ├── f07-baseline-seeding.test.ts        # F7: Nov 19 & Nov 20 pre-populated records (5 tests)
│   ├── f08-accounting-engine.test.ts       # F8: Math engine formulas & DaySummary totals (5 tests)
│   ├── f09-storage-persistence.test.ts     # F9: LocalStorage sync, JSON backup/restore (5 tests)
│   ├── f10-master-operations.test.ts       # F10: Masters Iro/Max/Komila, client counts, payouts (5 tests)
│   ├── f11-facility-expenses-bar.test.ts   # F11: Cleaning expenses & bar sales logging (5 tests)
│   └── f12-bookings-registry.test.ts       # F12: Appointments registry, party size, notes (5 tests)
├── tier2-boundary/                         # Tier 2: Boundary Value Analysis (60 tests)
│   ├── b01-shell-boundary.test.ts          # Edge viewports (320px, 359px, 2560px), long strings (15 tests)
│   ├── b02-catalog-boundary.test.ts        # Zero price, search mismatches, malformed links (15 tests)
│   ├── b03-accounting-boundary.test.ts     # 0 clients, 0 bar, huge numbers, NaN/negative inputs (15 tests)
│   └── b04-storage-boundary.test.ts        # Corrupt JSON recovery, empty storage, quota limits (15 tests)
├── tier3-combinations/                     # Tier 3: Cross-Feature Interactions (15 tests)
│   └── pairwise-interactions.test.ts       # 15 Pairwise feature combinations
└── tier4-scenarios/                        # Tier 4: Real-World Administrative Workflows (8 tests)
    └── admin-workflows.test.ts             # 8 Comprehensive daily administrative scenarios
```

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Complete Daily Operational Cycle (Opening to Closing) | F7, F8, F10, F11, F12, F9 | High |
| 2 | High-Volume Weekend Rush Operations | F8, F10, F11, F12 | High |
| 3 | Historical Ledger Audit & Dispute Correction | F7, F8, F10, F9 | Medium |
| 4 | Bilingual Administrative Shift Handover | F3, F9, F10, F12 | Medium |
| 5 | Full Disaster Recovery & Backup Lifecycle | F7, F9, F10 | High |
| 6 | Walk-in Client to Checkout & Master Settlement | F5, F8, F10, F11, F12 | High |
| 7 | Offline Operations & Resynchronization | F1, F2, F5, F9, F11 | High |
| 8 | Multi-Day Financial Comparison & Audit | F7, F8, F10, F11 | Medium |

## Execution & Verification Commands
- Host Constraint: bare `npm` is blocked by PowerShell execution policy. Use `npm.cmd` and `npx.cmd`.
- Full Test Suite: `npm.cmd test` (runs `npx.cmd vitest run`).
- Expected Result: 172 passed tests across 22 test files, 0 failed tests, exit code 0.
