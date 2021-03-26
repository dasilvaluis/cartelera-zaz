/**
 * Iteraste recursively over an array, applying a callback using async/await
 *
 * @param {Array} aff
 * @param {Function} callback
 * @param {*} acc
 */
export async function iterateRecursiveAsync(arr, callback, acc) {
  const [firstItem] = arr;

  if (typeof firstItem === 'undefined') {
    return acc;
  }

  const resultAccomulated = await callback(acc, firstItem);

  return iterateRecursiveAsync(arr.slice(1), callback, resultAccomulated);
}
