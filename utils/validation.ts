export const validateAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validatePin = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};

export const sanitizeAmount = (amount: string): number => {
  return parseFloat(amount.replace(/[^\d.-]/g, '')) || 0;
};