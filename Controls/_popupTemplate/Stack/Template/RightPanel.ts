import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_popupTemplate/Stack/Template/RightPanel/RightPanel';
import {Controller as ManagerController} from 'Controls/popup';
import {StackController} from 'Controls/_popupTemplate/Stack/StackController';
import {RIGHT_PANEL_WIDTH} from 'Controls/_popupTemplate/BaseController';
import {Logger} from 'UI/Utils';
import 'css!Controls/popupTemplate';

interface IRightPanelOptions extends IControlOptions {
    maximizeButtonClickCallback?: () => void;
    toolbarContentTemplate: TemplateFunction;
}

export default class RightPanel extends Control<IRightPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _rightBottomTemplate: string;
    protected _isOutsidePanel: boolean = true;

    protected _beforeMount(options: IRightPanelOptions): void {
        this._rightBottomTemplate = ManagerController.getRightPanelBottomTemplate();
        if (!ManagerController.hasRightPanel() && options.toolbarContentTemplate && !this._hasWidthForRightPanel()) {
            this._isOutsidePanel = false;
        }
    }

    protected _maximizeButtonClickHandler(): void {
        if (this._options.maximizeButtonClickCallback) {
            this._options.maximizeButtonClickCallback();
        }
    }

    protected _close(): void {
        this._notify('close', [], {bubbling: true});
    }

    // Если на приложении не задали правую панель, но рассчитывают на ее наличие (за счет опции toolbarContentTemplate),
    // то мы должны отрисовать эту панель, чтобы не ломать прикладкую верстку.
    // По возможности, если панель вмещается, позиционируем ее так, чтобы она не влияла на размеры контента.
    // На уровне контроллера так сделать не получится, т.к. он не знает,
    // есть ли в контретной раскладке правая панель (toolbarContentTemplate).
    // По сути защищаем пользователя от кривого отображения.
    private _hasWidthForRightPanel(): boolean {
        const fakeItem = {
            popupOptions: {
            }
        };
        const sizes = StackController.calcStackParentCoords(fakeItem);
        const message = 'Для Controls/popupTemplate:Stack задана контентная опция toolbarContentTemplate, которая ' +
            'используется в правой панели. Но на самом приложении правая панель не задана, это может ' +
            'привести к визуальным ошибкам позиционирования.';
        Logger.warn(message, this);
        return sizes.right > RIGHT_PANEL_WIDTH;
    }
    // Для пользователей делается механизм подсказок, который должен быть привязан к определенному шаблону на
    // сайте. На уровне StackTemplate мы не знаем в каком шаблоне находимся и не можем передать это в контроллер
    // подсказок. Передадим метод, который по DOM определит имя шаблона. Другого способа узнать имя шаблона окна пока
    // нет, оставим поддержку полукостыля на нашем уровне.
    protected _getTemplateName(): string {
        const rightPanelElement = document.querySelector('.controls-Popup');
        return rightPanelElement.getAttribute('templateName') || '';
    }
}
