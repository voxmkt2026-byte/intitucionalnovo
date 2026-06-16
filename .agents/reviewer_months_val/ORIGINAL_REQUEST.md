## 2026-06-11T23:16:59Z
Examine the change made to `src/components/ParcelSimulator.tsx` in `handleMonthsChange`:
Before: `const sanitized = e.target.value.replace(/[^0-9]/g, "");`
After: `const sanitized = e.target.value.replace(/[^-0-9]/g, "").replace(/(?!^)-/g, "");`
Evaluate if this meets the requirements: allowing a leading minus sign, preserving the minus sign, sanitizing other non-numeric input correctly (like "12-3" to "123"), and ensuring there are no other validation or rendering bugs.
Write your review report to C:\Users\Pichau\.gemini\antigravity\scratch\titanium-landing\.agents\reviewer_months_val\handoff.md.
Notify the parent orchestrator via send_message when done.
