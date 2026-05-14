// Centralized mock data service simulating Prisma schema for the Affiliate Marketplace Network.
// All compiler functions are pure — they aggregate mock entities into UI-ready shapes.

export type OrderStatus = "PENDING" | "COMPLETED" | "DELIVERED" | "CANCELLED";
export type DamageReason = "DAMAGED_IN_TRANSIT" | "WRONG_ITEM" | "DEFECTIVE" | "CUSTOMER_CHANGED_MIND" | "SIZE_ISSUE";

export interface MockCategory { id: string; name: string; }
export interface MockProduct { id: string; name: string; categoryId: string; status: "ACTIVE" | "DRAFT" | "ARCHIVED"; }
export interface MockVariant { id: string; productId: string; label: string; color?: string; size?: string; }
export interface MockWarehouse { id: string; name: string; city: string; }
export interface MockWarehouseStock { variantId: string; warehouseId: string; quantity: number; reservedQuantity: number; }
export interface MockOrderItem { id: string; orderId: string; productId: string; variantId: string; quantity: number; status: OrderStatus; date: string; }
export interface MockOrderItemReturn { id: string; orderItemId: string; variantId: string; productId: string; quantity: number; damageReason: DamageReason; restocked: boolean; date: string; }
export interface MockReaction { id: string; productId: string; type: "LIKE" | "LOVE" | "INTERESTED"; date: string; }
export interface MockComment { id: string; productId: string; date: string; }

// ---------- Seeded RNG for predictable data ----------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

// ---------- Seed entities ----------
export const categories: MockCategory[] = [
  { id: "c1", name: "Apparel" },
  { id: "c2", name: "Footwear" },
  { id: "c3", name: "Accessories" },
  { id: "c4", name: "Home Goods" },
  { id: "c5", name: "Beauty" },
];

const productNames: Record<string, string[]> = {
  c1: ["Oversized Hoodie", "Linen Shirt", "Cargo Pants", "Wool Sweater", "Graphic Tee"],
  c2: ["Runner Sneaker", "Hiking Boot", "Leather Loafer"],
  c3: ["Canvas Tote", "Crossbody Bag", "Bucket Hat", "Aviator Sunglasses"],
  c4: ["Ceramic Mug Set", "Linen Throw"],
  c5: ["Vitamin C Serum", "Lip Balm Trio"],
};

export const products: MockProduct[] = [];
Object.entries(productNames).forEach(([cat, names]) => {
  names.forEach((name, i) => {
    products.push({
      id: `p-${cat}-${i}`,
      name,
      categoryId: cat,
      status: rand() > 0.1 ? "ACTIVE" : rand() > 0.5 ? "DRAFT" : "ARCHIVED",
    });
  });
});

const colors = ["Black", "Ivory", "Olive", "Navy", "Rust"];
const sizes = ["XS", "S", "M", "L", "XL"];

export const variants: MockVariant[] = [];
products.forEach((p) => {
  const colorCount = randInt(2, 4);
  const sizeCount = p.categoryId === "c1" || p.categoryId === "c2" ? randInt(3, 5) : 1;
  for (let c = 0; c < colorCount; c++) {
    for (let s = 0; s < sizeCount; s++) {
      const color = colors[c];
      const size = sizeCount > 1 ? sizes[s] : undefined;
      variants.push({
        id: `v-${p.id}-${c}-${s}`,
        productId: p.id,
        color,
        size,
        label: size ? `${color} / ${size}` : color,
      });
    }
  }
});

export const warehouses: MockWarehouse[] = [
  { id: "w1", name: "North Hub", city: "Berlin" },
  { id: "w2", name: "South Hub", city: "Lisbon" },
  { id: "w3", name: "East Hub", city: "Warsaw" },
];

export const warehouseStock: MockWarehouseStock[] = [];
variants.forEach((v) => {
  warehouses.forEach((w) => {
    if (rand() > 0.25) {
      const qty = randInt(0, 120);
      warehouseStock.push({
        variantId: v.id,
        warehouseId: w.id,
        quantity: qty,
        reservedQuantity: Math.min(qty, randInt(0, 15)),
      });
    }
  });
});

// ---------- Orders (trailing 30 days) ----------
const DAYS = 30;
const today = new Date();
today.setHours(0, 0, 0, 0);

function dateNDaysAgo(n: number): Date {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
}

