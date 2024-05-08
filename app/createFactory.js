import {createElement} from 'react';

export function createFactory(type) {
    return createElement.bind(null, type);
}