import { sum, avg, count, min, max, first, last, countBy, mean, quantile, variance, median, stdev } from './array/stats';
import { Selector, Predicate, ParsingOptions, FieldDescription, PrimitiveType, TableDto, DataTypeName } from './types';
import { parseCsv, fromTable, toTable, getFieldDescriptions } from './utils';
import { leftJoin, innerJoin, fullJoin, merge, groupBy, flatten, sort, pivot, transpose } from './array';


export class DataPipe {
  private data: any[];

  constructor(data: any[] = []) {
    this.data = data;
  }

  /**
   * Get pipes currrent array data.
   */
  toArray(): any[] {
    return this.data;
  }

  /**
   * Sum of items in array.
   * @param elementSelector Function invoked per iteration.
   * @example
   * dataPipe([1, 2, 5]).sum(); // 8
   *
   * dataPipe([{ val: 1 }, { val: 5 }]).sum(i => i.val); // 6
   */
  sum(elementSelector?: Selector): number | null {
    return sum(this.data, elementSelector);
  }

  /**
   * Select data from array item.
   * @param elementSelector Function invoked per iteration.
   * @example
   *
   * dataPipe([{ val: 1 }, { val: 5 }]).select(i => i.val).toArray(); // [1, 5]
   */
  select(elementSelector: Selector): DataPipe {
    this.data = this.data.map(elementSelector);
    return this;
  }

  map = this.select.bind(this);

  /**
   * Average of array items.
   * @param elementSelector Function invoked per iteration.
   * @example
   * dataPipe([1, 5, 3]).avg(); // 3
   */
  avg(elementSelector?: Selector): number | null {
    return avg(this.data, elementSelector);
  }

  average = this.avg.bind(this);

  /**
   * Count of elements in array.
   * @param predicate Predicate function invoked per iteration.
   */
  count(predicate?: Predicate): number | null {
    return count(this.data, predicate);
  }

  /**
   * Computes the minimum value of array.
   * @param elementSelector Function invoked per iteration.
   */
  min(elementSelector?: Selector): number | Date | null {
    return min(this.data, elementSelector);
  }

  /**
   * Computes the maximum value of array.
   * @param elementSelector Function invoked per iteration.
   */
  max(elementSelector?: Selector): number | Date | null {
    return max(this.data, elementSelector);
  }

  /**
   * Gets first item in array satisfies predicate.
   * @param predicate Predicate function invoked per iteration.
   */
  first(predicate?: Predicate): any | undefined {
    return first(this.data, predicate);
  }

  /**
   * Gets last item in array satisfies predicate.
   * @param array The array to process.
   * @param predicate Predicate function invoked per iteration.
   */
  last(predicate?: Predicate): any | undefined {
    return last(this.data, predicate);
  }

  /**
   * Groups array items based on elementSelector function
   * @param elementSelector Function invoked per iteration.
   */
  groupBy(elementSelector: Selector): DataPipe {
    this.data = groupBy(this.data, elementSelector);
    return this;
  }

  /**
   * Flattens array.
   * @example
   * dataPipe([1, 4, [2, [5, 5, [9, 7]], 11], 0]).flatten(); // length 9
   */
  flatten(): any[] {
    return flatten(this.data);
  }

  /**
   * Gets counts map of values returned by `elementSelector`.
   * @param elementSelector Function invoked per iteration.
   */
  countBy(elementSelector: Selector): { [key: string]: number } | null {
    return countBy(this.data, elementSelector);
  }

  /**
   * Joins two arrays together by selecting elements that have matching values in both arrays
   * @param rightArray array of elements to join
   * @param leftKey left Key
   * @param rightKey
   * @param resultSelector
   */
  innerJoin(rightArray: any[],
    leftKey: string | string[] | Selector<any, string>,
    rightKey: string | string[] | Selector<any, string>,
    resultSelector: (leftItem: any, rightItem: any) => any
  ): DataPipe {
    this.data = innerJoin(this.data, rightArray, leftKey, rightKey, resultSelector);
    return this;
  }

