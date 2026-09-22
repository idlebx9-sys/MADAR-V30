import { getDB, saveDB } from '../db.ts';
import { Money } from './money.ts';
import { AsyncMutex } from './mutex.ts';

export interface DepositRequestInput {
  userId: number;
  amount: string | number;
  currency?: string;
  paymentMethod: string;
  txHash?: string;
  proofImage?: string | null;
  notes?: string;
}

export interface AdminAdjustmentInput {
  walletId: number;
  amount: string | number;
  currency?: string;
  reason: string;
  adminUserId: number;
}

export interface RefundInput {
  originalTransactionId: number;
  reason: string;
  adminUserId: number;
}

export class WalletService {
  /**
   * Get or initialize a user's wallet with zero balance.
   */
  static async getOrCreateWallet(userId: number, currency: string = 'USD') {
    return await AsyncMutex.withLock(`wallet:user:${userId}`, async () => {
      const s = await getDB();
      let wallet = s.wallets.find((w: any) => w.userId === userId);
      if (!wallet) {
        const id = (s.wallets.reduce((max: number, w: any) => Math.max(max, w.id), 0) || 0) + 1;
        wallet = {
          id,
          userId,
          balance: '0.00',
          currency,
          updatedAt: new Date().toISOString(),
        };
        s.wallets.push(wallet);
        saveDB();
      }
      return wallet;
    });
  }

  /**
   * Derive balance directly by summing all ledger transactions.
   * Ensures ledger audit integrity.
   */
  static async getDerivedBalance(walletId: number): Promise<Money> {
    const s = await getDB();
    const txs = s.walletTransactions.filter((t: any) => t.walletId === walletId);
    let total = Money.zero();
    for (const tx of txs) {
      total = total.add(Money.from(tx.amount));
    }
    return total;
  }

  /**
   * Submit a deposit request. Status is STRICTLY 'pending'.
   * Auto-approval is strictly forbidden.
   */
  static async submitDepositRequest(input: DepositRequestInput) {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error('مبلغ الإيداع يجب أن يكون أكبر من الصفر');
    }

    const s = await getDB();
    const user = s.users.find((u: any) => u.id === input.userId);
    if (!user) throw new Error('المستخدم غير موجود');

    // Ensure wallet exists
    await this.getOrCreateWallet(input.userId, input.currency || 'USD');

    const now = new Date().toISOString();
    const reqId = (s.walletDepositRequests.reduce((max: number, r: any) => Math.max(max, r.id), 0) || 0) + 1;
    const txHash = input.txHash || `DEP-${Date.now().toString(36).toUpperCase()}`;

    const depositReq = {
      id: reqId,
      userId: input.userId,
      amount: amount.toString(),
      currency: input.currency || 'USD',
      paymentMethod: input.paymentMethod,
      proofImage: input.proofImage || null,
      txHash,
      status: 'pending' as const, // STRICTLY pending
      notes: input.notes || 'طلب شحن رصيد بالمحفظة',
      rejectReason: null,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      cancelledAt: null,
      createdAt: now,
    };

    s.walletDepositRequests.unshift(depositReq);

    // Notify administrators
    const admins = s.users.filter((u: any) => u.role === 'admin');
    for (const admin of admins) {
      const notifId = (s.notifications.reduce((max: number, n: any) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: admin.id,
        title: 'طلب إيداع رصيد بانتظار المراجعة والاعتماد',
        message: `قدم المستخدم #${input.userId} (${user.name}) طلب إيداع بمبلغ ${amount.toString()}$ عبر ${input.paymentMethod}. المرجع: ${txHash}`,
        type: 'deposit_pending',
        isRead: false,
        link: '/admin?tab=portfolios',
        createdAt: now,
      });
    }

    // Audit log
    const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
    s.auditLogs.push({
      id: logId,
      userId: input.userId,
      action: 'SUBMIT_DEPOSIT_REQUEST',
      details: `تقديم طلب إيداع #${reqId} بمبلغ ${amount.toString()}$ عبر ${input.paymentMethod}`,
      ipAddress: '127.0.0.1',
      createdAt: now,
    });

