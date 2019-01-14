import { s } from 'meteor/underscorestring:underscore.string';

const stringHelpers = {
  humanize: s.humanize,
  camelize: s.camelize,
  lowercase(str) {
    return String(str).toLowerCase();
  },
  uppercase(str) {
    return String(str).toUpperCase();
  },
  stringify(object) {
    return JSON.stringify(object, true, 2);
  },
  beautifyJSON(jsonString) {
    try {
      return JSON.stringify(JSON.parse(jsonString), true, 2);
    } catch (error) {
      return `Error: ${error}\n\nInterpreted string: ${jsonString}`;
    }
  },
  stringifyHuman(object) {
    if (!object) {
      return '';
    }
    return JSON
      .stringify(object, true, 2)
      .replace(/(\s*\[\n)|([{}[\]",]*)/g, '')
      .replace(/\n\s\s/g, '\n');
  },
  formatNumber(n) {
    const number = Number(n);
    if (number.toLocaleString) {
      return number.toLocaleString('en-US');
    }
    return number.toString();
  },
};

export default stringHelpers;
