import {IPositionOrientation, POSITION} from './../../StickyBlock/Utils';

export function getDecomposedPosition(headerPosition: Record<keyof IPositionOrientation, string>): POSITION[] {
    const positions = [];
    switch (headerPosition.vertical) {
        case 'top':
        case 'bottom':
            positions.push(headerPosition.vertical);
            break;
        case 'topBottom':
            positions.push('top');
            positions.push('bottom');
            break;
    }

    switch (headerPosition.horizontal) {
        case 'left':
        case 'right':
            positions.push(headerPosition.horizontal);
            break;
        case 'leftRight':
            positions.push('left');
            positions.push('right');
            break;
    }
    return positions;
}

export function getDecomposedPositionFromString(headerPosition: string): POSITION[] {
    const positions = [];

    for (const fPosition of [POSITION.left, POSITION.right, POSITION.top, POSITION.bottom]) {
        if (headerPosition.toLowerCase().indexOf(fPosition) !== -1) {
            positions.push(fPosition);
        }
    }
    return positions;
}
