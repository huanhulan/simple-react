import { swap } from './swap';

export class Heap<T> {
  array: T[] = [];

  private set = new Set<T>();

  private compare: (lowIdx: number, highIdx: number) => number;

  comparator: (l: T, r: T) => number;

  constructor(comparator: (l: T, r: T) => number) {
    this.comparator = comparator;
    this.compare = (i1, i2) => {
      const value = comparator(this.array[i1], this.array[i2]);
      if (Number.isNaN(value)) {
        throw new Error(
          `Comparator should evaluate to a number. Got ${value} when comparing ${i1} with ${i2}`,
        );
      }
      return value;
    };
  }

  /**
   * @runtime O(n): (0 * n/2) + (1 * n/4) + (2 * n/8) + ... + (h * 1).
   */
  static heapify<T>(arr: T[], comparator: (l: T, r: T) => number) {
    const heap = new Heap<T>(comparator);
    heap.array = arr;
    for (let i = Math.floor(arr.length / 2); i > -1; i -= 1) {
      heap.bubbleDown(i);
    }
    return arr;
  }

  /**
   * Retrieves, but does not remove, the head of this heap
   * @runtime O(1)
   */
  get peek() {
    return this.array[0];
  }

  /**
   * Returns the number of elements in this collection.
   * @runtime O(1)
   */
  get size() {
    return this.array.length;
  }

  /**
   * Insert element
   * @runtime O(log n)
   * @param {any} value
   */
  add(value: T) {
    if (this.set.has(value)) {
      return;
    }
    this.set.add(value);
    this.array.push(value);
    this.bubbleUp();
  }

  /**
   * Retrieves and removes the head of this heap, or returns null if this heap is empty.
   * @runtime O(log n)
   */
  remove(index = 0) {
    if (!this.size) {
      return null;
    }
    swap(this.array, index, this.size - 1); // swap with last
    const value = this.array.pop(); // remove element
    this.bubbleDown(index);
    this.set.delete(value as T);
    return value;
  }

  /**
   * Move new element upwards on the heap, if it's out of order
   * @runtime O(log n)
   */
  bubbleUp() {
    let index = this.size - 1;
    while (
      Heap.parent(index) >= 0 &&
      this.compare(Heap.parent(index), index) > 0
    ) {
      const parentIndex = Heap.parent(index);
      swap(this.array, parentIndex, index);
      index = parentIndex;
    }
  }

  /**
   * After removal, moves element downwards on the heap, if it's out of order
   * @runtime O(log n)
   */
  bubbleDown(index = 0) {
    let curr = index;
    while (
      Heap.left(curr) < this.size &&
      this.compare(curr, this.getTopChild(curr)) > 0
    ) {
      const next = this.getTopChild(curr);
      swap(this.array, curr, next);
      curr = next;
    }
  }

  reset() {
    this.array = [];
    this.set.clear();
  }

  private getTopChild(i: number) {
    const leftIndex = Heap.left(i);
    const rightIndex = Heap.right(i);
    if (rightIndex < this.size && this.compare(leftIndex, rightIndex) > 0) {
      return rightIndex;
    }

    return leftIndex;
  }

  private static parent(i: number) {
    return Math.floor((i - 1) / 2);
  }

  private static left(i: number) {
    return 2 * i + 1;
  }

  private static right(i: number) {
    return 2 * i + 2;
  }
}
