import { useEffect, useMemo, useState } from 'react';
import type { BillCartItem, BillState } from './types';

const STORAGE_KEY = 'qr-menu-bill-state';

const defaultState: BillState = {
  cart: [],
  taxEnabled: false,
  taxRate: 0,
  discountEnabled: false,
  discountType: 'percent',
  discountValue: 0,
  peopleCount: 1,
  smartAssignments: {}
};

function normalizeAssignments(state: BillState): BillState {
  const people = Math.max(1, state.peopleCount);
  const smartAssignments = { ...state.smartAssignments };

  state.cart.forEach((item) => {
    const existing = smartAssignments[item.id] ?? [];
    const next = Array.from({ length: people }, (_, i) => Math.max(0, Math.floor(existing[i] ?? 0)));
    const assigned = next.reduce((a, b) => a + b, 0);

    if (assigned > item.quantity) {
      let extra = assigned - item.quantity;
      for (let i = next.length - 1; i >= 0 && extra > 0; i -= 1) {
        const take = Math.min(next[i], extra);
        next[i] -= take;
        extra -= take;
      }
    }

    smartAssignments[item.id] = next;
  });

  Object.keys(smartAssignments).forEach((itemId) => {
    if (!state.cart.find((item) => item.id === itemId)) {
      delete smartAssignments[itemId];
    }
  });

  return { ...state, peopleCount: people, smartAssignments };
}

export function useBill() {
  const [state, setState] = useState<BillState>(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    try {
      const parsed = JSON.parse(raw) as BillState;
      return normalizeAssignments({ ...defaultState, ...parsed });
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function setPeopleCount(value: number) {
    setState((prev) => normalizeAssignments({ ...prev, peopleCount: Math.max(1, Math.floor(value || 1)) }));
  }

  function addItem(item: Omit<BillCartItem, 'quantity'>) {
    setState((prev) => {
      const existing = prev.cart.find((it) => it.id === item.id);
      const nextCart = existing
        ? prev.cart.map((it) => (it.id === item.id ? { ...it, quantity: it.quantity + 1 } : it))
        : [...prev.cart, { ...item, quantity: 1 }];

      return normalizeAssignments({ ...prev, cart: nextCart });
    });
  }

  function changeQty(itemId: string, delta: number) {
    setState((prev) => {
      const nextCart = prev.cart
        .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0);

      return normalizeAssignments({ ...prev, cart: nextCart });
    });
  }

  function removeItem(itemId: string) {
    setState((prev) => normalizeAssignments({ ...prev, cart: prev.cart.filter((item) => item.id !== itemId) }));
  }

  function assignQty(itemId: string, personIndex: number, delta: number) {
    setState((prev) => {
      const item = prev.cart.find((it) => it.id === itemId);
      if (!item) return prev;

      const people = Math.max(1, prev.peopleCount);
      const row = [...(prev.smartAssignments[itemId] ?? Array.from({ length: people }, () => 0))];
      while (row.length < people) row.push(0);

      const assigned = row.reduce((a, b) => a + b, 0);

      if (delta > 0 && assigned >= item.quantity) return prev;

      row[personIndex] = Math.max(0, (row[personIndex] ?? 0) + delta);

      return normalizeAssignments({
        ...prev,
        smartAssignments: {
          ...prev.smartAssignments,
          [itemId]: row
        }
      });
    });
  }

  function resetBill() {
    setState(defaultState);
  }

  const itemCount = useMemo(() => state.cart.reduce((sum, item) => sum + item.quantity, 0), [state.cart]);

  return {
    state,
    setState,
    addItem,
    changeQty,
    removeItem,
    assignQty,
    setPeopleCount,
    resetBill,
    itemCount
  };
}
