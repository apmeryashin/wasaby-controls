import { Control, TemplateFunction, IControlOptions } from 'UI/Base';
import * as template from 'wml!Controls/_newBrowser/navigation/Navigation';
import { RecordSet } from 'Types/collection';
import { Memory } from 'Types/source';
import { TKey } from 'Controls/interface';
import { IContextsWithActiveElementContext } from 'Controls/_newBrowser/context/Provider';

function findFirstNodeIndexByParentKey(items: RecordSet,
                                       parentKey: TKey,
                                       parentProperty: string,
                                       nodeProperty: string): number {
    for (let i = 0; i < items.getCount(); i += 1) {
        const item = items.at(i);
        if (item.get(nodeProperty) === true && item.get(parentProperty) === parentKey) {
            return i;
        }
    }
    return -1;
}

interface INavigationControlOptions extends IControlOptions {
    items: RecordSet;
    root: TKey;
    keyProperty: string;
    parentProperty: string;
    nodeProperty: string;
    activeElement: TKey;
    changeActiveElement: (activeElement: TKey) => void;
}

export default class Navigation<T = unknown> extends Control<INavigationControlOptions> {
    protected _template: TemplateFunction = template;

    protected _rootDirectories: RecordSet;
    protected _activeDirectoryKey: TKey;

    protected _subdirectories: Memory;
    protected _activeSubdirectoryKey: TKey;

    protected _beforeMount(options?: INavigationControlOptions,
                           contexts?: IContextsWithActiveElementContext, receivedState?: void): void {
        this._prepareActiveKeys(options);
        this._prepareActiveDirectoryItems(options);
        this._prepareActiveSubdirectoryItems(options, this._activeDirectoryKey);
    }

    protected _beforeUpdate(options?: INavigationControlOptions, contexts?: unknown): void {
        super._beforeUpdate(options, contexts);
        if (this._options.activeElement !== options.activeElement) {
            if (this._prepareActiveKeys(options)) {
                this._prepareActiveSubdirectoryItems(options, this._activeDirectoryKey);
            }
        }
    }

    protected _prepareActiveKeys(params: INavigationControlOptions): boolean {
        const oldActiveDirectoryKey = this._activeDirectoryKey;

        const { items, parentProperty, nodeProperty, root, activeElement } = params;

        if (activeElement !== null && activeElement !== undefined) {
            // если активный элемент находится в корне
            const activeItem = items.getRecordById(activeElement);
            if (activeItem.get(parentProperty) === root) {
                if (this._activeDirectoryKey !== activeItem.getKey()) {
                    this._activeDirectoryKey = activeItem.getKey();
                    const subDirIndex = findFirstNodeIndexByParentKey(
                        items, activeItem.getKey(), parentProperty, nodeProperty
                    );
                    if (subDirIndex !== -1) {
                        this._activeSubdirectoryKey = items.at(subDirIndex).getKey();
                    } else {
                        this._activeSubdirectoryKey = null;
                    }
                }
            } else {
                if (this._activeSubdirectoryKey !== activeItem.getKey()) {
                    this._activeSubdirectoryKey = activeItem.getKey();
                    const subDirParent = items.getRecordById(this._activeSubdirectoryKey);
                    if (subDirParent) {
                        this._activeDirectoryKey = subDirParent.get(parentProperty);
                    } else {
                        throw Error('Controls.newBrowser:Navigation :: invalid "activeElement" value.');
                    }
                }
            }
        } else {
            const dirIndex = findFirstNodeIndexByParentKey(items, root, parentProperty, nodeProperty);
            if (dirIndex !== -1) {
                this._activeDirectoryKey = items.at(dirIndex).getKey();
                const subDirIndex = findFirstNodeIndexByParentKey(
                    items, this._activeDirectoryKey, parentProperty, nodeProperty
                );
                if (subDirIndex !== -1) {
                    this._activeSubdirectoryKey = items.at(subDirIndex).getKey();
                } else {
                    this._activeSubdirectoryKey = null;
                }
            }
        }

        return oldActiveDirectoryKey !== this._activeDirectoryKey;
    }

    protected _prepareActiveDirectoryItems(params: INavigationControlOptions): void {
        const items = [];
        params.items.forEach((item) => {
            if (item.get(params.parentProperty) === params.root && item.get(params.nodeProperty) === true) {
                items.push(item.getRawData());
            }
        });
        this._rootDirectories = new RecordSet({
            keyProperty: params.items.getKeyProperty(),
            adapter: params.items.getAdapter(),
            rawData: items,
            format: params.items.getFormat()
        });
    }

    protected _prepareActiveSubdirectoryItems(params: INavigationControlOptions, rootMarkedKey: TKey): void {
        const items = [];
        params.items.forEach((item) => {
            if (item.get(params.parentProperty) === rootMarkedKey && item.get(params.nodeProperty) === true) {
                items.push(item.getRawData());
            }
        });
        this._subdirectories = new Memory({
            keyProperty: params.items.getKeyProperty(),
            adapter: params.items.getAdapter(),
            data: items
        });
    }

    protected _directoryKeyChanged(event: unknown, newKey: TKey): void {
        this._options.changeActiveElement(newKey);
    }

    protected _subdirectoryKeyChanged(event: unknown, newKey: TKey): void {
        this._options.changeActiveElement(newKey);
    }
}