export const orderItems: MockOrderItem[] = [];
let oid = 0;
for (let d = DAYS - 1; d >= 0; d--) {
  const dayDate = dateNDaysAgo(d).toISOString().slice(0, 10);
  const ordersToday = randInt(15, 45);
  for (let i = 0; i < ordersToday; i++) {
    const itemsInOrder = randInt(1, 3);
    const orderId = `o-${oid++}`;
    const status: OrderStatus = rand() > 0.85 ? (rand() > 0.5 ? "PENDING" : "CANCELLED") : rand() > 0.4 ? "DELIVERED" : "COMPLETED";
    for (let j = 0; j < itemsInOrder; j++) {
      const v = pick(variants);
      orderItems.push({
        id: `oi-${oid}-${j}`,
        orderId,
        productId: v.productId,
        variantId: v.id,
        quantity: randInt(1, 3),
        status,
        date: dayDate,
      });
    }
  }
}

// ---------- Returns ----------
const damageReasons: DamageReason[] = ["DAMAGED_IN_TRANSIT", "WRONG_ITEM", "DEFECTIVE", "CUSTOMER_CHANGED_MIND", "SIZE_ISSUE"];
export const returns: MockOrderItemReturn[] = [];
orderItems
  .filter((oi) => oi.status === "COMPLETED" || oi.status === "DELIVERED")
  .forEach((oi) => {
    if (rand() < 0.07) {
      returns.push({
        id: `r-${oi.id}`,
        orderItemId: oi.id,
        variantId: oi.variantId,
        productId: oi.productId,
        quantity: Math.max(1, Math.floor(oi.quantity * (rand() > 0.5 ? 1 : 0.5))),
        damageReason: pick(damageReasons),
        restocked: rand() > 0.4,
        date: oi.date,
      });
    }
  });

// ---------- Engagement ----------
export const reactions: MockReaction[] = [];
export const comments: MockComment[] = [];
products.forEach((p) => {
  const reactCount = randInt(20, 400);
  const commentCount = randInt(5, 80);
  for (let i = 0; i < reactCount; i++) {
    reactions.push({ id: `re-${p.id}-${i}`, productId: p.id, type: pick(["LIKE", "LOVE", "INTERESTED"] as const), date: dateNDaysAgo(randInt(0, DAYS - 1)).toISOString().slice(0, 10) });
  }
  for (let i = 0; i < commentCount; i++) {
    comments.push({ id: `cm-${p.id}-${i}`, productId: p.id, date: dateNDaysAgo(randInt(0, DAYS - 1)).toISOString().slice(0, 10) });
  }
});

// ==========================================================
// Compiler functions — pure aggregations for UI consumption
// ==========================================================

const isFulfilled = (s: OrderStatus) => s === "COMPLETED" || s === "DELIVERED";

export function getOverviewKPIs() {
  const fulfilled = orderItems.filter((oi) => isFulfilled(oi.status));
  const totalUnitsSold = fulfilled.reduce((sum, oi) => sum + oi.quantity, 0);
  const completedOrders = new Set(fulfilled.map((oi) => oi.orderId)).size;
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const activeVariants = variants.filter((v) => products.find((p) => p.id === v.productId)?.status === "ACTIVE").length;

  // Out-of-stock / low-stock
  const variantAvailability = new Map<string, number>();
  warehouseStock.forEach((s) => {
    const avail = s.quantity - s.reservedQuantity;
    variantAvailability.set(s.variantId, (variantAvailability.get(s.variantId) ?? 0) + avail);
  });
  let outOfStockProducts = 0;
  products.forEach((p) => {
    const pVars = variants.filter((v) => v.productId === p.id);
    const allOut = pVars.every((v) => (variantAvailability.get(v.id) ?? 0) <= 0);
    if (allOut) outOfStockProducts++;
  });
  let lowStockVariants = 0;
  variants.forEach((v) => {
    const a = variantAvailability.get(v.id) ?? 0;
    if (a > 0 && a < 10) lowStockVariants++;
  });

  const totalReturned = returns.reduce((s, r) => s + r.quantity, 0);
  const avgReturnRate = totalUnitsSold > 0 ? totalReturned / totalUnitsSold : 0;
  const totalEngagements = reactions.length + comments.length;

  return {
    totalUnitsSold,
    completedOrders,
    activeProducts,
    activeVariants,
    outOfStockProducts,
    lowStockVariants,
    avgReturnRate,
    totalEngagements,
  };
}

