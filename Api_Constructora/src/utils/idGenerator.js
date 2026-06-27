const generateStringId = (prefix = '') => {
  const r = Math.random().toString(36).substring(2, 8);
  return `${prefix}${Date.now().toString().slice(-6)}${r}`;
};

const generateNumericId = (arr, idField = 'id') => {

  if (!Array.isArray(arr) || arr.length === 0) return 1;
  const max = arr.reduce((m, it) => {
    const val = Number(it[idField]) || 0;
    return val > m ? val : m;
  }, 0);
  return max + 1;
};

module.exports = {
  generateStringId,
  generateNumericId
};