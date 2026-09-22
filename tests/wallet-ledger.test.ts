import { WalletService } from '../server/ledger/wallet-service.ts';
import { Money } from '../server/ledger/money.ts';
import { getDB } from '../server/db.ts';

let passedCount = 0;
let failedCount = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    process.stdout.write(`⏳ [TEST] ${name}... `);
    await fn();
    console.log(`✅ PASSED`);
    passedCount++;
  } catch (err: any) {
    console.log(`❌ FAILED`);
    console.error(`   Error:`, err?.message || err);
    failedCount++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function main() {
  console.log('\n======================================================');
  console.log('  MADAR Financial Ledger System Test Suite');
  console.log('======================================================\n');

  const s = await getDB();
  // Set up isolated test user and admin
  const testUserId = 9991;
  const testAdminId = 9992;

  // Cleanup any leftover test data
  s.users = s.users.filter((u: any) => u.id !== testUserId && u.id !== testAdminId);
  s.wallets = s.wallets.filter((w: any) => w.userId !== testUserId);
  s.walletDepositRequests = s.walletDepositRequests.filter((r: any) => r.userId !== testUserId);
  s.walletTransactions = s.walletTransactions.filter((t: any) => t.walletId > 9000);

  s.users.push({
    id: testUserId,
    email: 'ledger_user@madar.test',
    passwordHash: 'hash',
    name: 'مستخدم تجريبي للمحفظة',
    role: 'user',
    isApproved: true,
    createdAt: new Date().toISOString(),
  });
  s.users.push({
    id: testAdminId,
    email: 'ledger_admin@madar.test',
    passwordHash: 'hash',
    name: 'مدير مالي تجريبي',
    role: 'admin',
    isApproved: true,
    createdAt: new Date().toISOString(),
  });

  // Test 1: Decimal Precision & No parseFloat
  await runTest('Decimal Precision (0.10 + 0.20 = 0.30 exact)', async () => {
    const a = Money.fromString('0.10');
    const b = Money.fromString('0.20');
    const sum = a.add(b);
    assert(sum.toString() === '0.30', `Expected 0.30, got ${sum.toString()}`);
    assert(sum.cents === 30n, `Expected 30 cents, got ${sum.cents}`);

    // Test subtract
    const diff = sum.subtract('0.05');
    assert(diff.toString() === '0.25', `Expected 0.25, got ${diff.toString()}`);
  });

  // Test 2: Deposit Pending (No Auto-Approval, No Balance Change)
  let depositReq1Id: number;
  await runTest('Deposit Pending (Strictly pending, zero balance change)', async () => {
    const req = await WalletService.submitDepositRequest({
      userId: testUserId,
      amount: '150.00',
      paymentMethod: 'bank_transfer',
      txHash: 'TEST-TX-101',
      notes: 'إيداع تجريبي للاختبار',
    });

    depositReq1Id = req.id;
    assert(req.status === 'pending', `Expected pending status, got ${req.status}`);
    assert(req.amount === '150.00', `Expected amount 150.00, got ${req.amount}`);

    // Verify wallet balance is strictly 0.00
    const wallet = await WalletService.getOrCreateWallet(testUserId);
    assert(wallet.balance === '0.00', `Balance must remain 0.00 while pending, got ${wallet.balance}`);
  });

  // Test 3: Deposit Approve (Atomic Credit, Transaction Created, Balance Updated)
  await runTest('Deposit Approve (Atomic transaction, credit, audit log)', async () => {
    const res = await WalletService.approveDepositRequest(depositReq1Id, testAdminId);
    assert(res.request.status === 'approved', `Expected status approved, got ${res.request.status}`);
    assert(res.newBalance === '150.00', `Expected balance 150.00, got ${res.newBalance}`);

    const wallet = await WalletService.getOrCreateWallet(testUserId);
    assert(wallet.balance === '150.00', `Wallet balance must be 150.00, got ${wallet.balance}`);

    // Verify derived ledger balance matches wallet balance
    const derived = await WalletService.getDerivedBalance(wallet.id);
    assert(derived.toString() === '150.00', `Derived balance must equal 150.00, got ${derived.toString()}`);
  });

  // Test 4: Double Approval Prevention
  await runTest('Double Approval Prevention (Reject duplicate approval)', async () => {
    let threw = false;
    try {
      await WalletService.approveDepositRequest(depositReq1Id, testAdminId);
    } catch (err: any) {
      threw = true;
      assert(err.message.includes('الحالة الحالية هي: "approved"'), `Expected rejection message, got: ${err.message}`);
    }
    assert(threw, 'Double approval must throw error');

    const wallet = await WalletService.getOrCreateWallet(testUserId);
    assert(wallet.balance === '150.00', `Balance must not change on duplicate approval, got ${wallet.balance}`);
  });

  // Test 5: Deposit Reject (Zero Balance Added, Reason Recorded)
  let depositReq2Id: number;
  await runTest('Deposit Reject (Zero balance added, reason preserved)', async () => {
    const req = await WalletService.submitDepositRequest({
      userId: testUserId,
      amount: '500.00',
      paymentMethod: 'bank_transfer',
      txHash: 'FAKE-TX-999',
      notes: 'إيداع مرفوض تجريبي',
    });
    depositReq2Id = req.id;

    const rejected = await WalletService.rejectDepositRequest(depositReq2Id, testAdminId, 'الحوالة غير مطابقة');
    assert(rejected.status === 'rejected', `Expected rejected status, got ${rejected.status}`);
    assert(rejected.rejectReason === 'الحوالة غير مطابقة', `Expected reject reason, got ${rejected.rejectReason}`);

    const wallet = await WalletService.getOrCreateWallet(testUserId);
    assert(wallet.balance === '150.00', `Balance must remain 150.00 after rejection, got ${wallet.balance}`);
  });

  // Test 6: Insufficient Balance Protection on Purchase
  await runTest('Insufficient Balance Protection (Cannot overdraw wallet)', async () => {
    let threw = false;
    try {
      // Current balance is 150.00, try to purchase something worth 299.00
      await WalletService.debitForPurchase(testUserId, '299.00', 'شراء موقع تجريبي');
    } catch (err: any) {
      threw = true;
      assert(err.message.includes('غير كافٍ'), `Expected insufficient balance message, got ${err.message}`);
    }
    assert(threw, 'Overdraft purchase must throw error');

    const wallet = await WalletService.getOrCreateWallet(testUserId);
    assert(wallet.balance === '150.00', `Balance must remain intact, got ${wallet.balance}`);
  });

  // Test 7: Admin Credit (Requires Amount, Currency, Reason)
  let adminCreditTxId: number;
  await runTest('Admin Credit (Manual adjustment with reason and audit log)', async () => {
    const wallet = await WalletService.getOrCreateWallet(testUserId);
    const res = await WalletService.adminCredit({
      walletId: wallet.id,
      amount: '200.00',
      currency: 'USD',
      reason: 'مكافأة ترويجية للمكتب',
      adminUserId: testAdminId,
    });

    adminCreditTxId = res.transaction.id;
    assert(res.newBalance === '350.00', `Expected balance 350.00, got ${res.newBalance}`);
    assert(res.transaction.type === 'admin_credit', `Expected type admin_credit, got ${res.transaction.type}`);

    const updated = await WalletService.getOrCreateWallet(testUserId);
    assert(updated.balance === '350.00', `Wallet balance must be 350.00, got ${updated.balance}`);
  });

  // Test 8: Admin Debit (Deduct with Reason & Balance Verification)
  let adminDebitTxId: number;
  await runTest('Admin Debit (Manual deduction with reason & balance check)', async () => {
    const wallet = await WalletService.getOrCreateWallet(testUserId);
    const res = await WalletService.adminDebit({
      walletId: wallet.id,
      amount: '50.00',
      currency: 'USD',
      reason: 'رسوم خدمات إضافية',
      adminUserId: testAdminId,
    });

    adminDebitTxId = res.transaction.id;
    assert(res.newBalance === '300.00', `Expected balance 300.00, got ${res.newBalance}`);
    assert(res.transaction.type === 'admin_debit', `Expected type admin_debit, got ${res.transaction.type}`);

    const updated = await WalletService.getOrCreateWallet(testUserId);
    assert(updated.balance === '300.00', `Wallet balance must be 300.00, got ${updated.balance}`);
  });

  // Test 9: Refund (Reversal Transaction, Never Delete Original)
  await runTest('Refund (Creates reversal transaction, does not delete original)', async () => {
    // We debit 100.00 for a purchase first
    const { transaction: purchaseTx } = await WalletService.debitForPurchase(
      testUserId,
      '100.00',
      'رسوم تجريبية قابلة للاسترداد'
    );
    const intermediateWallet = await WalletService.getOrCreateWallet(testUserId);
    assert(intermediateWallet.balance === '200.00', `Expected 200.00 after purchase, got ${intermediateWallet.balance}`);

    // Now refund the purchase
    const res = await WalletService.refundTransaction({
      originalTransactionId: purchaseTx.id,
      reason: 'إلغاء الترخيص بطلب العميل',
      adminUserId: testAdminId,
    });

    assert(res.newBalance === '300.00', `Expected balance 300.00 after refund, got ${res.newBalance}`);
    assert(res.reversalTransaction.type === 'refund', `Expected type refund, got ${res.reversalTransaction.type}`);
    assert(res.reversalTransaction.amount === '100.00', `Expected +100.00 refund, got ${res.reversalTransaction.amount}`);

    // Verify original transaction still exists (never deleted!)
    const currentDB = await getDB();
    const originalStillExists = currentDB.walletTransactions.some((t: any) => t.id === purchaseTx.id);
    assert(originalStillExists, 'Original transaction must never be deleted on refund');

    // Verify double-refund is blocked
    let doubleRefundThrew = false;
    try {
      await WalletService.refundTransaction({
        originalTransactionId: purchaseTx.id,
        reason: 'محاولة استرداد مكررة',
        adminUserId: testAdminId,
      });
    } catch (err: any) {
      doubleRefundThrew = true;
      assert(err.message.includes('مسبقاً'), `Expected already refunded error, got ${err.message}`);
    }
    assert(doubleRefundThrew, 'Double refund must throw error');
  });

  // Test 10: Concurrent Transactions & Mutex Lock Atomicity
  await runTest('Concurrent Transactions (Race condition test with 10 parallel ops)', async () => {
    const wallet = await WalletService.getOrCreateWallet(testUserId);
    const startBalance = Money.from(wallet.balance);

    // Run 5 credits of 10.00 and 5 debits of 5.00 concurrently
    const operations: Promise<any>[] = [];
    for (let i = 0; i < 5; i++) {
      operations.push(
        WalletService.adminCredit({
          walletId: wallet.id,
          amount: '10.00',
          reason: `إيداع متزامن #${i}`,
          adminUserId: testAdminId,
        })
      );
      operations.push(
        WalletService.adminDebit({
          walletId: wallet.id,
          amount: '5.00',
          reason: `خصم متزامن #${i}`,
          adminUserId: testAdminId,
        })
      );
    }

    await Promise.all(operations);

    // Net expected change = + (5 * 10) - (5 * 5) = +25.00
    const expectedFinal = startBalance.add('25.00');
    const finalWallet = await WalletService.getOrCreateWallet(testUserId);
    assert(
      finalWallet.balance === expectedFinal.toString(),
      `Expected final balance ${expectedFinal.toString()}, got ${finalWallet.balance}`
    );

    // Verify ledger audit sum strictly matches
    const derived = await WalletService.getDerivedBalance(wallet.id);
    assert(
      derived.toString() === finalWallet.balance,
      `Derived ledger balance (${derived.toString()}) must match wallet balance (${finalWallet.balance})`
    );
  });

  console.log('\n======================================================');
  console.log(`  Results: ${passedCount} passed, ${failedCount} failed`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
