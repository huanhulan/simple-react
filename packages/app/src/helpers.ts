export function pluralize(count: number, word: string) {
  return count === 1 ? word : `${word}s`;
}

export function storage(namespace: string, data?: any) {
  if (data) {
    localStorage[namespace] = JSON.stringify(data);
    return data;
  }

  const record = localStorage[namespace];
  return (record && JSON.parse(record)) || [];
}
