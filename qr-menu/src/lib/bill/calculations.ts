import type { BillState, PersonSummary } from './types';

export function getSubtotal(state: BillState) {
  return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getTaxAmount(state: BillState, subtotal: number) {
  if (!state.taxEnabled) return 0;
  return (subtotal * Math.max(0, state.taxRate)) / 100;
}

export function getDiscountAmount(state: BillState, subtotal: number) {
  if (!state.discountEnabled) return 0;
  if (state.discountType === 'percent') {
    return Math.min(subtotal, (subtotal * Math.max(0, state.discountValue)) / 100);
  }
  return Math.min(subtotal, Math.max(0, state.discountValue));
}

export function getTotal(state: BillState) {
  const subtotal = getSubtotal(state);
  const tax = getTaxAmount(state, subtotal);
  const discount = getDiscountAmount(state, subtotal);
  return Math.max(0, subtotal + tax - discount);
}

export function buildPersonSummaries(state: BillState): PersonSummary[] {
  const people = Math.max(1, state.peopleCount);
  const subtotals = Array.from({ length: people }, () => 0);

  state.cart.forEach((item) => {
    const assignments = state.smartAssignments[item.id] ?? Array.from({ length: people }, () => 0);
    assignments.forEach((qty, idx) => {
      subtotals[idx] += Math.max(0, qty) * item.price;
    });
  });

  const subtotalAll = subtotals.reduce((a, b) => a + b, 0);
  const taxAll = getTaxAmount(state, subtotalAll);
  const discountAll = getDiscountAmount(state, subtotalAll);

  return subtotals.map((subtotal) => {
    const share = subtotalAll > 0 ? subtotal / subtotalAll : 0;
    const taxShare = taxAll * share;
    const discountShare = discountAll * share;

    return {
      subtotal,
      taxShare,
      discountShare,
      total: Math.max(0, subtotal + taxShare - discountShare)
    };
  });
}
