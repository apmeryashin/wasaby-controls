import RemoveProvider from 'Controls/_listCommands/Remove/Provider';

/**
 * Провайдер "удаления записей". Удаляет элементы из источника данных c подтверждением удаления.
 * @author Крайнов Д.О.
 */
export default class ProviderWithConfirm extends RemoveProvider {
    protected _callRemove(meta): Promise<string> {
        return this._removeController.removeWithConfirmation(meta.selection,
            meta.filter).then(() => 'fullReload');
    }
}
