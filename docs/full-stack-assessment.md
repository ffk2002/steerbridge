# Full-Stack TypeScript Assessment: Travel Booking Extension

## Overview

You will work in a seeded travel booking application. The app already includes stay discovery, stay details, reviews, and a basic booking flow.

Your task is to extend the existing product in a focused way. Do not rebuild the application from scratch. Read enough of the codebase to understand its architecture, then make a coherent set of changes that supports the product requirement.

We are not looking for the largest implementation. We are looking for clear product thinking, sound TypeScript, good placement of logic across the stack, and a practical explanation of trade-offs.

## Product Task

Travelers should be able to search stays by trip dates.

Add support for check-in and check-out dates on the stay discovery page. When dates are provided, the discovery results should include only stays that are available for the selected range.

At minimum, your solution should address:

- A traveler can enter or select check-in and check-out dates.
- Search state survives refresh or sharing through the URL where that fits the existing app.
- Invalid date ranges are handled clearly.
- Results exclude stays that are already booked for the requested range.
- Empty states remain understandable when date filters remove all results.
- The implementation fits the existing frontend and backend boundaries.

Be prepared to explain why each meaningful change belongs where you placed it in the stack.

## Scope Guidance

This is intended to be a focused exercise, not an open-ended project. Use your judgment on scope and time investment. We care more about how you reason, prioritize, and verify the behavior than about how much surface area you touch.

Please document roughly how much time you spent, what you prioritized, and what you would do next with more time.

## Optional Depth

If your core solution is complete and you want to go deeper, choose one of the following:

- Add a targeted test around date validation or availability filtering.
- Improve the empty state so users understand that date filters may be excluding results.
- Document a concurrency risk in the booking flow and how you would address it in production.
- Refactor a small related piece if it makes the stack boundary clearer.

Do not try to do every optional item. Pick the one that best supports your implementation.

## What We Care About

We care less about visual polish and more about your engineering choices.

We will review:

- How you mapped the product requirement to technical changes.
- Where you made changes in the stack: UI, client state, API contracts, validation, domain logic, persistence, and tests.
- Whether those changes fit the existing architecture instead of bypassing it.
- Whether validation, business rules, and data access live in appropriate layers.
- Whether UI state, URL state, and API state are understandable.
- Whether your tests or manual verification cover meaningful behavior at the right level.
- How clearly you explain trade-offs, assumptions, and future improvements.

## Suggested Workflow

You may approach the exercise however you like. A strong submission usually includes:

- A short implementation plan before coding.
- A narrow vertical slice through the app.
- A working implementation of the most important behavior.
- A small amount of meaningful validation or testing.
- A short note explaining trade-offs and what you would improve next.

Playwright end-to-end tests are optional for this assessment. Use the test level that best matches the behavior you changed.

## Submission

Please submit:

- A link to a pull request containing your submission.
- Your repository should be a clone or fork of the seeded assessment repo.
- Make your changes on a dedicated branch named `submission/<your-name>`, then open a pull request from that branch against `main`.
- A `docs/SUBMISSION.md` file that includes:
  - Roughly how much time you spent.
  - Your implementation plan.
  - What you completed.
  - What you intentionally skipped.
  - Where you made changes in the stack and why.
  - How you verified the behavior.
  - Trade-offs and future improvements.
  - How you leveraged AI coding tools during the assessment.

## AI Tool Usage

AI coding tools are encouraged. We are interested in how you use them as part of your engineering process, not whether you avoided them.

Please briefly describe:

- What tools you used and what you used them for.
- How you reviewed or constrained their output.
- Any parts of the implementation where you relied on your own judgment after using AI assistance.
