import each from 'lodash/each';
import isPlainObject from 'lodash/isPlainObject';

const keyValueHelpers = {
  keyValue(object) {
    const result = [];
    each(object, (value, key) => result.push({ key, value }));
    return result;
  },
  keyValues(object) {
    if (!isPlainObject(object)) { return []; }
    if (!object) { return []; }
    return Object.keys(object).map(key => ({ key, value: object[key] }));
  },
};

export default keyValueHelpers;
