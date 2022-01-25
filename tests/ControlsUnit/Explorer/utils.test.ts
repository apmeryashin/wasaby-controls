/* tslint:disable:no-magic-numbers */
import {assert} from 'chai';
import {Model} from 'Types/entity';
import {IHeaderCell, THeaderVisibility} from 'Controls/grid';
import {
    getCursorValue,
    getHeaderVisibility,
    isCursorNavigation,
    needBackButtonInHeader
} from 'Controls/_explorer/utils';
import {INavigationOptionValue, INavigationPositionSourceConfig} from 'Controls/_interface/INavigation';

describe('Explorer utils', () => {
    it('needBackButtonInHeader', () => {
        let result: boolean;

        result = needBackButtonInHeader([{}], 'visible');
        assert.isTrue(
            result,
            'При breadcrumbsVisibility === visible и пустой первой ячейки заголовка кнопка "Назад" должна быть'
        );

        result = needBackButtonInHeader([{caption: 'test'}], 'visible');
        assert.isFalse(
            result,
            'Задан пользовательский заголовок первой ячейки (caption), кнопки "Назад" быть не должно'
        );

        result = needBackButtonInHeader([{title: 'test'} as IHeaderCell], 'visible');
        assert.isFalse(
            result,
            'Задан пользовательский заголовок первой ячейки (title), кнопки "Назад" быть не должно'
        );

        result = needBackButtonInHeader([{template: 'test'}], 'visible');
        assert.isFalse(
            result,
            'Задан пользовательский шаблон первой ячейки (template), кнопки "Назад" быть не должно'
        );

        result = needBackButtonInHeader([{}], 'hidden');
        assert.isFalse(
            result,
            'При breadcrumbsVisibility === hidden кнопки "Назад" в заголовке таблицы быть не должно'
        );
    });

    it('getHeaderVisibility', () => {
        let result: THeaderVisibility;

        //region Крошки скрыты
        result = getHeaderVisibility(1, null, [{}], 'visible', 'hidden');
        assert.equal(result, 'visible', 'Крошки скрыты, должен вернутся указанный headerVisibility');

        result = getHeaderVisibility(1, null, [{}], undefined, 'hidden');
        assert.equal(result, 'hasdata', 'Крошки скрыты и видимость заголовка не задана, должен вернутся дефолт');
        //endregion

        //region Задано содержимое первой ячейки заголовка
        result = getHeaderVisibility(1, null, [{caption: 'test'}], 'visible', 'visible');
        assert.equal(result, 'visible', 'Задано содержимое первой ячейки заголовка, должен вернутся указанный headerVisibility');

        result = getHeaderVisibility(1, null, [{caption: 'test'}], undefined, 'visible');
        assert.equal(result, 'hasdata', 'Задано содержимое первой ячейки заголовка и видимость заголовка не задана, должен вернутся дефолт');
        //endregion

        //region Содержимое первой ячейки заголовка не задано, видимость заголовка определяется на основании рутов
        result = getHeaderVisibility(1, null, [{}], 'hasdata', 'visible');
        assert.equal(result, 'visible', 'Находимся в папке, заголовок должен быть виден');

        result = getHeaderVisibility(null, null, [{}], 'visible', 'visible');
        assert.equal(result, 'visible', 'Находимся в корне, должен вернутся указанный headerVisibility');
        //endregion
    });

    it('isCursorNavigation', () => {
        assert.isFalse(isCursorNavigation({}));
        assert.isFalse(isCursorNavigation({source: 'page'}));
        assert.isTrue(isCursorNavigation({source: 'position'}));
    });

    it('getCursorValue', () => {
        const item = new Model({
            keyProperty: 'id',
            rawData: {
                id: 12,
                title: 'Title'
            }
        });
        const navigation: INavigationOptionValue<INavigationPositionSourceConfig> = {
            sourceConfig: {
                field: 'id'
            }
        };

        assert.deepEqual(getCursorValue(item, navigation), [12]);

        navigation.sourceConfig.field = ['id'];
        assert.deepEqual(getCursorValue(item, navigation), [12]);

        navigation.sourceConfig.field = ['id', 'title'];
        assert.deepEqual(getCursorValue(item, navigation), [12, 'Title']);
    });
});
