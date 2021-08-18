import {loadModule} from 'Controls/_popup/utils/moduleHelper';
import {Control} from 'UI/Base';
import {IBasePopupOptions} from 'Controls/_popup/interface/IBasePopupOptions';
import {PageController as DSPageController, IPageConfig} from 'Controls/dataSource';
import Confirmation from 'Controls/_popup/Opener/Confirmation';

interface IPageTemplateOptions {
    pageTemplate: string;
    pageTemplateOptions: object;
    pageId: string;
    prefetchResult?: Promise<any>;
}

interface IPagePopupOptions extends IBasePopupOptions {
    templateOptions?: IPagePopupOptions;
}

class PageController {

    /**
     * Получение опций окна для открытия страницы
     * @param pageId
     * @param popupOptions
     */
    getPagePopupOptions(pageId: string, popupOptions: IBasePopupOptions): Promise<unknown> {
        const resultPopupOptions = {...popupOptions};
        return DSPageController.getPageConfig(pageId).then((pageData) => {
            const templateOptions = this._getTemplateOptions(pageData, resultPopupOptions);
            templateOptions.prefetchResult = DSPageController.loadData(pageData, templateOptions.pageTemplateOptions);
            resultPopupOptions.template = 'Controls/popupTemplate:Page';
            resultPopupOptions.templateOptions = templateOptions;
            return resultPopupOptions;
        }).catch(() => {
            return popupOptions;
        });
    }

    /**
     * Предзагрузка статики необходимая для открытия страницы на панели
     * @param popupOptions
     */
    loadModules(template: string): Promise<Control> {
        return loadModule(template);
    }

    /**
     *
     * @param pageData
     * @param popupOptions
     * @private
     */
    private _getTemplateOptions(
        pageData: IPageConfig,
        popupOptions: IBasePopupOptions
    ): IPageTemplateOptions {
        const workspaceConfig = pageData?.templateOptions?.workspaceConfig;
        if (workspaceConfig?.templateName) {
            return {
                pageTemplate: workspaceConfig.templateName,
                pageTemplateOptions: {
                    ...workspaceConfig.templateOptions,
                    ...(popupOptions?.templateOptions as object || {})
                },
                pageId: popupOptions.pageId
            };
        } else {
            const message = `
                Страница с указанным идентификатором имеет некорректное описание.
                В описании должен быть workspaceConfig с заданным templateName.
            `;
            Confirmation.openPopup({
                type: 'ok',
                style: 'danger',
                message
            });
            throw new Error(message);
        }
    }
}

export default new PageController();
