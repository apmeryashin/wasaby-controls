import {Control} from 'UI/Base';
import {detection} from 'Env/Env';
import {SlidingPanelOpener} from 'Controls/popup';
import {INavigationMenu} from 'Controls/_breadcrumbs/NavigationMenu';

/**
 * Опенер, который умеет открывать навигационное меню для крошек
 */
export class Opener {
    private _menu: SlidingPanelOpener;
    private get menu(): SlidingPanelOpener {
        if (!this._menu) {
            this._menu = new SlidingPanelOpener();
        }

        return this._menu;
    }

    /**
     * Открывает popup с компонентом навигационного меню.
     * В зависимости от текущего устройства открывает либо StickyPanel, либо SlidingPanel.
     *
     * @param {Control} opener - компонент, инициировавший открытие
     * @param {HTMLElement} target - целевой элемент, относительно которого будет спозиционирован popup
     * @param {Object} options - доп. опции
     */
    open(
        opener: Control,
        target: HTMLElement,
        options: {
            eventHandlers: unknown
            templateOptions: INavigationMenu
        }
    ): void {
        this.menu.open({
            modal: detection.isPhone,

            slidingPanelOptions: {
                minHeight: 100,
                position: 'bottom',
                autoHeight: true
            },

            desktopMode: 'sticky',
            dialogOptions: {
                // tslint:disable-next-line:ban-ts-ignore
                // @ts-ignore
                target,
                opener,

                maxWidth: 700,

                actionOnScroll: 'close',
                closeOnOutsideClick: true,
                backgroundStyle: 'default',
                targetPoint: {
                    vertical: 'top',
                    horizontal: 'left'
                },
                direction: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                offset: {
                    horizontal: -8,
                    vertical: -9
                },
                fittingMode: {
                    vertical: 'overflow',
                    horizontal: 'fixed'
                }
            },

            // tslint:disable-next-line:ban-ts-ignore
            // @ts-ignore
            template: 'wml!Controls/_breadcrumbs/NavigationMenu/OpenerTemplate',
            templateOptions: options.templateOptions,
            eventHandlers: options.eventHandlers
        });
    }

    close(): void {
        this._menu?.close();
    }

    destroy(): void {
        this._menu?.destroy();
    }
}
