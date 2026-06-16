# Adversarial Challenge Report

## Challenge Summary

**Overall risk assessment**: LOW

The overall implementation is solid. The math model calculation logic is correct, and styling choices avoid visual leaks. The simulator cleans input characters correctly and displays a clean error boundary when inputs do not meet requirements.

## Challenges

### [Low] Challenge 1: Lack of Input Upper Bounds in Free-Text Inputs

- **Assumption challenged**: The user will only enter values within reasonable bounds matching the slider limits.
- **Attack scenario**: A user bypasses the slider limits by typing a massive number in the free-text input (e.g., `9999999999999999` credit or `9999` months).
- **Blast radius**: The system calculates the monthly installment with the largest interest rate bracket and displays a huge formatted currency. This can cause text wrapping issues or visual overflow in the result card.
- **Mitigation**: Add a validation warning or clamp input values to the maximum bounds during validation (e.g., `2.000.000 BRL` for property credit, or `240` months).

## Stress Test Results

- **Negative Months Input (`-10`)** → expected validation warning → warning displayed correctly: "Prazo inválido. O número de meses deve ser maior que zero." → **PASS**
- **Non-Numeric Credit Input (`abc`)** → expected input value to be empty (filtered) → value was filtered out and remained empty → **PASS**
- **Viewport scaling down to 320px width** → expected no horizontal scrollbars/overflow → scrollWidth matched window width perfectly with no overflow → **PASS**
- **Viewport resizing on load and scroll** → expected no JS errors or crashes → no runtime console exceptions captured during viewport shifts and scrolls → **PASS**

## Unchallenged Areas

- **Backend security / database injections** — reason not challenged: Out of scope. The landing page is a client-side static application with no database integrations or backend API requests.
