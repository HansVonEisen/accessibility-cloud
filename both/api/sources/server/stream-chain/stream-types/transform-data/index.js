import vm from 'vm';
import { check, Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { _ } from 'lodash';

import entries from '/both/lib/entries';
import getVMContext from './get-vm-context';
import vmScriptsOptions from '../vm-scripts-options';

const { Transform } = Npm.require('zstreams');

function compileMapping(fieldName, javascript, context) {
  const code = `(d) => (${javascript})`;

  return vm.runInContext(code, context);
}

function compileMappings(mappings, context) {
  const result = {};
  for (const [fieldName, javascript] of entries(mappings)) {
    try {
      result[fieldName] = compileMapping(fieldName, javascript, context);
    } catch (error) {
      if (error instanceof SyntaxError) {
        error.message = `${error.message} (in field '${fieldName}')`;
      }
      throw error;
    }
  }
  return result;
}

export default class TransformData {
  constructor({ mappings, keepOriginalData, onDebugInfo }) {
    check(mappings, Object);
    check(keepOriginalData, Match.Optional(Boolean));
    check(onDebugInfo, Match.Optional(Function));

    const context = getVMContext();
    this.context = context;
    const compiledMappings = compileMappings(mappings, context, vmScriptsOptions);
    this.compiledMappings = compiledMappings;

    let hadError = false;

    this.stream = new Transform({
      writableObjectMode: true,
      readableObjectMode: true,
      transform(chunk, encoding, callback) {
        let lastFieldName;
        try {
          if (hadError) { return; }

          const output = {};

          for (const [fieldName, fn] of entries(compiledMappings)) {
            lastFieldName = fieldName;
            const value = fn(chunk);
            if (fieldName.match(/-/)) {
              // Field name is probably a key path like 'a-b-c'
              if (value !== undefined && value !== null) {
                // Don't pollute database with undefined properties
                _.set(output, fieldName.replace(/-/g, '.'), value);
              }
            } else {
              output[fieldName] = value;
            }
          }
          output.properties = output.properties || {};
          if (!keepOriginalData) {
            output.properties.originalData = JSON.stringify(chunk);
          }
          callback(null, output);
        } catch (error) {
          hadError = true;
          if (onDebugInfo) {
            onDebugInfo({
              erroneousChunk: chunk,
              erroneousFieldName: lastFieldName.replace(/-/g, '.'),
              erroneousMapping: mappings[lastFieldName],
            });
          }
          this.emit('error', error);
          callback(error);
        }
      },
    });

    this.lengthListener = length => this.stream.emit('length', length);
    this.pipeListener = (source) => {
      this.source = source;
      source.on('length', this.lengthListener);
    };
    this.stream.on('pipe', this.pipeListener);
    this.stream.unitName = 'places';
  }

  dispose() {
    delete this.compiledMappings;
    this.stream.removeListener('pipe', this.pipeListener);
    delete this.pipeListener;
    if (this.source) {
      this.source.removeListener('length', this.lengthListener);
    }
    delete this.lengthListener;
    delete this.source;
    delete this.stream;
    delete this.context;
  }

  static getParameterSchema() {
    return new SimpleSchema({});
  }
}
