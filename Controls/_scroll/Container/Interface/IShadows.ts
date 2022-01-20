/**
 * Допустимые значения для опций интерфейса {@link Controls/_scroll/Container/Interface/IShadows IShadows}, управляющих видимостью тени.
 * @variant hidden Тень всегда скрыта.
 * @variant visible Тень всегда видима.
 * @variant auto Видимость зависит от состояния скролируемой области. Тень отображается только с той стороны, в которую можно скролить контент, то на этой границе отображается тень.
 */
export const enum SHADOW_VISIBILITY {
   /**
    * Тень всегда скрыта.
    */
   HIDDEN = 'hidden',
   /**
    * Тень всегда видима.
    */
   VISIBLE = 'visible',
   /**
    * Видимость зависит от состояния скролируемой области. Тень отображается только с той стороны, в которую можно скролить контент, то на этой границе отображается тень.
    */
   AUTO = 'auto'
}

export const enum SHADOW_MODE {
    JS = 'js',
    MIXED = 'mixed',
    CSS = 'css'
}

export interface IShadowsOptions {
    /**
     * @name Controls/_scroll/Container/Interface/IShadows#topShadowVisibility
     * @cfg {SHADOW_VISIBILITY} Режим отображения тени сверху.
     * @default auto
     * @demo Controls-demo/Scroll/Container/TopShadowVisibility/Index
     */
    topShadowVisibility: SHADOW_VISIBILITY;
    /**
     * @name Controls/_scroll/Container/Interface/IShadows#bottomShadowVisibility
     * @cfg {SHADOW_VISIBILITY} Режим отображения тени снизу.
     * @default auto
     * @demo Controls-demo/Scroll/Container/BottomShadowVisibility/Index
     */
    bottomShadowVisibility: SHADOW_VISIBILITY;
    /**
     * @name Controls/_scroll/Container/Interface/IShadows#leftShadowVisibility
     * @cfg {SHADOW_VISIBILITY} Режим отображения тени слева.
     * @default auto
     */
    leftShadowVisibility: SHADOW_VISIBILITY;
    /**
     * @name Controls/_scroll/Container/Interface/IShadows#rightShadowVisibility
     * @cfg {SHADOW_VISIBILITY} Режим отображения тени справа.
     * @default auto
     */
    rightShadowVisibility: SHADOW_VISIBILITY;
    /**
     * @name Controls/_scroll/Container/Interface/IShadows#shadowMode
     * @cfg {String} Режим отображения тени.
     * @variant js Управление тенями осуществляется через js.
     * Значение можно получить из константы Controls/scroll:SHADOW_MODE.JS.
     * @variant mixed При построении контрола тени работают полностью через стили как в режиме css.
     * Это позволяет избавиться от лишнего цикла синхронизации при построение скролируемой области.
     * При наведении курсора переключаются в режим js.
     * Значение можно получить из константы Controls/scroll:SHADOW_MODE.MIXED.
     * @variant css Управление тенями работает полностью через css. У этого режима есть ограничения.
     * Тени рисуются под контентом, по этому их могут перекрывать фоны, картинки и прочие элементы расположенные внутри скролируемой области.
     * Значение можно получить из константы Controls/scroll:SHADOW_MODE.CSS.
     * @default mixed
     */
    shadowMode: SHADOW_MODE;
    shadowStyle: string;
}

export interface IShadowsVisibilityByInnerComponents {
    top?: SHADOW_VISIBILITY;
    bottom?: SHADOW_VISIBILITY;
    left?: SHADOW_VISIBILITY;
    right?: SHADOW_VISIBILITY;
}

export function getDefaultOptions(): IShadowsOptions {
    return {
        topShadowVisibility: SHADOW_VISIBILITY.AUTO,
        bottomShadowVisibility: SHADOW_VISIBILITY.AUTO,
        leftShadowVisibility: SHADOW_VISIBILITY.AUTO,
        rightShadowVisibility: SHADOW_VISIBILITY.AUTO,
        shadowMode: SHADOW_MODE.MIXED,
        shadowStyle: 'default'
    };
}

/**
 * Интерфейс для контролов со скролбарами для управления видимостью тени.
 * @public
 * @author Миронов А.Ю.
 */
export interface IShadows {
    readonly '[Controls/_scroll/Container/Interface/IShadows]': boolean;
}
