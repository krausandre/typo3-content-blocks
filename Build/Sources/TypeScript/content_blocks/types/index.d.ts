// @todo complete interface or add class
export interface IContentBlock extends Object {
  path: string
  fields: IContentBlockFieldsDictionary;
  static: {
    title: string;
    cType: string
  }
}

export interface IContentBlockFieldsDictionary {
  [identifier: string]: IContentBlockField
}

export interface IContentBlockField {
  identifier: string;
  properties: object;
  type: string;
}

export interface IContentBlocksDictionary {
  [identifier: string]: IContentBlock
}

export interface IContentBlockPromisesDictionary {
  [identifier: string]: Promise<IContentBlock>
}
