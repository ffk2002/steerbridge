# Submission Notes

## Time Spent

Approximate time spent:

## Implementation Plan


## Completed

- UI
  - updated components/stays-content.tsx by adding fields to denote status of check in/out dates as the user is typing it
  - added differentiator between results and currently filled in values, so that the value in the URL is representative of the search results and the value in the dropdown is only reflected when the search button is clicked
  - updated components/filter-bar.tsx 
- Hook
  - added validation for check in and check out dates before even searching
  - page shows the same dates on load as the url
  - handleSearch updated to include validation of dates and now builds the url from the date values in addition to the existing search values
- API Route
  - for searching with check in and check out dates, added return for StaySearchValidationError, when searching with invalid dates
- Schema
  - lib/schemas/date-range.ts used for validating both dates present and within proper ranges with formatting
  - updated stay.ts to include new date schema for query param
- Manager
  - added StaySearchValidationError to show specific error as api call response when date ranges are invalid
- Engine
- Data Access
- Persistence


## Intentionally Skipped

- 

## Stack Placement

Briefly explain where you made meaningful changes and why. Consider UI, client state, API contracts, validation, domain logic, persistence, and tests.

- 

## Verification

Describe how you verified the behavior, including any automated tests and manual checks.

- 

## Trade-Offs and Future Improvements

- 

## AI Tool Usage

Describe how you leveraged AI coding tools during the assessment, including what you used them for and how you reviewed or constrained their output.

- 
