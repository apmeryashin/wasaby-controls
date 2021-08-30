import { ErrorViewConfig } from 'Controls/error';
import { IControlOptions } from 'UI/Base';

/**
 * Опции компонента {@link Controls/_dataSource/_error/IContainer IContainer}
 * @interface Controls/_dataSource/_error/IContainerConfig
 * @author Северьянов А.А.
 * @pubcli
 */
export interface IContainerConfig extends IControlOptions {
    /**
     * @name Controls/_dataSource/_error/Container#viewConfig
     * @cfg {Controls/error:ErrorViewConfig} Данные для отображения сообщения об ошибке.
     */
    viewConfig?: ErrorViewConfig;

    /**
     * @name Controls/_dataSource/_error/Container#isModalDialog
     * @cfg {Controls/error:ErrorViewConfig} Открывать ли диалог модальным, если ошибка отобразится в диалоговом окне.
     */
    isModalDialog?: boolean;
}

/**
 * Интерфейс компонента, отвечающего за отображение шаблона ошибки по данным  от {@link Controls/_dataSource/_error/Controller}
 *
 * @interface Controls/_dataSource/_error/IContainer
 * @public
 * @author Северьянов А.А.
 */
export default interface IContainer {
    /**
     * Показать парковочный компонент, отображающий данные об ошибке
     * @param viewConfig
     * @function
     * @public
     */
    show(viewConfig: ErrorViewConfig): void;

    /**
     * Скрыть компонент, отображающий данные об ошибке
     * @function
     * @public
     */
    hide(): void;
}

/**
 * Интерефейс конструктора {@link Controls/_dataSource/_error/IContainer IContainer}
 * @interface Controls/_dataSource/_error/IContainerConstructor
 * @author Северьянов А.А.
 * @public
 */
export interface IContainerConstructor {
    new(config: IContainerConfig): IContainer;
}