export function getUnitsSoldTrend(days = 30) {
  const map = new Map<string, number>();
  for (let d = days - 1; d >= 0; d--) {
    map.set(dateNDaysAgo(d).toISOString().slice(0, 10), 0);
  }
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => {
    if (map.has(oi.date)) map.set(oi.date, (map.get(oi.date) ?? 0) + oi.quantity);
  });
  return Array.from(map.entries()).map(([date, units]) => ({
    date: date.slice(5),
    units,
  }));
}

export function getInventoryAlerts(limit = 8) {
  const avgDaily = new Map<string, number>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => {
    avgDaily.set(oi.variantId, (avgDaily.get(oi.variantId) ?? 0) + oi.quantity);
  });

  const alerts = variants.map((v) => {
    const stock = warehouseStock
      .filter((s) => s.variantId === v.id)
      .reduce((sum, s) => sum + (s.quantity - s.reservedQuantity), 0);
    const dailyVel = (avgDaily.get(v.id) ?? 0) / DAYS;
    const daysLeft = dailyVel > 0 ? stock / dailyVel : Infinity;
    const product = products.find((p) => p.id === v.productId)!;
    let severity: "critical" | "high" | "medium" = "medium";
    if (daysLeft < 3) severity = "critical";
    else if (daysLeft < 7) severity = "high";
    return {
      variantId: v.id,
      productName: product.name,
      variantLabel: v.label,
      availableStock: stock,
      avgDailyUnits: +dailyVel.toFixed(2),
      daysRemaining: daysLeft === Infinity ? null : +daysLeft.toFixed(1),
      severity,
    };
  });

  return alerts
    .filter((a) => a.daysRemaining !== null && a.daysRemaining < 14 && a.avgDailyUnits > 0)
    .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0))
    .slice(0, limit);
}

export function getTopProducts(limit = 10) {
  const sold = new Map<string, number>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => {
    sold.set(oi.productId, (sold.get(oi.productId) ?? 0) + oi.quantity);
  });
  return Array.from(sold.entries())
    .map(([pid, units]) => {
      const p = products.find((x) => x.id === pid)!;
      const cat = categories.find((c) => c.id === p.categoryId)!;
      return { productId: pid, name: p.name, category: cat.name, units };
    })
    .sort((a, b) => b.units - a.units)
    .slice(0, limit);
}

export function getCategoryShare() {
  const sold = new Map<string, number>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => {
    const p = products.find((x) => x.id === oi.productId)!;
    sold.set(p.categoryId, (sold.get(p.categoryId) ?? 0) + oi.quantity);
  });
  return categories.map((c) => ({ name: c.name, value: sold.get(c.id) ?? 0 }));
}

export function getProductPerformance() {
  const sold = new Map<string, number>();
  const returned = new Map<string, number>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => sold.set(oi.productId, (sold.get(oi.productId) ?? 0) + oi.quantity));
  returns.forEach((r) => returned.set(r.productId, (returned.get(r.productId) ?? 0) + r.quantity));
  return products.map((p) => {
    const u = sold.get(p.id) ?? 0;
    const r = returned.get(p.id) ?? 0;
    return {
      id: p.id,
      name: p.name,
      category: categories.find((c) => c.id === p.categoryId)!.name,
      status: p.status,
      units: u,
      returnRate: u > 0 ? r / u : 0,
    };
  }).sort((a, b) => b.units - a.units);
}

export function getProductStatusDistribution() {
  const map = new Map<string, number>();
  products.forEach((p) => map.set(p.status, (map.get(p.status) ?? 0) + 1));
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function getVariantPerformance(productId?: string) {
  const sold = new Map<string, number>();
  const returned = new Map<string, number>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => sold.set(oi.variantId, (sold.get(oi.variantId) ?? 0) + oi.quantity));
  returns.forEach((r) => returned.set(r.variantId, (returned.get(r.variantId) ?? 0) + r.quantity));
  const list = productId ? variants.filter((v) => v.productId === productId) : variants;
  return list.map((v) => {
    const u = sold.get(v.id) ?? 0;
    const r = returned.get(v.id) ?? 0;
    const stock = warehouseStock.filter((s) => s.variantId === v.id).reduce((sum, s) => sum + (s.quantity - s.reservedQuantity), 0);
    const product = products.find((p) => p.id === v.productId)!;
    return {
      id: v.id,
      productName: product.name,
      label: v.label,
      color: v.color,
      size: v.size,
      units: u,
      stock,
      returnRate: u > 0 ? r / u : 0,
    };
  }).sort((a, b) => b.units - a.units);
}