    saveDB();
    return depositReq;
  }

  /**
   * Approve deposit request.
   * Atomic lock + verify pending status + ledger transaction + credit balance + notifications + audit log.
   */
  static async approveDepositRequest(depositId: number, adminUserId: number) {
    return await AsyncMutex.withLocks([`deposit:${depositId}`], async () => {
      const s = await getDB();
      const req = s.walletDepositRequests.find((r: any) => r.id === depositId);
      if (!req) throw new Error('طلب الإيداع غير موجود');

      // Double-approval & race condition guard: must be strictly pending
      if (req.status !== 'pending') {
        throw new Error(`لا يمكن اعتماد الطلب؛ الحالة الحالية هي: "${req.status}"`);
      }

      // Lock the target wallet
      return await AsyncMutex.withLock(`wallet:user:${req.userId}`, async () => {
        const now = new Date().toISOString();
        const depositAmount = Money.from(req.amount);

        // Find or create wallet
        let wallet = s.wallets.find((w: any) => w.userId === req.userId);
        if (!wallet) {
          const wId = (s.wallets.reduce((max: number, w: any) => Math.max(max, w.id), 0) || 0) + 1;
          wallet = {
            id: wId,
            userId: req.userId,
            balance: '0.00',
            currency: req.currency || 'USD',
            updatedAt: now,
          };
          s.wallets.push(wallet);
        }

        // 1. Mark request as approved
        req.status = 'approved';
        req.approvedAt = now;
        req.approvedBy = adminUserId;

        // 2. Create ledger transaction entry
        const txId = (s.walletTransactions.reduce((max: number, t: any) => Math.max(max, t.id), 0) || 0) + 1;
        const tx = {
          id: txId,
          walletId: wallet.id,
          amount: depositAmount.toString(),
          type: 'deposit',
          description: `إيداع معتمد من الإدارة (${req.paymentMethod})`,
          referenceId: req.txHash || `DEP-${depositId}`,
          createdAt: now,
        };
        s.walletTransactions.push(tx);

        // 3. Atomically update wallet balance using exact Decimal math
        const currentBal = Money.from(wallet.balance);
        const newBal = currentBal.add(depositAmount);
        wallet.balance = newBal.toString();
        wallet.updatedAt = now;

        // 4. Send notification to user
        const notifId = (s.notifications.reduce((max: number, n: any) => Math.max(max, n.id), 0) || 0) + 1;
        s.notifications.unshift({
          id: notifId,
          userId: req.userId,
          title: 'تم اعتماد إيداع الرصيد بنجاح',
          message: `تم التحقق من الحوالة وإيداع مبلغ ${depositAmount.toString()}$ في محفظتك بنجاح. رصيدك الحالي: ${newBal.toString()}$.`,
          type: 'deposit_approved',
          isRead: false,
          link: '/dashboard?tab=wallet',
          createdAt: now,
        });

        // 5. Create audit log
        const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
        s.auditLogs.push({
          id: logId,
          userId: adminUserId,
          action: 'APPROVE_DEPOSIT',
          details: `اعتماد طلب إيداع #${depositId} للمستخدم #${req.userId} بمبلغ ${depositAmount.toString()}$ - الرصيد الجديد: ${newBal.toString()}$`,
          ipAddress: '127.0.0.1',
          createdAt: now,
        });

        saveDB();
        return { request: req, transaction: tx, newBalance: newBal.toString() };
      });
    });
  }

  /**
   * Reject deposit request.
   * Strictly adds zero balance. Records reason, audit log, and notifies user.
   */
  static async rejectDepositRequest(depositId: number, adminUserId: number, reason: string) {
    if (!reason || reason.trim().length === 0) {
      throw new Error('سبب الرفض مطلوب');
    }

    return await AsyncMutex.withLock(`deposit:${depositId}`, async () => {
      const s = await getDB();
      const req = s.walletDepositRequests.find((r: any) => r.id === depositId);
      if (!req) throw new Error('طلب الإيداع غير موجود');

      if (req.status !== 'pending') {
        throw new Error(`لا يمكن رفض الطلب؛ الحالة الحالية هي: "${req.status}"`);
      }

      const now = new Date().toISOString();
      req.status = 'rejected';
      req.rejectedAt = now;
      req.rejectedBy = adminUserId;
      req.rejectReason = reason.trim();

      // Notify user
      const notifId = (s.notifications.reduce((max: number, n: any) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: req.userId,
        title: 'تم رفض طلب إيداع الرصيد',
        message: `تعذر اعتماد طلب الإيداع بمبلغ ${req.amount}$. السبب: ${req.rejectReason}`,
        type: 'deposit_rejected',
        isRead: false,
        link: '/dashboard?tab=wallet',
        createdAt: now,
      });

      // Audit log
      const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: adminUserId,
        action: 'REJECT_DEPOSIT',
        details: `رفض طلب إيداع #${depositId} للمستخدم #${req.userId} بمبلغ ${req.amount}$. السبب: ${req.rejectReason}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return req;
    });
  }

  /**
   * Cancel pending deposit request by the user.
   */
  static async cancelDepositRequest(depositId: number, userId: number, reason?: string) {
    return await AsyncMutex.withLock(`deposit:${depositId}`, async () => {
      const s = await getDB();
      const req = s.walletDepositRequests.find((r: any) => r.id === depositId);
      if (!req) throw new Error('طلب الإيداع غير موجود');

      if (req.userId !== userId) {
        throw new Error('غير مصرح لك بإلغاء هذا الطلب');
      }

      if (req.status !== 'pending') {
        throw new Error(`لا يمكن إلغاء الطلب؛ الحالة الحالية هي: "${req.status}"`);
      }

      const now = new Date().toISOString();
      req.status = 'cancelled';
      req.cancelledAt = now;
      req.rejectReason = reason || 'تم الإلغاء بواسطة المستخدم';

      const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId,
        action: 'CANCEL_DEPOSIT',
        details: `إلغاء طلب إيداع #${depositId} بواسطة المستخدم`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return req;
    });
  }

  /**
   * Admin Credit adjustment:
   * Requires amount, currency, reason.
   * Atomically credits wallet and records in ledger and audit log.
   */
  static async adminCredit(input: AdminAdjustmentInput) {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error('مبلغ الإضافة يجب أن يكون أكبر من الصفر');
    }
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error('سبب الإضافة الإدارية مطلوب');
    }

    return await AsyncMutex.withLock(`wallet:${input.walletId}`, async () => {
      const s = await getDB();
      const wallet = s.wallets.find((w: any) => w.id === input.walletId);
      if (!wallet) throw new Error('المحفظة غير موجودة');

      const now = new Date().toISOString();
      const currentBal = Money.from(wallet.balance);
      const newBal = currentBal.add(amount);

      // Ledger transaction
      const txId = (s.walletTransactions.reduce((max: number, t: any) => Math.max(max, t.id), 0) || 0) + 1;
      const tx = {
        id: txId,
        walletId: wallet.id,
        amount: amount.toString(),
        type: 'admin_credit',
        description: `إضافة رصيد إدارية: ${input.reason.trim()}`,
        referenceId: `ADM-CR-${Date.now().toString(36).toUpperCase()}`,
        createdAt: now,
      };
      s.walletTransactions.push(tx);

      // Update wallet balance
      wallet.balance = newBal.toString();
      wallet.updatedAt = now;

      // Notify user
      const notifId = (s.notifications.reduce((max: number, n: any) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: wallet.userId,
        title: 'إضافة رصيد من إدارة المنصة',
        message: `تمت إضافة مبلغ ${amount.toString()}$ إلى محفظتك. السبب: ${input.reason.trim()}. رصيدك الجديد: ${newBal.toString()}$.`,
        type: 'info',
        isRead: false,
        link: '/dashboard?tab=wallet',
        createdAt: now,
      });

      // Audit log
      const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: input.adminUserId,
        action: 'ADMIN_CREDIT',
        details: `إضافة رصيد للمحفظة #${wallet.id} (المستخدم #${wallet.userId}) بمبلغ ${amount.toString()}$ - السبب: ${input.reason.trim()}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return { transaction: tx, newBalance: newBal.toString() };
    });
  }

  /**
   * Admin Debit adjustment:
   * Requires amount, currency, reason.
   * Checks sufficient balance. Atomically debits wallet and records in ledger and audit log.
   */
  static async adminDebit(input: AdminAdjustmentInput) {
    const amount = Money.from(input.amount);
    if (!amount.isPositive()) {
      throw new Error('مبلغ الخصم يجب أن يكون أكبر من الصفر');
    }
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error('سبب الخصم الإداري مطلوب');
    }

    return await AsyncMutex.withLock(`wallet:${input.walletId}`, async () => {
      const s = await getDB();
      const wallet = s.wallets.find((w: any) => w.id === input.walletId);
      if (!wallet) throw new Error('المحفظة غير موجودة');

      const currentBal = Money.from(wallet.balance);
      if (currentBal.lessThan(amount)) {
        throw new Error(`رصيد المحفظة (${currentBal.toString()}$) غير كافٍ لخصم مبلغ (${amount.toString()}$)`);
      }

      const now = new Date().toISOString();
      const newBal = currentBal.subtract(amount);

      // Ledger transaction (negative amount)
      const txId = (s.walletTransactions.reduce((max: number, t: any) => Math.max(max, t.id), 0) || 0) + 1;
      const tx = {
        id: txId,
        walletId: wallet.id,
        amount: amount.negate().toString(),
        type: 'admin_debit',
        description: `خصم رصيد إداري: ${input.reason.trim()}`,
        referenceId: `ADM-DB-${Date.now().toString(36).toUpperCase()}`,
        createdAt: now,
      };
      s.walletTransactions.push(tx);

      // Update wallet balance
      wallet.balance = newBal.toString();
      wallet.updatedAt = now;

      // Notify user
      const notifId = (s.notifications.reduce((max: number, n: any) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: wallet.userId,
        title: 'خصم رصيد من إدارة المنصة',
        message: `تم خصم مبلغ ${amount.toString()}$ من محفظتك. السبب: ${input.reason.trim()}. رصيدك المتبقي: ${newBal.toString()}$.`,
        type: 'warning',
        isRead: false,
        link: '/dashboard?tab=wallet',
        createdAt: now,
      });

      // Audit log
      const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: input.adminUserId,
        action: 'ADMIN_DEBIT',
        details: `خصم رصيد من المحفظة #${wallet.id} (المستخدم #${wallet.userId}) بمبلغ ${amount.toString()}$ - السبب: ${input.reason.trim()}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return { transaction: tx, newBalance: newBal.toString() };
    });
  }

  /**
   * Refund a previous transaction:
   * DOES NOT DELETE original transaction.
   * Creates an immutable reversal ledger entry, credits balance, and creates audit log.
   */
  static async refundTransaction(input: RefundInput) {
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error('سبب استرداد العملية مطلوب');
    }

    const s = await getDB();
    const origTx = s.walletTransactions.find((t: any) => t.id === input.originalTransactionId);
    if (!origTx) throw new Error('العملية المطلوب استردادها غير موجودة');

    return await AsyncMutex.withLock(`wallet:${origTx.walletId}`, async () => {
      // Check if this transaction has already been refunded
      const alreadyRefunded = s.walletTransactions.some(
        (t: any) => t.type === 'refund' && t.referenceId === `REFUND-${origTx.id}`
      );
      if (alreadyRefunded) {
        throw new Error('تم استرداد هذه العملية مسبقاً');
      }

      const origAmount = Money.from(origTx.amount);
      if (!origAmount.isNegative()) {
        throw new Error('لا يمكن استرداد إلا العمليات المدينة (المخصومة) مثل المشتريات أو الخصومات الإدارية');
      }

      const refundAmount = origAmount.abs(); // positive credit back to wallet
      const wallet = s.wallets.find((w: any) => w.id === origTx.walletId);
      if (!wallet) throw new Error('المحفظة غير موجودة');

      const now = new Date().toISOString();
      const currentBal = Money.from(wallet.balance);
      const newBal = currentBal.add(refundAmount);

      // Create reversal transaction
      const txId = (s.walletTransactions.reduce((max: number, t: any) => Math.max(max, t.id), 0) || 0) + 1;
      const reversalTx = {
        id: txId,
        walletId: wallet.id,
        amount: refundAmount.toString(),
        type: 'refund',
        description: `استرداد العملية #${origTx.id}: ${input.reason.trim()}`,
        referenceId: `REFUND-${origTx.id}`,
        createdAt: now,
      };
      s.walletTransactions.push(reversalTx);

      // Update wallet balance
      wallet.balance = newBal.toString();
      wallet.updatedAt = now;

      // Notify user
      const notifId = (s.notifications.reduce((max: number, n: any) => Math.max(max, n.id), 0) || 0) + 1;
      s.notifications.unshift({
        id: notifId,
        userId: wallet.userId,
        title: 'استرداد مالي إلى محفظتك',
        message: `تمت معالجة استرداد مالي بمبلغ ${refundAmount.toString()}$ للعملية #${origTx.id}. السبب: ${input.reason.trim()}. رصيدك الحالي: ${newBal.toString()}$.`,
        type: 'success',
        isRead: false,
        link: '/dashboard?tab=wallet',
        createdAt: now,
      });

      // Audit log
      const logId = (s.auditLogs.reduce((max: number, l: any) => Math.max(max, l.id), 0) || 0) + 1;
      s.auditLogs.push({
        id: logId,
        userId: input.adminUserId,
        action: 'REFUND_TRANSACTION',
        details: `استرداد مالي للعملية #${origTx.id} بمبلغ ${refundAmount.toString()}$ - السبب: ${input.reason.trim()}`,
        ipAddress: '127.0.0.1',
        createdAt: now,
      });

      saveDB();
      return { reversalTransaction: reversalTx, newBalance: newBal.toString() };
    });
  }

  /**
   * Atomic debit for site purchase or service payment.
   * Checks sufficient balance, adds purchase ledger entry, updates wallet balance.
   */
  static async debitForPurchase(userId: number, amountVal: string | number, description: string, referenceId?: string) {
    const amount = Money.from(amountVal);
    if (!amount.isPositive()) {
      throw new Error('مبلغ الشراء يجب أن يكون أكبر من الصفر');
    }

    return await AsyncMutex.withLock(`wallet:user:${userId}`, async () => {
      const s = await getDB();
      const wallet = s.wallets.find((w: any) => w.userId === userId);
      if (!wallet) throw new Error('المحفظة غير موجودة');

      const currentBal = Money.from(wallet.balance);
      if (currentBal.lessThan(amount)) {
        throw new Error(`رصيد محفظتك (${currentBal.toString()}$) غير كافٍ لإتمام عملية الشراء (${amount.toString()}$). يرجى تقديم طلب شحن للمحفظة وانتظار اعتماد الإدارة.`);
      }

      const now = new Date().toISOString();
      const newBal = currentBal.subtract(amount);

      // Ledger transaction (negative amount)
      const txId = (s.walletTransactions.reduce((max: number, t: any) => Math.max(max, t.id), 0) || 0) + 1;
      const tx = {
        id: txId,
        walletId: wallet.id,
        amount: amount.negate().toString(),
        type: 'purchase',
        description,
        referenceId: referenceId || `PUR-${Date.now().toString(36).toUpperCase()}`,
        createdAt: now,
      };
      s.walletTransactions.push(tx);

      wallet.balance = newBal.toString();
      wallet.updatedAt = now;

      saveDB();
      return { transaction: tx, newBalance: newBal.toString() };
    });
  }
}
