import { test, expect, Page } from '@playwright/test';

let page: Page;

test.describe('Banking Application Test Suite', () => {
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    page.on('dialog', dialog => dialog.accept());
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.beforeEach(async () => {
    await page.goto('https://www.globalsqa.com/angularJs-protractor/BankingProject/#/login');
  });

  test('End-to-end banking scenario', async () => {
    const firstName = 'John';
    const lastName = 'Doe';
    const postCode = '12345';
    const depositAmount = 1000;
    const withdrawPercentage = 0.2;

    // Manager actions
    await loginAsManager();
    await createCustomer(firstName, lastName, postCode);
    await openAccount(firstName, lastName);
    await logout();

    // Customer actions
    await loginAsCustomer(firstName, lastName);
    await makeDeposit(depositAmount);
    await makeWithdrawal(depositAmount * withdrawPercentage);
    await verifyBalance(depositAmount * (1 - withdrawPercentage));
    await logout();

    // Cleanup
    await loginAsManager();
    await deleteCustomer(firstName, lastName);
  });
});

async function loginAsManager() {
  await page.click('button:has-text("Bank Manager Login")');
  await page.waitForSelector('.btn', { state: 'visible' });
}

async function createCustomer(firstName: string, lastName: string, postCode: string) {
  await page.click('button:has-text("Add Customer")');
  await page.fill('input[ng-model="fName"]', firstName);
  await page.fill('input[ng-model="lName"]', lastName);
  await page.fill('input[ng-model="postCd"]', postCode);
  await page.click('button.btn-default[type="submit"]');
}

async function openAccount(firstName: string, lastName: string) {
  await page.click('button:has-text("Open Account")');
  await page.selectOption('select#userSelect', { label: `${firstName} ${lastName}` });
  await page.selectOption('select#currency', 'Dollar');
  await page.click('button[type="submit"]');
}

async function logout() {
  await page.click('button:has-text("Home")');
}

async function loginAsCustomer(firstName: string, lastName: string) {
  await page.click('button:has-text("Customer Login")');
  await page.selectOption('select#userSelect', { label: `${firstName} ${lastName}` });
  await page.click('button:has-text("Login")');
}

async function makeDeposit(amount: number) {
  await page.click('button:has-text("Deposit")');
  await page.fill('input[ng-model="amount"]', amount.toString());
  await page.click('button[type="submit"]');
  
  const depositSuccessMessage = await page.locator('span:has-text("Deposit Successful")').isVisible();
  expect(depositSuccessMessage).toBeTruthy();
}

async function makeWithdrawal(amount: number) {
  await page.waitForTimeout(2000);
  await page.click('button:has-text("Withdrawl")');
  await page.waitForTimeout(2000);
  await page.fill('input[ng-model="amount"]', amount.toString());
  await page.waitForTimeout(2000);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const withdrawSuccessMessage = await page.locator('span:has-text("Transaction successful")').isVisible();
  expect(withdrawSuccessMessage).toBeTruthy();
}

async function verifyBalance(expectedBalance: number) {
  const balanceElement = await page.locator('div.center >> strong:nth-of-type(2)');
  const balanceText = await balanceElement.innerText();
  const actualBalance = Number(balanceText.replace(/[^0-9.-]+/g, ""));
  expect(actualBalance).toBe(expectedBalance);
}

async function deleteCustomer(firstName: string, lastName: string) {
  await page.click('button:has-text("Customers")');
  await page.fill('input[ng-model="searchCustomer"]', firstName);
  await page.waitForTimeout(500);
  await page.click(`tr:has-text("${lastName}") >> button:has-text("Delete")`);
  
  const customerDeleted = await page.isVisible(`text=${firstName} ${lastName}`);
  expect(customerDeleted).toBeFalsy();
}