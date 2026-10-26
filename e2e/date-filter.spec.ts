import { test, expect, Page } from '@playwright/test';

const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64'
);

// YYYY-MM-DD for today + n days, in UTC to match the API's "today"
const day = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

// Wide enough that seeded bookings (1–30 days out) remove some stays
const CHECK_IN = day(2);
const CHECK_OUT = day(25);

// Values typed before React finishes hydrating are reset, and there is no reliable
// "hydrated" signal in the DOM, so retry until the controlled input keeps the value
async function fillDate(page: Page, label: 'Check-in' | 'Check-out', value: string) {
    const input = page.getByLabel(label);
    await expect(async () => {
        await input.fill(value);
        await expect(input).toHaveValue(value, { timeout: 500 });
    }).toPass({ timeout: 10000 });
}

async function gotoStays(page: Page, query = '') {
    await page.goto(`/stays${query ? `?${query}` : ''}`);
    await expect(page.getByLabel('Check-in')).toBeVisible({ timeout: 10000 });
}

const resultsHeader = (page: Page) => page.getByText(/\d+ (results?|stays? available)/);
const searchButton = (page: Page) => page.getByRole('button', { name: 'Search', exact: true });

/**
 * E2E: Search stays by trip dates
 *
 * Covers the date filter on the discovery page: client-side validation,
 * URL state (refresh, sort, back/forward), server-side validation of
 * hand-edited URLs, and the date-aware empty state.
 */
test.describe('Date Range Filter', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/_next/image**', async route => {
            await route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng });
        });

        await page.route('https://images.unsplash.com/**', async route => {
            await route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng });
        });
    });

    test('invalid range shows an inline error and does not search', async ({ page }) => {
        await gotoStays(page);

        await fillDate(page, 'Check-in', day(10));
        await fillDate(page, 'Check-out', day(5));
        await searchButton(page).click();

        await expect(page.locator('#date-error')).toHaveText('Check-out date must be after check-in date');
        expect(page.url()).not.toContain('checkIn');

        // Editing a date clears the error
        await fillDate(page, 'Check-out', day(12));
        await expect(page.locator('#date-error')).toHaveCount(0);
    });

    test('one date on its own is rejected', async ({ page }) => {
        await gotoStays(page);

        await fillDate(page, 'Check-in', day(10));
        await searchButton(page).click();

        await expect(page.locator('#date-error')).toHaveText('Select both check-in and check-out dates');
        expect(page.url()).not.toContain('checkIn');
    });

    test('valid range filters results and survives refresh, sort and back', async ({ page, request }) => {
        const api = await request.get(`/api/stays?checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}`);
        const availableCount = (await api.json()).stays.length;

        await gotoStays(page);
        await fillDate(page, 'Check-in', CHECK_IN);
        await fillDate(page, 'Check-out', CHECK_OUT);
        await searchButton(page).click();

        await expect(page).toHaveURL(new RegExp(`checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}`));
        await expect(resultsHeader(page)).toHaveText(new RegExp(`^${availableCount} stays? available · `));

        // Refresh keeps the filter and the inputs
        await page.reload();
        await expect(resultsHeader(page)).toHaveText(new RegExp(`^${availableCount} stays? available`));
        await expect(page.getByLabel('Check-in')).toHaveValue(CHECK_IN);

        // Changing sort keeps the dates
        await page.getByRole('combobox', { name: 'Sort By' }).first().click();
        await page.getByRole('option', { name: 'Price: Low to High' }).click();
        await expect(page).toHaveURL(/sort=price_asc/);
        expect(page.url()).toContain(`checkIn=${CHECK_IN}`);

        // Clearing dates restores the unfiltered list; back brings the dates back into the inputs
        await page.getByRole('button', { name: 'Clear dates' }).click();
        await expect(page).not.toHaveURL(/checkIn/);
        await expect(page.getByLabel('Check-in')).toHaveValue('');
        await expect(resultsHeader(page)).toHaveText(/results?$/);

        await page.goBack();
        await expect(page).toHaveURL(/checkIn=/);
        await expect(page.getByLabel('Check-in')).toHaveValue(CHECK_IN);
    });

    test('hand-edited invalid URL shows the server message with a way out', async ({ page }) => {
        await gotoStays(page, 'checkIn=2020-01-01&checkOut=2020-01-05');

        await expect(page.getByText('Check-in date cannot be in the past')).toBeVisible({ timeout: 10000 });

        await page.getByRole('button', { name: 'Clear dates' }).last().click();
        await expect(page).not.toHaveURL(/checkIn/);
        await expect(resultsHeader(page)).toHaveText(/results?$/);
    });

    test('empty state explains that dates removed the results', async ({ page, request }) => {
        // Find a stay with an upcoming booking and search for exactly that stay and those dates
        const { stays } = await (await request.get('/api/stays')).json();
        let target: { title: string; checkIn: string; checkOut: string } | undefined;
        for (const stay of stays) {
            const { stay: details } = await (await request.get(`/api/stays/${stay.id}`)).json();
            const booking = details.bookedDates.find((b: { checkIn: string }) => b.checkIn.slice(0, 10) >= day(0));
            if (booking) {
                target = { title: details.title, checkIn: booking.checkIn.slice(0, 10), checkOut: booking.checkOut.slice(0, 10) };
                break;
            }
        }
        test.skip(!target, 'Seed data has no upcoming bookings');

        await gotoStays(page, `query=${encodeURIComponent(target!.title)}&checkIn=${target!.checkIn}&checkOut=${target!.checkOut}`);

        await expect(page.getByText(/^No stays available for /)).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('button', { name: 'Clear dates' }).last()).toBeVisible();
    });

    test('date inputs fit on a phone screen', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await gotoStays(page, `checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}`);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBe(0);
    });
});