export function getVariantShareForProduct(productId: string) {
  return getVariantPerformance(productId).map((v) => ({ name: v.label, value: v.units }));
}

export function getEngagementData() {
  const sold = new Map<string, number>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => sold.set(oi.productId, (sold.get(oi.productId) ?? 0) + oi.quantity));
  const rxn = new Map<string, number>();
  reactions.forEach((r) => rxn.set(r.productId, (rxn.get(r.productId) ?? 0) + 1));
  const cmt = new Map<string, number>();
  comments.forEach((c) => cmt.set(c.productId, (cmt.get(c.productId) ?? 0) + 1));
  return products.map((p) => {
    const r = rxn.get(p.id) ?? 0;
    const c = cmt.get(p.id) ?? 0;
    const u = sold.get(p.id) ?? 0;
    return {
      id: p.id,
      name: p.name,
      reactions: r,
      comments: c,
      interactions: r + c,
      units: u,
      gap: r + c - u * 2, // hype index
    };
  }).sort((a, b) => b.interactions - a.interactions);
}

export function getWarehouseDistribution() {
  return warehouses.map((w) => {
    const stocks = warehouseStock.filter((s) => s.warehouseId === w.id);
    const available = stocks.reduce((sum, s) => sum + Math.max(0, s.quantity - s.reservedQuantity), 0);
    const reserved = stocks.reduce((sum, s) => sum + s.reservedQuantity, 0);
    return { name: `${w.name} (${w.city})`, available, reserved };
  });
}

export function getInventoryHealth() {
  return getInventoryAlerts(50);
}

export function getReturnReasons() {
  const map = new Map<DamageReason, number>();
  returns.forEach((r) => map.set(r.damageReason, (map.get(r.damageReason) ?? 0) + r.quantity));
  const labels: Record<DamageReason, string> = {
    DAMAGED_IN_TRANSIT: "Damaged in Transit",
    WRONG_ITEM: "Wrong Item Sent",
    DEFECTIVE: "Defective",
    CUSTOMER_CHANGED_MIND: "Changed Mind",
    SIZE_ISSUE: "Size Issue",
  };
  return Array.from(map.entries()).map(([k, v]) => ({ name: labels[k], value: v }));
}

export function getReturnsKPIs() {
  const totalReturned = returns.reduce((s, r) => s + r.quantity, 0);
  const damaged = returns.filter((r) => !r.restocked).reduce((s, r) => s + r.quantity, 0);
  const restocked = returns.filter((r) => r.restocked).reduce((s, r) => s + r.quantity, 0);
  const totalSold = orderItems.filter((oi) => isFulfilled(oi.status)).reduce((s, o) => s + o.quantity, 0);
  return {
    totalReturned,
    damaged,
    restocked,
    returnRate: totalSold > 0 ? totalReturned / totalSold : 0,
  };
}

export function getProblematicVariants(limit = 15) {
  const sold = new Map<string, number>();
  const returnsByVariant = new Map<string, { qty: number; reasons: Map<DamageReason, number> }>();
  orderItems.filter((oi) => isFulfilled(oi.status)).forEach((oi) => sold.set(oi.variantId, (sold.get(oi.variantId) ?? 0) + oi.quantity));
  returns.forEach((r) => {
    if (!returnsByVariant.has(r.variantId)) returnsByVariant.set(r.variantId, { qty: 0, reasons: new Map() });
    const entry = returnsByVariant.get(r.variantId)!;
    entry.qty += r.quantity;
    entry.reasons.set(r.damageReason, (entry.reasons.get(r.damageReason) ?? 0) + r.quantity);
  });
  const labels: Record<DamageReason, string> = {
    DAMAGED_IN_TRANSIT: "Damaged in Transit",
    WRONG_ITEM: "Wrong Item Sent",
    DEFECTIVE: "Defective",
    CUSTOMER_CHANGED_MIND: "Changed Mind",
    SIZE_ISSUE: "Size Issue",
  };
  return Array.from(returnsByVariant.entries())
    .map(([vid, data]) => {
      const v = variants.find((x) => x.id === vid)!;
      const p = products.find((x) => x.id === v.productId)!;
      const u = sold.get(vid) ?? 0;
      const primary = Array.from(data.reasons.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        variantId: vid,
        productName: p.name,
        label: v.label,
        units: u,
        returned: data.qty,
        rate: u > 0 ? data.qty / u : 0,
        primaryReason: primary ? labels[primary] : "—",
      };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit);
}

export const allProducts = products;
