# Scope: Months Input Handler Validation Fix

## Architecture
- React component: `src/components/ParcelSimulator.tsx`
- Event handler: `handleMonthsChange`
- Target behavior: Allow a leading minus sign during input sanitization, so that negative values are correctly passed to validation instead of being stripped of the minus sign.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Locate & Analyze | Locate handleMonthsChange in src/components/ParcelSimulator.tsx and analyze current logic | none | PLANNED |
| 2 | Implement Fix | Modify handleMonthsChange to correctly preserve leading minus sign | M1 | PLANNED |
| 3 | Verify Typecheck & Build | Run type checks and build the project | M2 | PLANNED |
| 4 | Run Tests & Audits | Run verify_challenger_m3.py, full pytest E2E suite, and audit | M3 | PLANNED |

## Interface Contracts
- Input sanitization logic: `e.target.value.replace(/[^-0-9]/g, "").replace(/(?!^)-/g, "")`
- Error validation: Clicking calculate with negative input must show "Prazo inválido. O número de meses deve ser maior que zero."