  leftJoin(rightArray: any[],
    leftKey: string | string[] | Selector<any, string>,
    rightKey: string | string[] | Selector<any, string>,
    resultSelector: (leftItem: any, rightItem: any) => any
  ): DataPipe {

    this.data = leftJoin(this.data, rightArray, leftKey, rightKey, resultSelector);
    return this;
  }

  fullJoin(rightArray: any[],
    leftKey: string | string[] | Selector<any, string>,
    rightKey: string | string[] | Selector<any, string>,
    resultSelector: (leftItem: any, rightItem: any) => any
  ): DataPipe {
    this.data = fullJoin(this.data, rightArray, leftKey, rightKey, resultSelector);
    return this;
  }

  merge(
    sourceArray: any[],
    targetKey: string | string[] | Selector<any, string>,
    sourceKey: string | string[] | Selector<any, string>
  ): DataPipe {
    this.data = merge(this.data, sourceArray, targetKey, sourceKey);
    return this;
  }

  pivot(rowFields: string | string[], columnField: string, dataField: string,
    aggFunction?: (array: any[]) => any | null, columnValues?: string[]): DataPipe {

    this.data = pivot(this.data, rowFields, columnField, dataField, aggFunction, columnValues)
    return this;
  }

  transpose(): DataPipe {
    this.data = transpose(this.data) || [];
    return this;
  }

  /**
   * Filters array of items.
   * @param predicate Predicate function invoked per iteration.
   */
  where(predicate: Predicate): DataPipe {
    this.data = this.data.filter(predicate);
    return this;
  }

  filter = this.where.bind(this);

  fromCsv(content: string, options?: ParsingOptions): DataPipe {
    this.data = parseCsv(content, options);
    return this;
  }

  /**
   * Get JSON type array for tabel type array.
   * @param rows Table data. Array of values array.
   * @param fieldNames Column names or autogenerated
   */
  fromTable(rowsOrTable: PrimitiveType[][] | TableDto, fieldNames?: string[],
    fieldDataTypes?: DataTypeName[]): DataPipe {
    this.data = fromTable(rowsOrTable, fieldNames, fieldDataTypes);
    return this;
  }

  /**
   * Gets table data from JSON type array.
   */
  toTable(): TableDto {
    return toTable(this.data);
  }

  /**
   * Get unique values
   * @param elementSelector Function invoked per iteration.
   */
  unique(elementSelector?: Selector): DataPipe {
    if (elementSelector) {
      this.select(elementSelector);
    }
    this.data = Array.from(new Set(this.data));
    return this;
  }

  /**
   * Sort array.
   * @param fields sorts order.
   * @example
   * dp.sort('name ASC', 'age DESC');
   */
  sort(...fields: string[]): DataPipe {
    sort(this.data, ...fields);
    return this
  }

  /**
   * Get mean.
   * @param field Property name or Selector function invoked per iteration.
   */
  mean(field?: Selector | string): number | null {
    return mean(this.data, field);
  }

  /**
   * Get quantile of a sorted array.
   * @param field Property name or Selector function invoked per iteration.
   * @param p quantile.
   */
  quantile(p: number, field?: Selector | string): number | null {
    return quantile(this.data, p, field);
  }

  /**
   * Get variance.
   * @param field Property name or Selector function invoked per iteration.
   */
  variance(field?: Selector | string): number | null {
    return variance(this.data, field);
  }

  /**
   * Get the standard deviation.
   * @param field Property name or Selector function invoked per iteration.
   */
  stdev(field?: Selector | string): number | null {
    return stdev(this.data, field);
  }

  /**
   * Get median.
   * @param field Property name or Selector function invoked per iteration.
   */
  median(field?: Selector | string): number | null {
    return median(this.data, field);
  }

  getFieldDescriptions(): FieldDescription[] {
    return getFieldDescriptions(this.data)
  }

}
