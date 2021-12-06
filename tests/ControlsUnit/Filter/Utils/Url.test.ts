import {getQueryParamsByFilter, updateUrlByFilter, getFilterFromUrl} from 'Controls/_filter/Utils/Url';
import {assert} from 'chai';
import {query} from 'Application/Env';
import * as sinon from 'sinon';
import {MaskResolver} from 'Router/router';

describe('Controls/_filter/Utils/Url', () => {
    afterEach(() => {
        sinon.restore();
    });

    it('getQueryParamsByFilter empty filterButtonItems', () => {
        assert.deepEqual(getQueryParamsByFilter([]), {});
    });

    it('getQueryParamsByFilter', () => {
        const queryParams = getQueryParamsByFilter([
            {name: 'testName', value: 'testValue', textValue: 'testText', resetValue: null},
            {name: 'testName2', value: {value: 'testValue'}, textValue: 'testText', resetValue: null},
            {name: 'testName', value: [{value: 'testValue'}], textValue: 'testText', resetValue: null}
        ]);
        const expected = {filter: '[{"name":"testName","value":"testValue","textValue":"testText"},{"name":"testName2","value":{"value":"testValue"},"textValue":"testText"},{"name":"testName","value":[{"value":"testValue"}],"textValue":"testText"}]'};

        assert.deepEqual(queryParams, expected);
    });

    it('updateUrlByFilter', () => {
        const items = [{name: 'testName', value: 'testValue', textValue: 'testText', resetValue: null}];
        const queryParams = getQueryParamsByFilter(items);
        const state = MaskResolver.calculateQueryHref(queryParams);

        assert.deepEqual(queryParams, {filter: '[{"name":"testName","value":"testValue","textValue":"testText"}]'});
        assert.deepEqual(state, '/?filter=%5B%7B%22name%22%3A%22testName%22%2C%22value%22%3A%22testValue%22%2C%22textValue%22%3A%22testText%22%7D%5D');
    });

    it('getFilterFromUrl', () => {
        const urlFilter = {filter: '%5B%7B%22name%22%3A%22Organization%22%2C%22value%22%3A21391705%2C%22textValue%22%3A%22%D0%9D%D0%9E%D0%92%D0%AB%D0%99%20%D0%A2%D0%95%D0%A1%D0%A2%22%7D%5D'};
        sinon.stub(query, 'get').value(urlFilter);

        assert.deepEqual(getFilterFromUrl(), [{name: 'Organization', value: 21391705, textValue: 'НОВЫЙ ТЕСТ'}]);
    });
});
