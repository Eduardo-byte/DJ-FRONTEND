// Money utilities for handling currency formatting and calculations

export const formatCurrency = (cents, currency = 'USD') => {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(dollars);
};

export const centsTodollars = (cents) => {
  return cents / 100;
};

export const dollarsToCents = (dollars) => {
  return Math.round(dollars * 100);
};

export const calculateTotal = (amount, tip = 0) => {
  return amount + tip;
};

export const formatMoney = (cents) => {
  const dollars = centsTodollars(cents);
  return dollars.toFixed(2);
};

// Validate money amount
export const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount > 0 && Number.isFinite(amount);
};
