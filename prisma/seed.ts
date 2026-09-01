import bcrypt from "bcryptjs";
import { AssetCategory, AssetStatus, DealType, PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.contactRequest.deleteMany();
  await prisma.asset.deleteMany({ where: { slug: { startsWith: "northbridge-e2e-" } } });
  await prisma.asset.deleteMany({ where: { slug: { startsWith: "manual-qa-asset-" } } });

  const [buyerHash, sellerHash, managerHash] = await Promise.all([
    bcrypt.hash("BuyerDemo2025!", 12),
    bcrypt.hash("SellerDemo2025!", 12),
    bcrypt.hash("ManagerDemo2025!", 12),
  ]);

  const buyer = await prisma.user.upsert({
    where: { email: "buyer@n5deal.demo" },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: "buyer@n5deal.demo",
      passwordHash: buyerHash,
      role: UserRole.BUYER,
      buyerProfile: {
        create: {
          fullName: "Maya Chen",
          companyName: "Northline Capital",
          investmentMin: 5000000,
          investmentMax: 50000000,
          revenueMin: 2000000,
          revenueMax: 40000000,
          ebitdaMin: 500000,
          ebitdaMax: 12000000,
          investmentThesis: "Backing resilient infrastructure and the next layer of financial access.",
          categories: { create: [{ category: AssetCategory.FINTECH }, { category: AssetCategory.PAYMENT }] },
          countries: { create: [{ country: "United Kingdom" }, { country: "Germany" }] },
          dealTypes: { create: [{ dealType: DealType.FULL_ACQUISITION }, { dealType: DealType.MAJORITY_STAKE }] },
        },
      },
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: "seller@n5deal.demo" },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: "seller@n5deal.demo",
      passwordHash: sellerHash,
      role: UserRole.SELLER,
      sellerProfile: { create: { fullName: "Jon Bell", companyName: "Bellwether Advisory", bio: "Independent advisors representing founder-led financial businesses." } },
    },
  });

  const secondSeller = await prisma.user.upsert({
    where: { email: "seller2@n5deal.demo" },
    update: { status: UserStatus.ACTIVE },
    create: {
      email: "seller2@n5deal.demo",
      passwordHash: sellerHash,
      role: UserRole.SELLER,
      sellerProfile: { create: { fullName: "Alina Petrova", companyName: "Meridian Bridge Partners", bio: "A specialist corporate finance team for regulated financial services." } },
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@n5deal.demo" },
    update: { status: UserStatus.ACTIVE },
    create: { email: "manager@n5deal.demo", passwordHash: managerHash, role: UserRole.MANAGER },
  });

  const sellerProfile = await prisma.sellerProfile.findUniqueOrThrow({ where: { userId: seller.id } });
  const secondSellerProfile = await prisma.sellerProfile.findUniqueOrThrow({ where: { userId: secondSeller.id } });
  await prisma.buyerProfile.update({
    where: { userId: buyer.id },
    data: {
      fullName: "Maya Chen",
      companyName: "Northline Capital",
      investmentMin: 5000000,
      investmentMax: 50000000,
      revenueMin: 2000000,
      revenueMax: 40000000,
      ebitdaMin: 500000,
      ebitdaMax: 12000000,
      investmentThesis: "Backing resilient infrastructure and the next layer of financial access.",
    },
  });
  const buyerProfile = await prisma.buyerProfile.findUniqueOrThrow({ where: { userId: buyer.id } });
  await Promise.all([
    prisma.buyerCategory.deleteMany({ where: { buyerId: buyerProfile.id } }),
    prisma.buyerCountry.deleteMany({ where: { buyerId: buyerProfile.id } }),
    prisma.buyerDealType.deleteMany({ where: { buyerId: buyerProfile.id } }),
  ]);
  await Promise.all([
    prisma.buyerCategory.createMany({ data: [{ buyerId: buyerProfile.id, category: AssetCategory.FINTECH }, { buyerId: buyerProfile.id, category: AssetCategory.PAYMENT }] }),
    prisma.buyerCountry.createMany({ data: [{ buyerId: buyerProfile.id, country: "United Kingdom" }, { buyerId: buyerProfile.id, country: "Germany" }] }),
    prisma.buyerDealType.createMany({ data: [{ buyerId: buyerProfile.id, dealType: DealType.FULL_ACQUISITION }, { buyerId: buyerProfile.id, dealType: DealType.MAJORITY_STAKE }] }),
  ]);
  await prisma.sellerProfile.update({ where: { userId: seller.id }, data: { fullName: "Jon Bell", companyName: "Bellwether Advisory", bio: "Independent advisors representing founder-led financial businesses." } });
  await prisma.sellerProfile.update({ where: { userId: secondSeller.id }, data: { fullName: "Alina Petrova", companyName: "Meridian Bridge Partners", bio: "A specialist corporate finance team for regulated financial services." } });
  const assets = [
    { slug: "orbit-payments-ltd", title: "Orbit Payments Ltd", category: AssetCategory.PAYMENT, country: "United Kingdom", description: "A regulated payments platform serving the long tail of European commerce.", askingPrice: 18500000, currency: "GBP", revenue: 4200000, ebitda: 1100000, dealType: DealType.MAJORITY_STAKE, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: sellerProfile.id },
      { slug: "clearledger-finance", title: "ClearLedger Finance", category: AssetCategory.FINTECH, country: "Germany", description: "Embedded finance infrastructure for modern vertical SaaS platforms.", askingPrice: 32000000, currency: "EUR", revenue: 8100000, ebitda: 2400000, dealType: DealType.FULL_ACQUISITION, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: sellerProfile.id },
      { slug: "harborline-credit", title: "Harborline Credit", category: AssetCategory.BANK, country: "Netherlands", description: "A specialist lending book with a strong SME customer base and a digital origination engine.", askingPrice: 12000000, currency: "EUR", revenue: 2900000, ebitda: 900000, dealType: DealType.ASSET_SALE, businessStatus: "Trading", status: AssetStatus.DRAFT, sellerId: sellerProfile.id },
      { slug: "northstar-emi", title: "Northstar EMI", category: AssetCategory.EMI, country: "Lithuania", description: "A passported electronic money institution with card issuing and local IBAN capabilities.", askingPrice: 9800000, currency: "EUR", revenue: 1750000, ebitda: 380000, dealType: DealType.FULL_ACQUISITION, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: sellerProfile.id },
      { slug: "cobalt-merchant-services", title: "Cobalt Merchant Services", category: AssetCategory.PAYMENT, country: "France", description: "A profitable merchant acquirer focused on high-retention hospitality and travel verticals.", askingPrice: 24500000, currency: "EUR", revenue: 6600000, ebitda: 1800000, dealType: DealType.MAJORITY_STAKE, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: sellerProfile.id },
      { slug: "ledgerlane", title: "Ledgerlane", category: AssetCategory.FINTECH, country: "Ireland", description: "Accounting automation and cash-flow tooling serving 4,000 growing businesses across the UK and Ireland.", askingPrice: 7600000, currency: "EUR", revenue: 3100000, ebitda: 620000, dealType: DealType.FULL_ACQUISITION, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: sellerProfile.id },
      { slug: "arcadia-digital-bank", title: "Arcadia Digital Bank", category: AssetCategory.BANK, country: "Spain", description: "A modern retail banking platform with a clean technology stack and a growing deposit franchise.", askingPrice: 42000000, currency: "EUR", revenue: 9800000, ebitda: 2100000, dealType: DealType.MINORITY_STAKE, businessStatus: "Growth", status: AssetStatus.ARCHIVED, sellerId: sellerProfile.id },
      { slug: "circuit-remit", title: "Circuit Remit", category: AssetCategory.PAYMENT, country: "Sweden", description: "Cross-border payout infrastructure connecting European payroll providers to emerging markets.", askingPrice: 15400000, currency: "EUR", revenue: 5200000, ebitda: 1350000, dealType: DealType.MAJORITY_STAKE, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: secondSellerProfile.id },
      { slug: "bluefin-digital-assets", title: "Bluefin Digital Assets", category: AssetCategory.CRYPTO, country: "Switzerland", description: "Institutional custody and settlement software with a compliance-first operating model.", askingPrice: 27000000, currency: "CHF", revenue: 4700000, ebitda: 840000, dealType: DealType.ASSET_SALE, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: secondSellerProfile.id },
      { slug: "veridian-credit", title: "Veridian Credit", category: AssetCategory.FINTECH, country: "Italy", description: "A secured SME lending platform with proprietary underwriting data and a repeat borrower base.", askingPrice: 18900000, currency: "EUR", revenue: 3700000, ebitda: 970000, dealType: DealType.FULL_ACQUISITION, businessStatus: "Trading", status: AssetStatus.PUBLISHED, sellerId: secondSellerProfile.id },
      { slug: "mosaic-pay", title: "Mosaic Pay", category: AssetCategory.PAYMENT, country: "Belgium", description: "A unified commerce gateway built for independent retailers and multi-location operators.", askingPrice: 11300000, currency: "EUR", revenue: 2600000, ebitda: 540000, dealType: DealType.MAJORITY_STAKE, businessStatus: "Trading", status: AssetStatus.DRAFT, sellerId: secondSellerProfile.id },
    { slug: "finspire-platform", title: "Finspire Platform", category: AssetCategory.FINTECH, country: "Denmark", description: "Open banking tools that help lenders make faster, more transparent credit decisions.", askingPrice: 33500000, currency: "EUR", revenue: 7200000, ebitda: 1950000, dealType: DealType.MERGER, businessStatus: "Growth", status: AssetStatus.PUBLISHED, sellerId: secondSellerProfile.id },
  ];
  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { slug: asset.slug },
      update: { ...asset, previousStatus: null },
      create: asset,
    });
  }

  console.log(`Seeded ${buyer.email}, ${seller.email}, and manager@n5deal.demo.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
