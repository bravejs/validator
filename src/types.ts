export interface Rule<T = any> {
  required: boolean;
  number: boolean;
  digits: boolean;
  dateISO: boolean;
  url: boolean;
  email: boolean;
  min: number;
  max: number;
  range: [number, number];
  minLength: number;
  maxLength: number;
  lengthRange: [number, number];
  step: number;
  equal: any;
  notEqual: any;
  pattern: RegExp;
  validator: (value: T) => boolean | Promise<boolean>;
}

export type RuleNames = keyof Rule;

export interface Config<T extends object, K extends keyof T>
  extends Partial<Rule<T[K]>> {
  message:
    | string
    | ((param: Rule[RuleNames], value: T[K], rule: RuleNames) => string);
}

export type Rules<T extends object> = {
  [K in keyof T]: Config<T, K> | Config<T, K>[];
};

export type Validators = {
  [K in RuleNames]: (param: Rule[K], value: any) => boolean | Promise<boolean>;
};

export interface ValidateError<T extends object, K extends keyof T = keyof T> {
  field: K;
  value: T[K];
  rule: RuleNames;
  param: Rule[RuleNames];
  message: string;
}

export interface Valid<T extends object> {
  valid: true;
  data: T;
}

export interface Invalid<T extends object> {
  valid: false;
  errors: ValidateError<T>[];
}
