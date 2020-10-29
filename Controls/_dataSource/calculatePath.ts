import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import {factory} from 'Types/chain';

type Path = null|Model[];

interface IPathResult {
    path: Path;
    pathWithoutItemForBackButton: Path;
    backButtonCaption: string|null;
}

function getPath(data: RecordSet): Path {
    const path = data && data.getMetaData().path;
    let breadCrumbs = null;

    if (path && path.getCount() > 0) {
        breadCrumbs = factory(path).toArray();
    }

    return breadCrumbs;
}

function isBackButtonNeeded(path: Path): boolean {
    return path && path.length > 1;
}

function getBackButtonCaption(path: Path, displayProperty?: string): string {
    let caption = '';

    if (isBackButtonNeeded(path) && displayProperty) {
        caption = path[path.length - 1].get(displayProperty);
    }

    return caption;
}

function getPathWithoutItemForBackButton(breadCrumbs: Path): Path {
    let breadCrumbsWithoutItemForBackButton = null;

    if (isBackButtonNeeded(breadCrumbs)) {
        breadCrumbsWithoutItemForBackButton = breadCrumbs.slice(0, breadCrumbs.length - 1);
    }

    return breadCrumbsWithoutItemForBackButton;
}

export default function calculatePath(data: RecordSet, displayProperty?: string): IPathResult {
    const path = getPath(data);

    return {
        path,
        pathWithoutItemForBackButton: getPathWithoutItemForBackButton(path),
        backButtonCaption: getBackButtonCaption(path, displayProperty)
    };
}
