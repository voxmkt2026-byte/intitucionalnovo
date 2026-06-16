# E2E Test Infra: Titanium Landing Page

## Test Philosophy
- Opaque-box, requirement-driven. Tests are derived directly from the project requirements (R1 to R5) rather than the implementation details.
- Methodology: Category-Partition (Tier 1), Boundary Value Analysis (Tier 2), Pairwise Combinatorial Testing (Tier 3), and Real-World Workload/Application Scenarios (Tier 4).

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|---------------------|:------:|:------:|:------:|:------:|
| 1 | Premium Visuals (R1) | User Request / R1 | 5 | 5 | ✓ | ✓ |
| 2 | Mobile-First (R2) | User Request / R2 | 5 | 5 | ✓ | ✓ |
| 3 | AI Simulator (R3) | User Request / R3 | 5 | 5 | ✓ | ✓ |
| 4 | SEO (R4) | User Request / R4 | 5 | 5 | ✓ | ✓ |
| 5 | Copywriting (R5) | User Request / R5 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Python Pytest combined with Playwright (sync API).
- **Invocation**: Executed with a dev server wrapper to orchestrate setup and teardown.
- **Pass/Fail Semantics**: Boolean assertions verifying elements, viewport behavior, form interaction, computed results, text matches, and HTML page structure.
- **Directory Layout**:
  - `tests/conftest.py` — Configures Pytest and contains session-scoped/function-scoped Playwright browser and context fixtures.
  - `tests/test_landing_page.py` — The core E2E test suite housing all 60 tests.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Vehicle Consortium simulation | R1, R2, R3, R5 | High |
| 2 | Property Simulation & WhatsApp CTA | R1, R3, R5 | High |
| 3 | Navigation and Segment Cards | R1, R2 | Medium |
| 4 | WhatsApp FAB Mobile Interaction | R2, R5 | Medium |
| 5 | About Us Information Investigation | R1, R5 | Low |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 test cases per feature (25 tests total).
- **Tier 2 (Boundary & Edge Cases)**: ≥5 edge case scenarios per feature (25 tests total).
- **Tier 3 (Cross-Feature Combinations)**: ≥5 integration test cases covering feature interactions.
- **Tier 4 (Real-World Scenarios)**: ≥5 end-to-end user path walkthroughs.
- **Total Suite Minimum**: 60 test cases.
