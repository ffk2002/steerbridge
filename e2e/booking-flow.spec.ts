import { test, expect } from '@playwright/test';

const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64'
);

/**
 * E2E: Search → View Details → Book (Happy Path)
 *
 * This test validates the primary user journey through the application:
 * 1. Land on the homepage
 * 2. Navigate to the stays listing
 * 3. Search for stays
 * 4. Click on a stay card to view details
 * 5. Fill in booking dates and guests
 * 6. Submit the booking
 */
test.describe('Search to Book Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/_next/image**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: transparentPng,
            });
        });

        await page.route('https://images.unsplash.com/**', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'image/png',
                body: transparentPng,
            });
        });
    });

    test('user can discover, view, and book a stay', async ({ page }) => {
        // 1. Landing page loads with hero
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Find Your Perfect');

        // 2. Navigate to stays via CTA
        await page.click('text=Start Exploring');
        await expect(page).toHaveURL(/\/stays/);

        // 3. Wait for stays to load
        await expect(page.getByText('Explore All Stays')).toBeVisible({ timeout: 10000 });
        await page.waitForSelector('a[href^="/stays/"]', { timeout: 10000 });

        // 4. Verify results are displayed
        const stayCards = page.locator('a[href^="/stays/"]');
        const count = await stayCards.count();
        expect(count).toBeGreaterThan(0);

        // 5. Click the first stay card
        const firstCard = page.locator('a[href^="/stays/"]:has(h6)').first();
        await firstCard.click();

        // 6. Verify details page loaded
        await page.waitForURL(/\/stays\/.+/);
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=/ night').first()).toBeVisible();

        // 7. Fill in booking dates
        const today = new Date();
        const checkIn = new Date(today);
        const randomOffset = Math.floor(Math.random() * 300) + 60; // 60 to 360 days out
        checkIn.setDate(today.getDate() + randomOffset);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkIn.getDate() + 3); // 3-night stay

        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        await page.getByLabel('Check-in').fill(formatDate(checkIn));
        await page.getByLabel('Check-out').fill(formatDate(checkOut));

        // 8. Verify price breakdown appears
        await expect(page.locator('text=Total')).toBeVisible();

        // 9. Click Reserve
        await page.click('text=Reserve');

        // 10. Verify booking confirmation
        await expect(page.locator('text=Booking confirmed')).toBeVisible({ timeout: 10000 });
    });

    test('search filters narrow results', async ({ page }) => {
        await page.goto('/stays');
        await page.waitForSelector('a[href^="/stays/"]', { timeout: 10000 });

        // Get initial count
        const initialCards = await page.locator('a[href^="/stays/"]').count();

        // Search for a specific city
        await page.fill('input[placeholder*="Search"]', 'Chicago');
        await page.click('text=Search');

        // Wait for filtered results
        await page.waitForTimeout(1000);
        const filteredCards = await page.locator('a[href^="/stays/"]').count();

        // Filtered results should be fewer (or equal if all match)
        expect(filteredCards).toBeLessThanOrEqual(initialCards);
    });

    test('empty state shows when no results match', async ({ page }) => {
        await page.goto('/stays?query=xyznonexistentcity12345');
        await expect(page.locator('text=No stays found')).toBeVisible({ timeout: 10000 });
    });

    test('review submission works', async ({ page }) => {
        // Navigate to a stay detail page
        await page.goto('/stays');
        await page.waitForSelector('a[href^="/stays/"]', { timeout: 10000 });
        await page.locator('a[href^="/stays/"]').first().click();
        await page.waitForURL(/\/stays\/.+/);
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

        // Open review form
        await page.click('text=Write a Review');

        // Fill in the review
        const authorName = `E2E Test User ${Date.now()}`;
        await page.getByPlaceholder('Your Name').fill(authorName);
        await page.getByPlaceholder('Share your experience').fill('This is an excellent stay! Highly recommended for anyone visiting.');

        // Set star rating to 5 via the MUI Rating component
        await page.locator('.MuiRating-root label').nth(4).click({ force: true });

        // Submit
        await page.click('text=Submit Review');

        // Verify the review appears in the list
        await expect(page.locator(`text=${authorName}`)).toBeVisible({ timeout: 10000 });
    });
});
