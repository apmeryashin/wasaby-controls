export type TSelectionCountMode = 'all' | 'leaf' | 'node';

/**
 * Интерфейс для контролов, поддерживающих подсчет записей определённого типа.
 *
 * @public
 * @author Панихин К.А.
 */
export interface ISelectionCountModeOptions {
    readonly '[Controls/_interface/ISelectionCountMode]': boolean;
    selectionCountMode?: TSelectionCountMode;
}


/**
 * @typedef {String} SelectionCountMode
 * @variant all Подсчитываются все виды записей.
 * @variant node Подсчитываются только узлы.
 * @variant leaf Подсчитываются только листья.
 */

/**
 * @name Controls/_interface/ISelectionCountModeOptions#selectionCountMode
 * @cfg {SelectionCountMode} Тип подсчитываемых записей.
 * @default all
 * @demo Controls-demo/treeGridNew/MultiSelect/SelectionCountMode/Index
 * @example
 * В этом примере для подсчета будут доступны только узлы.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Layout.Selector.Browser parentProperty="Раздел" nodeProperty="Раздел@" selectionCountMode="node">
 *     <ws:content>
 *         <Controls.treeGrid:View />
 *     </ws:content>
 * </Layout.Selector.Browser>
 * </pre>
 */
