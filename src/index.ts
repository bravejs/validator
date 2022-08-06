import {
  Config,
  Invalid,
  RuleNames,
  Rules,
  Valid,
  ValidateError,
} from './types';
import VALIDATORS from './validators';

class Validator<T extends object> {
  private _rules: Rules<T>;

  constructor(rules: Rules<T>) {
    this._rules = rules;
  }

  validate(data: T) {
    const tasks: Promise<void>[] = [];
    const errors: ValidateError<T>[] = [];

    const validate = <K extends keyof T>(field: K, config: Config<T, K>) => {
      const value = data[field];
      const message = config.message;

      for (const configKey in config) {
        if (configKey === 'message') {
          continue;
        }

        const rule = configKey as RuleNames;
        const param = config[rule];
        const result = VALIDATORS[rule](param as never, value);

        const pushError = (res: boolean) => {
          res ||
            errors.push({
              field,
              value,
              rule,
              param,
              message:
                typeof message === 'function'
                  ? message(param, value, rule)
                  : message,
            });
        };

        if (typeof result === 'object') {
          tasks.push(result.then(pushError));
        } else {
          pushError(result);
        }
      }
    };

    for (const dataKey in data) {
      const rule = this._rules[dataKey];

      if (rule) {
        if (Array.isArray(rule)) {
          for (const ruleElement of rule) {
            validate(dataKey, ruleElement);
          }
        } else {
          validate(dataKey, rule);
        }
      }
    }

    return new Promise<Valid<T> | Invalid<T>>((resolve, reject) => {
      const check = () => {
        resolve(
          errors.length ? { valid: false, errors } : { valid: true, data }
        );
      };

      tasks.length ? Promise.all(tasks).then(check, reject) : check();
    });
  }
}

export default Validator;
