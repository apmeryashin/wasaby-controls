import {IPositionOrientation, POSITION} from './../../StickyBlock/Utils';

export default function getDecomposedPosition(headerPosition: Record<keyof IPositionOrientation, string>): POSITION[] {
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
