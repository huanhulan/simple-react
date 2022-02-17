export function swap<T>(list: Array<T>, l: number, r: number) {
  const k = list[l];
  list[l] = list[r];
  list[r] = k;
}
