import {TemplateFunction} from 'UI/Base';

export interface IGridAbstractColumn {
    template?: TemplateFunction;
    startColumn?: number;
    endColumn?: number;
}
