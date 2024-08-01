import FormEngineValidation from '@typo3/backend/form-engine-validation.js';
import { expect } from '@open-wc/testing';

interface FormEngineConfig {
  [x: string]: any;
}

interface FormatValueData {
  description: string,
  type: string,
  value: number|string,
  result: string
}

interface ProcessValueData {
  description: string,
  command: string,
  value: string,
  config: FormEngineConfig,
  result: string
}

//type Values = Array<object>|object;
type Values = any;

/**
 * Helper function to implement DataProvider
 * @param {Function|Array|Object} values
 * @param {Function} func
 */
function using(values: (() => Values)|Values, func: (...args: unknown[]) => void): void {
  if (values instanceof Function) {
    values = values();
  }

  if (values instanceof Array) {
    values.forEach(function(value) {
      if (!(value instanceof Array)) {
        value = [value];
      }

      func(...value);
    });
  } else {
    const objectKeys = Object.keys(values);

    objectKeys.forEach(function(key) {
      if (!(values[key] instanceof Array)) {
        values[key] = [values[key]];
      }

      values[key].push(key);

      func(...values[key]);
    });
  }
}

describe('TYPO3/CMS/Backend/FormEngineValidationTest:', () => {
  const formatValueDataProvider: Array<FormatValueData> = [
    {
      'description': 'returns empty string with string 0',
      'type': 'date',
      'value': '0',
      'result': ''
    },
    {
      'description': 'returns date with int 0',
      'type': 'date',
      'value': 0,
      'result': '1970-01-01T00:00:00Z'
    },
    {
      'description': 'works for type date with timestamp',
      'type': 'date',
      'value': 10000000,
      'result': '1970-04-26T17:46:40Z'
    },
    {
      'description': 'works for type date with iso date',
      'type': 'date',
      'value': '2016-12-02T11:16:06Z',
      'result': '2016-12-02T11:16:06Z'
    },
    {
      'description': 'works for type date with iso date with milliseconds',
      'type': 'date',
      'value': '2016-12-02T11:16:06.000Z',
      'result': '2016-12-02T11:16:06Z'
    },
    {
      'description': 'returns empty string with non-iso date',
      'type': 'date',
      'value': 'foo',
      'result': ''
    },
    {
      'description': 'works for type datetime',
      'type': 'datetime',
      'value': '0',
      'result': ''
    },
    {
      'description': 'works for type datetime with timestamp',
      'type': 'datetime',
      'value': 10000000,
      'result': '1970-04-26T17:46:40Z'
    },
    {
      'description': 'works for type datetime with iso date',
      'type': 'datetime',
      'value': '2016-12-02T11:16:06Z',
      'result': '2016-12-02T11:16:06Z'
    },
    {
      'description': 'works for type datetime with iso date with milliseconds',
      'type': 'datetime',
      'value': '2016-12-02T11:16:06.000Z',
      'result': '2016-12-02T11:16:06Z'
    },
    {
      'description': 'resolves to empty result for zero value',
      'type': 'datetime',
      'value': '0',
      'result': ''
    },
    {
      'description': 'resolves to empty result for invalid value',
      'type': 'datetime',
      'value': 'invalid',
      'result': ''
    },
    {
      'description': 'works for type time',
      'type': 'time',
      'value': 0,
      'result': '1970-01-01T00:00:00Z'
    },
    {
      'description': 'works for type time with timestamp',
      'type': 'time',
      'value': 10000000,
      'result': '1970-04-26T17:46:40Z'
    },
    {
      'description': 'works for type time with iso date',
      'type': 'time',
      'value': '2016-12-02T11:16:06.000Z',
      'result': '2016-12-02T11:16:06Z'
    }
  ];

  describe('tests for formatValue', () => {
    using(formatValueDataProvider, function(testCase: FormatValueData) {
      it(testCase.description, () => {
        FormEngineValidation.initialize(document.createElement('form'));
        const result = FormEngineValidation.formatValue(testCase.type, testCase.value);
        expect(result).to.equal(testCase.result);
      });
    });
  });

  const processValueDataProvider: Array<ProcessValueData> = [
    {
      'description': 'works for command alpha with numeric value',
      'command': 'alpha',
      'value': '1234',
      'config': {},
      'result': ''
    },
    {
      'description': 'works for command alpha with string value',
      'command': 'alpha',
      'value': 'abc',
      'config': {},
      'result': 'abc'
    },
    {
      'description': 'works for command alpha with alphanum input',
      'command': 'alpha',
      'value': 'abc123',
      'config': {},
      'result': 'abc'
    },
    {
      'description': 'works for command alpha with alphanum input',
      'command': 'alpha',
      'value': '123abc123',
      'config': {},
      'result': 'abc'
    }
  ];

  describe('test for processValue', () => {
    using(processValueDataProvider, function(testCase: ProcessValueData) {
      it(testCase.description, () => {
        const result = FormEngineValidation.processValue(testCase.command, testCase.value, testCase.config);
        expect(result).to.equal(testCase.result);
      });
    });
  });

  describe('tests for parseInt', () => {
    it('works for value 0', () => {
      expect(FormEngineValidation.parseInt(0)).to.equal(0);
    });
    it('works for value 1', () => {
      expect(FormEngineValidation.parseInt(1)).to.equal(1);
    });
    it('works for value -1', () => {
      expect(FormEngineValidation.parseInt(-1)).to.equal(-1);
    });
    it('works for value "0"', () => {
      expect(FormEngineValidation.parseInt('0')).to.equal(0);
    });
    it('works for value "1"', () => {
      expect(FormEngineValidation.parseInt('1')).to.equal(1);
    });
    it('works for value "-1"', () => {
      expect(FormEngineValidation.parseInt('-1')).to.equal(-1);
    });
    it('works for value 0.5', () => {
      expect(FormEngineValidation.parseInt(0.5)).to.equal(0);
    });
    it('works for value "0.5"', () => {
      expect(FormEngineValidation.parseInt('0.5')).to.equal(0);
    });
    it('works for value "foo"', () => {
      expect(FormEngineValidation.parseInt('foo')).to.equal(0);
    });
    it('works for value true', () => {
      expect(FormEngineValidation.parseInt(true)).to.equal(0);
    });
    it('works for value false', () => {
      expect(FormEngineValidation.parseInt(false)).to.equal(0);
    });
    it('works for value null', () => {
      expect(FormEngineValidation.parseInt(null)).to.equal(0);
    });
  });

  describe('tests for parseDouble', () => {
    it('works for value 0', () => {
      expect(FormEngineValidation.parseDouble(0)).to.equal('0.00');
    });
    it('works for value 1', () => {
      expect(FormEngineValidation.parseDouble(1)).to.equal('1.00');
    });
    it('works for value -1', () => {
      expect(FormEngineValidation.parseDouble(-1)).to.equal('-1.00');
    });
    it('works for value "0"', () => {
      expect(FormEngineValidation.parseDouble('0')).to.equal('0.00');
    });
    it('works for value "1"', () => {
      expect(FormEngineValidation.parseDouble('1')).to.equal('1.00');
    });
    it('works for value "-1"', () => {
      expect(FormEngineValidation.parseDouble('-1')).to.equal('-1.00');
    });
    it('works for value 0.5', () => {
      expect(FormEngineValidation.parseDouble(0.5)).to.equal('0.50');
    });
    it('works for value "0.5"', () => {
      expect(FormEngineValidation.parseDouble('0.5')).to.equal('0.50');
    });
    it('works for value "foo"', () => {
      expect(FormEngineValidation.parseDouble('foo')).to.equal('0.00');
    });
    it('works for value true', () => {
      expect(FormEngineValidation.parseDouble(true)).to.equal('0.00');
    });
    it('works for value false', () => {
      expect(FormEngineValidation.parseDouble(false)).to.equal('0.00');
    });
    it('works for value null', () => {
      expect(FormEngineValidation.parseDouble(null)).to.equal('0.00');
    });
  });
});
