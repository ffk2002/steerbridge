# Submission Notes

## Time Spent

Approximate time spent: ~3.5 hours

## Implementation Plan
- Data access layer already contains query to select stays based on dates. 

1. Start with changes to date validation to only accept real calendar dates and date limits
   - date schema: DateOnlySchema: used for calendar date validation
   - refineDateRange: a function to ensure both dates are inputted, in correct order, and valid dates (not in past)
   - call new validation and test with invalid dates (02-30-2026, check in after check out)
3. Update the stay-manager to throw the StaySearchValidationError with invalid dates
   - refineDateRange returns specific error with dates, now propogated through stay-manager
4. Update stays route to bubble up an invalid date error from the manager
5. Currently refreshing with query params will return a default query of stays with reset query params. Update the initial data to query the URL params on page render
   - updating the page.tsx getInitialStays function to call handleSearchStays with a set of query params will allow it to narrow down the initial set of stays returned on a page load
6. Update the components for filter bar and stays content to include date specific control
   - filter bar
     - include the check in and check out calendar dropdowns to include in the filter bar
   - stays content
     - include the date range when returning the count of all stays returned
     - add an error page for the case where there are no stays found for the selected dates
     - add url validation, so that same date validation added to query from front-end are also applied to manually edited url 
## Completed

- A traveler can enter or select check-in and check-out dates.
- Search state survives refresh or sharing through the URL where that fits the existing app.
- Invalid date ranges are handled clearly.
- Results exclude stays that are already booked for the requested range.
- Empty states remain understandable when date filters remove all results.
- The implementation fits the existing frontend and backend boundaries.

## Intentionally Skipped

- concurrency risk in booking flow: 
  - race condition can occur over course of minutes, as verification for possible suspicious activity marked by the bank
    can require MFA before authorizing a payment. as a result, hold a reservation for about 10 minutes, and if the 
    payment is not confirmed, remove the reservation from the user's possession for others to view

  - payments authed at same time: solution can be to store bookings in a sql database with PK set to both listing and 
    dates. this way, there can only be one entry for a booking for a single night. for atomic operations including 
    multiple nights, entering one row per night that overlaps with another for a booking will result in a failed SQL
    write, which can be propogated up to the user from the database level
## Stack Placement

Briefly explain where you made meaningful changes and why. Consider UI, client state, API contracts, validation, domain logic, persistence, and tests.

- UI (components/filter-bar.tsx, components/stays-content.tsx): added check-in/check-out inputs, a Clear dates button, an inline date error, a date-aware results header ("N stays available · Nov 1 – Nov 5"), a date-specific empty state, and a message for invalid URLs. These components only display values and report input; all the logic lives in the hook. Layout changes were needed so the extra inputs fit at every screen width.
- Client state (lib/hooks/use-stays-search.ts): the hook holds the date inputs and their errors. It checks dates before writing them to the URL, keeps the dates when the search or sort changes, provides clearDates, turns the API's 400 into a readable message without retrying, and re-syncs the inputs on back/forward. The URL is the source of truth, so refreshing or sharing a link keeps the search. This belongs in the hook because ARCHITECTURE.md assigns client state, URL state and API calls to this layer.
- Server render (app/stays/page.tsx): the first render now uses the URL's search parameters instead of always searching with none. This fixed an existing behavior where a refresh showed unfiltered results.
- API contract (app/api/stays/route.ts, README.md, ARCHITECTURE.md): checkIn/checkOut are now YYYY-MM-DD, both or neither. Invalid input returns 400 { error, details.fieldErrors }, the same shape POST /api/bookings uses. The route stays thin: it converts the manager's error into HTTP.
- Validation (lib/schemas/date-range.ts, lib/schemas/stay.ts): one shared Zod schema enforces a real calendar date, both dates or neither, no past check-in (UTC) and check-out after check-in. The browser and server use the same schema, so their rules can't drift apart. Malformed dates aren't also reported as "in the past".
- Domain logic and manager (lib/managers/stay-manager.ts): added StaySearchValidationError, which carries the field errors. It separates bad input from server failure without the manager knowing about HTTP, so the API route and the server render can each handle it their own way. There's no new engine code: the overlap rule already existed, and duplicating it in the engine would only have restated what the database query enforces.
- Persistence (lib/data/bookings.ts, Prisma schema): added a query to select bookings based directly on status and booked dates. Looks through the bookings table and filters out CONFIRMED bookings between the selected date range. Then there is a change in the stay 

## Verification

Describe how you verified the behavior, including any automated tests and manual checks.

  - Schema tests: formats, impossible dates and every range rule, including which field each error is reported on.
  - Manager tests (data layer mocked): dates become a UTC-midnight lookup and an exclusion filter, and invalid input never reaches the database.
  - API route tests: the 400 response and its field errors.
  - Overlap tests: one added for a request inside an existing booking.
  - Playwright: the browser flows, including refresh, sort, back/forward, a bad URL, the empty state and phone layout.
  - Checking the tests catch bugs: I broke the code on purpose in two places, and the tests failed both times.

## Trade-Offs and Future Improvements

- trade-off: add specific times for each check in and check out, so that morning checkout does not interfere with evening check in after cleaning
- improvement: currently, the query to check available stays first checks for stays currently booked for a set date range, then queries stays again to find all unbooked stays
  - IMPLEMENTED*
 
- trade off: in order to add the new query to find available stays, I had to update the stay manager, causing it to include some data layer knowledge - it includes the overlappingBookingsWhere which returns a Prisma object in the manager layer. 
- improvement: create a helper function in the data layer that handles the prisma querying and data access, and returns a simple object the manager
  can then use to retain its domain logic

## AI Tool Usage

Describe how you leveraged AI coding tools during the assessment, including what you used them for and how you reviewed or constrained their output.
- Used claude to feed the repo's architecture doc, then suggest recommended edits to the specific areas in the stack where the edits should go. Then created plan for the best order of implementation. I prompted it to look for a solution that contains the smallest number of changes, while also adhering to the current design of the app.
- After development was done, for each layer of the app, I prompted it to identify simplifications to the changes made. One of the simplifications was updating the query to find available bookings, moving it from 2 steps to 1, directly filtering out stays that are CONFIRMED booked within the selected dates.


