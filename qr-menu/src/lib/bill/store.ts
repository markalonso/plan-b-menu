import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'qr-menu-local-bill';
const STORAGE_VERSION = 2;
export const FIXED_VAT_PERCENT = 14;

type StoredBill = {
  version: number;
  data: BillState;
};

export type BillItem = {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  qty: number;
};

export type DiscountType = 'percent' | 'fixed';
export type SplitMode = 'none' | 'equal' | 'smart';

export type SmartSplitPerson = {
  personId: string;
  items: Array<{ itemId: string; qty: number }>;
};

export type BillState = {
  items: BillItem[];
  taxEnabled: boolean;
  discountEnabled: boolean;
  discountType: DiscountType;
  discountValue: number;
  splitMode: SplitMode;
  peopleCount: number;
  smartSplit: SmartSplitPerson[];
};

const defaultState: BillState = {
  items: [],
  taxEnabled: false,
  discountEnabled: false,
  discountType: 'percent',
  discountValue: 0,
  splitMode: 'none',
  peopleCount: 2,
  smartSplit: []
};

function clampNumber(value: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function normalizeSmartSplit(state: BillState): BillState {
  const peopleCount = clampNumber(Math.floor(state.peopleCount || 1), 1, 20);
  const personIds = Array.from({ length: peopleCount }, (_, idx) => String(idx + 1));

  const nextSmartSplit: SmartSplitPerson[] = personIds.map((personId) => {
    const existing = state.smartSplit.find((person) => person.personId === personId);
    const normalizedItems = state.items
      .map((item) => {
        const qty = clampNumber(Math.floor(existing?.items.find((entry) => entry.itemId === item.id)?.qty ?? 0));
        return { itemId: item.id, qty };
      })
      .filter((entry) => entry.qty > 0);

    return { personId, items: normalizedItems };
  });

  const qtyByItem = new Map<string, number>();
  nextSmartSplit.forEach((person) => {
    person.items.forEach((entry) => {
      qtyByItem.set(entry.itemId, (qtyByItem.get(entry.itemId) ?? 0) + entry.qty);
    });
  });

  state.items.forEach((item) => {
    const assigned = qtyByItem.get(item.id) ?? 0;
    if (assigned <= item.qty) return;

    let extra = assigned - item.qty;
    for (let i = nextSmartSplit.length - 1; i >= 0 && extra > 0; i -= 1) {
      const person = nextSmartSplit[i];
      const itemEntry = person.items.find((entry) => entry.itemId === item.id);
      if (!itemEntry) continue;
      const deduction = Math.min(itemEntry.qty, extra);
      itemEntry.qty -= deduction;
      extra -= deduction;
    }

    nextSmartSplit.forEach((person) => {
      person.items = person.items.filter((entry) => entry.qty > 0);
    });
  });

  return {
    ...state,
    discountValue: clampNumber(state.discountValue),
    peopleCount,
    smartSplit: nextSmartSplit,
    splitMode: state.splitMode
  };
}

function loadState(): BillState {
  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<StoredBill | BillState>;

    if ('version' in parsed && parsed.version === STORAGE_VERSION && parsed.data) {
      return normalizeSmartSplit({ ...defaultState, ...parsed.data, items: parsed.data.items ?? defaultState.items, smartSplit: parsed.data.smartSplit ?? defaultState.smartSplit });
    }

    return normalizeSmartSplit({ ...defaultState, ...(parsed as Partial<BillState>), items: (parsed as Partial<BillState>).items ?? defaultState.items, smartSplit: (parsed as Partial<BillState>).smartSplit ?? defaultState.smartSplit });
  } catch {
    return defaultState;
  }
}

let state: BillState = loadState();
const listeners = new Set<() => void>();

