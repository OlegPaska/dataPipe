import * as pipeFuncs from '../array'
import { leftJoin, pivot, avg, sum, quantile, mean, variance, stdev, median } from '../array';

export const data = [
  { name: "John", country: "US" }, { name: "Joe", country: "US" }, { name: "Bill", country: "US" }, { name: "Adam", country: "UK" },
  { name: "Scott", country: "UK" }, { name: "Diana", country: "UK" }, { name: "Marry", country: "FR" }, { name: "Luc", country: "FR" }
]

describe('Test array methods', () => {

  const testNumberArray = [2, 6, 3, 7, 11, 7, -1];
  const testNumberArraySum = 35;
  const testNumberArrayAvg = 5;

  const testAnyPrimitiveArray = ['5', 2, '33', false, true, true, true];
  const testAnyPrimitiveArraySum = 43;
  const testAnyPrimitiveArrayAvg = 6.14;
  const testAnyPrimitiveArrayMin = 0;
  const testAnyPrimitiveArrayMax = 33;

  const testObjArray = testNumberArray.map(value => ({ value }));
  const dates = [new Date('10/01/12'), new Date('10/01/10'), new Date('10/01/09'), new Date('10/01/11')]

  it('count', () => {
    expect(pipeFuncs.count(testNumberArray)).toBe(testNumberArray.length);
    expect(pipeFuncs.count(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArray.length);
    expect(pipeFuncs.count(testObjArray)).toBe(testObjArray.length);
    expect(pipeFuncs.count(data, i => i.country === 'US')).toBe(3);
  })

  it('sum', () => {
    expect(pipeFuncs.sum(testNumberArray)).toBe(testNumberArraySum);
    expect(pipeFuncs.sum(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArraySum);
    expect(pipeFuncs.sum(testObjArray, obj => obj.value)).toBe(testNumberArraySum);
  })

  it('avg', () => {
    expect(pipeFuncs.avg(testNumberArray)).toBe(testNumberArrayAvg);
    expect(pipeFuncs.avg(testObjArray, obj => obj.value)).toBe(testNumberArrayAvg);

    const avg = pipeFuncs.avg(testAnyPrimitiveArray);
    if (avg) {
      expect(Math.round(avg * 100) / 100).toBe(testAnyPrimitiveArrayAvg);
    } else {
      throw Error('testAnyPrimitiveArray failed');
    }
  })

  it('min', () => {
    expect(pipeFuncs.min(testNumberArray)).toBe(Math.min(...testNumberArray));
    expect(pipeFuncs.min(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArrayMin);
    expect(pipeFuncs.min(testObjArray, obj => obj.value)).toBe(Math.min(...testNumberArray));
    const mindate = pipeFuncs.min(dates);
    expect(mindate).toBeInstanceOf(Date);
    if (mindate instanceof Date) {
      expect(mindate.getFullYear()).toBe(2009)
    }
  })

  it('max', () => {
    expect(pipeFuncs.max(testNumberArray)).toBe(Math.max(...testNumberArray));
    expect(pipeFuncs.max(testAnyPrimitiveArray)).toBe(testAnyPrimitiveArrayMax);
    expect(pipeFuncs.max(testObjArray, obj => obj.value)).toBe(Math.max(...testNumberArray));
    const maxdate = pipeFuncs.max(dates);
    expect(maxdate).toBeInstanceOf(Date);
    if (maxdate instanceof Date) {
      expect(maxdate.getFullYear()).toBe(2012)
    }
  })

  it('first', () => {
    expect(pipeFuncs.first(testNumberArray)).toBe(testNumberArray[0]);
    expect(pipeFuncs.first(testNumberArray, v => v > 6)).toBe(7);
  })

  it('last', () => {
    const last = pipeFuncs.last(data, item => item.country === 'UK');
    if (last) {
      expect(last.name).toBe('Diana');
    } else {
      throw Error('Not found');
    }
  })

  it('groupBy', () => {
    const groups = pipeFuncs.groupBy(data, item => item.country);
    expect(groups.length).toBe(3);
  })

  it('flatten', () => {
    const testArray = [1, 4, [2, [5, 5, [9, 7]], 11], 0, [], []];
    const flatten = pipeFuncs.flatten(testArray);
    expect(flatten.length).toBe(9);

    const testArray2 = [testArray, [data], [], [testAnyPrimitiveArray]];
    const flatten2 = pipeFuncs.flatten(testArray2);
    expect(flatten2.length).toBe(9 + data.length + testAnyPrimitiveArray.length);
  })

  it('countBy', () => {
    const countriesCount = pipeFuncs.countBy(data, i => i.country);
    expect(countriesCount['US']).toBe(3);
    expect(countriesCount['UK']).toBe(3);
    expect(countriesCount['FR']).toBe(2);
  });

  it('joinArray', () => {
    const countries = [{ code: 'US', capital: 'Washington' }, { code: 'UK', capital: 'London' }];
    const joinedArray = leftJoin(data, countries, i => i.country, i2 => i2.code, (l, r) => ({ ...r, ...l }));
    expect(joinedArray.length).toBe(8);
    const item = pipeFuncs.first(joinedArray, i => i.country === 'US');
    expect(item.country).toBe('US');
    expect(item.code).toBe('US');
    expect(item.capital).toBe('Washington');
    expect(item.name).toBeTruthy();
  })

  it('simple pivot', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
    ];

    const res = pivot(arr, 'product', 'year', 'sale')
    expect(res.length).toBe(2);
    expect(res.filter(r => r.product === 'P1')[0]['2018']).toBe(11);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
  })

  it('pivot with default sum', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
    ];

    const res = pivot(arr, 'product', 'year', 'sale')
    expect(res.length).toBe(2);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(34);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
  })

  it('pivot with specified AVG', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
    ];

    const res = pivot(arr, 'product', 'year', 'sale', avg)
    expect(res.length).toBe(2);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(17);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
  })


  it('pivot with null value', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
      { product: 'P3', year: '2019', sale: '33' },
    ];

    const res = pivot(arr, 'product', 'year', 'sale', avg)
    expect(res.length).toBe(3);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(17);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
    expect(res.filter(r => r.product === 'P3')[0]['2019']).toBe(33);
    expect(res.filter(r => r.product === 'P3')[0]['2018']).toBe(null);
  })

  it('pivot with null value with sum', () => {
    const arr = [
      { product: 'P1', year: '2018', sale: '11' },
      { product: 'P1', year: '2019', sale: '12' },
      { product: 'P1', year: '2019', sale: '22' },
      { product: 'P2', year: '2018', sale: '21' },
      { product: 'P2', year: '2019', sale: '22' },
      { product: 'P3', year: '2019', sale: '33' },
    ];

    const res = pivot(arr, 'product', 'year', 'sale', sum)
    expect(res.length).toBe(3);
    expect(res.filter(r => r.product === 'P1')[0]['2019']).toBe(34);
    expect(res.filter(r => r.product === 'P2')[0]['2018']).toBe(21);
    expect(res.filter(r => r.product === 'P3')[0]['2019']).toBe(33);
    expect(res.filter(r => r.product === 'P3')[0]['2018']).toBe(null);
  })

  it('stats quantile for sorted array', () => {
    const data = [3, 1, 2, 4, 0].sort();
    expect(quantile(data, 0)).toBe(0);
    expect(quantile(data, 1 / 4)).toBe(1);
    expect(quantile(data, 1.5 / 4)).toBe(1.5);
    expect(quantile(data, 2 / 4)).toBe(2);
    expect(quantile(data, 2.5 / 4)).toBe(2.5);
    expect(quantile(data, 3 / 4)).toBe(3);
    expect(quantile(data, 3.2 / 4)).toBe(3.2);
    expect(quantile(data, 4 / 4)).toBe(4);

    var even = [3, 6, 7, 8, 8, 10, 13, 15, 16, 20];
    expect(quantile(even, 0)).toBe(3);
    expect(quantile(even, 0.25)).toBe(7.25);
    expect(quantile(even, 0.5)).toBe(9);
    expect(quantile(even, 0.75)).toBe(14.5);
    expect(quantile(even, 1)).toBe(20);

    var odd = [3, 6, 7, 8, 8, 9, 10, 13, 15, 16, 20];
    expect(quantile(odd, 0)).toBe(3);
    expect(quantile(odd, 0.25)).toBe(7.5);
    expect(quantile(odd, 0.5)).toBe(9);
    expect(quantile(odd, 0.75)).toBe(14);
    expect(quantile(odd, 1)).toBe(20);

    expect(quantile([3, 5, 10], 0.5)).toBe(5);
  });

  it('stats mean', () => {
    expect(mean([1])).toBe(1);
    expect(mean([5, 1, 2, 3, 4])).toBe(3);
    expect(mean([19, 4])).toBe(11.5);
    expect(mean([4, 19])).toBe(11.5);
    expect(mean([NaN, 1, 2, 3, 4, 5])).toBe(3);
    expect(mean([1, 2, 3, 4, 5, NaN])).toBe(3);
    expect(mean([9, null, 4, undefined, 5, NaN])).toBe(6);
  });

  it('stats variance', () => {
    expect(variance([5, 1, 2, 3, 4])).toBe(2.5);
    expect(variance([20, 3])).toBe(144.5);
    expect(variance([3, 20])).toBe(144.5);
    expect(variance([NaN, 1, 2, 3, 4, 5])).toBe(2.5);
    expect(variance([1, 2, 3, 4, 5, NaN])).toBe(2.5);
    expect(variance([10, null, 3, undefined, 5, NaN])).toBe(13);
  });

  it('stats stdev', () => {
    expect(stdev([5, 1, 2, 3, 4])).toEqual(Math.sqrt(2.5));
    expect(stdev([20, 3])).toEqual(Math.sqrt(144.5));
    expect(stdev([3, 20])).toEqual(Math.sqrt(144.5));
    expect(stdev([NaN, 1, 2, 3, 4, 5])).toEqual(Math.sqrt(2.5));
    expect(stdev([1, 2, 3, 4, 5, NaN])).toEqual(Math.sqrt(2.5));
    expect(stdev([10, null, 3, undefined, 5, NaN])).toEqual(Math.sqrt(13));
  });

  it('stats median', () => {
    expect(median([1])).toBe(1);
    expect(median([5, 1, 2, 3])).toBe(2.5);
    expect(median([5, 1, 2, 3, 4])).toBe(3);
    expect(median([20, 3])).toBe(11.5);
    expect(median([3, 20])).toBe(11.5);
    expect(median([10, 3, 5])).toBe(5);
    expect(median([NaN, 1, 2, 3, 4, 5])).toBe(3);
    expect(median([1, 2, 3, 4, 5, NaN])).toBe(3);
    expect(median([null, 3, undefined, 5, NaN, 10])).toBe(5);
    expect(median([10, null, 3, undefined, 5, NaN])).toBe(5);
  });
})
