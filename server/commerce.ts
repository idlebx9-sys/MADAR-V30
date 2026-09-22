import { db, getDB, saveDB } from './db.ts';
import { WalletService } from './ledger/wallet-service.ts';
import { Money } from './ledger/money.ts';

export const commerce = {
  async getWallet(userId: number) {
    const wallet = await WalletService.getOrCreateWallet(userId);
    const transactions = await db.wallets.getTransactions(wallet.id);
    const depositRequests = await db.wallets.getDepositRequestsForUser(userId);
    return { wallet, transactions, depositRequests };
  },

  async depositFunds(userId: number, amount: number | string, paymentMethod: string, txHash?: string, notes?: string, proofImage?: string) {
    return await WalletService.submitDepositRequest({
      userId,
      amount,
      paymentMethod,
      txHash,
      notes,
      proofImage,
    });
  },

  async cancelDeposit(userId: number, depositId: number, reason?: string) {
    return await WalletService.cancelDepositRequest(depositId, userId, reason);
  },

  async purchaseSiteLifetime(userId: number, siteId: number) {
    const s = await getDB();
    // Dynamic price from platformSettings using Money
    const priceSetting = s.platformSettings?.find((st: any) => st.keyName === 'lifetime_site_price');
    const priceStr = priceSetting?.keyValue ? String(priceSetting.keyValue) : '299.00';
    const price = Money.from(priceStr);

    // Atomically debit wallet via ledger engine
    const { transaction } = await WalletService.debitForPurchase(
      userId,
      price.toString(),
      `شراء ترخيص موقع مكتب الزواج مدى الحياة (موقع #${siteId})`,
      `PUR-SITE-${siteId}-${Date.now().toString(36).toUpperCase()}`
    );

    // Record purchase
    const purchaseId = (s.sitePurchases.reduce((max: number, p: any) => Math.max(max, p.id), 0) || 0) + 1;
    const purchase = {
      id: purchaseId,
      siteId,
      userId,
      amountPaid: price.toString(),
      currency: 'USD',
      purchasedAt: new Date().toISOString(),
      expiresAt: null,
      tier: 'lifetime',
    };
    s.sitePurchases.push(purchase);

    // Record platform revenue
    const revId = (s.platformRevenue.reduce((max: number, r: any) => Math.max(max, r.id), 0) || 0) + 1;
    s.platformRevenue.push({
      id: revId,
      source: 'شراء ترخيص موقع مكتب زواج مدى الحياة',
      amount: price.toString(),
      currency: 'USD',
      siteId,
      userId,
      recordedAt: new Date().toISOString(),
    });

    // Update site status to active
    const site = s.sites.find((st: any) => st.id === siteId);
    if (site) {
      site.status = 'active';
      site.updatedAt = new Date().toISOString();
    }

    saveDB();
    return { purchase, transaction };
  },

  async getCurrencies() {
    const s = await getDB();
    return s.currencyRates;
  },
};