function emit(nextState: BillState) {
  state = normalizeSmartSplit(nextState);
  if (typeof window !== 'undefined') {
    try {
      const payload: StoredBill = { version: STORAGE_VERSION, data: state };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore write errors from private mode / storage limits
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState() {
  return state;
}

export function useBillStore() {
  return useSyncExternalStore(subscribe, getState, () => defaultState);
}

export const billActions = {
  addItem(item: Omit<BillItem, 'qty'>, quantity = 1) {
    const normalizedQuantity = clampNumber(Math.floor(quantity), 1);
    const existing = state.items.find((entry) => entry.id === item.id);
    const items = existing
      ? state.items.map((entry) => (entry.id === item.id ? { ...entry, qty: entry.qty + normalizedQuantity } : entry))
      : [...state.items, { ...item, qty: normalizedQuantity }];

    emit({ ...state, items });
  },
  changeQty(itemId: string, delta: number) {
    const items = state.items
      .map((entry) => (entry.id === itemId ? { ...entry, qty: clampNumber(entry.qty + delta) } : entry))
      .filter((entry) => entry.qty > 0);

    emit({ ...state, items });
  },
  removeItem(itemId: string) {
    emit({ ...state, items: state.items.filter((entry) => entry.id !== itemId) });
  },
  setTaxEnabled(enabled: boolean) {
    emit({ ...state, taxEnabled: enabled });
  },
  setDiscountEnabled(enabled: boolean) {
    emit({ ...state, discountEnabled: enabled });
  },
  setDiscountType(value: DiscountType) {
    emit({ ...state, discountType: value });
  },
  setDiscountValue(value: number) {
    emit({ ...state, discountValue: clampNumber(value) });
  },
  setSplitMode(value: SplitMode) {
    emit({ ...state, splitMode: value });
  },
  setPeopleCount(value: number) {
    emit({ ...state, peopleCount: clampNumber(Math.floor(value || 1), 1, 20) });
  },
  assignItem(personId: string, itemId: string, delta: number) {
    const targetItem = state.items.find((item) => item.id === itemId);
    if (!targetItem) return;

    const people = Array.from({ length: Math.max(1, state.peopleCount) }, (_, idx) => String(idx + 1));
    const smartSplit = people.map((id) => {
      const existing = state.smartSplit.find((person) => person.personId === id);
      return { personId: id, items: [...(existing?.items ?? [])] };
    });

    const assignedTotal = smartSplit.reduce((total, person) => total + (person.items.find((entry) => entry.itemId === itemId)?.qty ?? 0), 0);
    const person = smartSplit.find((entry) => entry.personId === personId);
    if (!person) return;

    const currentQty = person.items.find((entry) => entry.itemId === itemId)?.qty ?? 0;
    if (delta > 0 && assignedTotal >= targetItem.qty) return;

    const nextQty = clampNumber(currentQty + delta);
    person.items = person.items.filter((entry) => entry.itemId !== itemId);
    if (nextQty > 0) person.items.push({ itemId, qty: nextQty });

    emit({ ...state, smartSplit });
  },
  reset() {
    emit(defaultState);
  }
};

export function getItemCount(billState: BillState) {
  return billState.items.reduce((sum, item) => sum + item.qty, 0);
}

export function getSubtotal(billState: BillState) {
  return billState.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getTaxAmount(billState: BillState, subtotal: number) {
  if (!billState.taxEnabled) return 0;
  return (subtotal * FIXED_VAT_PERCENT) / 100;
}

export function getDiscountAmount(billState: BillState, subtotal: number) {
  if (!billState.discountEnabled) return 0;
  if (billState.discountType === 'percent') {
    return Math.min(subtotal, (subtotal * clampNumber(billState.discountValue)) / 100);
  }
  return Math.min(subtotal, clampNumber(billState.discountValue));
}

export function getTotal(billState: BillState) {
  const subtotal = getSubtotal(billState);
  return Math.max(0, subtotal + getTaxAmount(billState, subtotal) - getDiscountAmount(billState, subtotal));
}

export function getSmartPersonSummary(billState: BillState, personId: string) {
  const person = billState.smartSplit.find((entry) => entry.personId === personId);
  const subtotal = (person?.items ?? []).reduce((sum, entry) => {
    const item = billState.items.find((billItem) => billItem.id === entry.itemId);
    return sum + (item?.price ?? 0) * entry.qty;
  }, 0);

  const overallSubtotal = getSubtotal(billState);
  if (overallSubtotal <= 0) {
    return { subtotal: 0, taxShare: 0, discountShare: 0, total: 0 };
  }

  const ratio = subtotal / overallSubtotal;
  const taxShare = getTaxAmount(billState, overallSubtotal) * ratio;
  const discountShare = getDiscountAmount(billState, overallSubtotal) * ratio;

  return {
    subtotal,
    taxShare,
    discountShare,
    total: Math.max(0, subtotal + taxShare - discountShare)
  };
}
