export type ExpressionValue = string | number | boolean | object | unknown[]

export type ExpressionResult = {
    clientId: number;
    expressionId: string;
    name: string;
    result: ExpressionValue;
}