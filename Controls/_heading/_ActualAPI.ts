import {IBackOptions} from './Back';

export function counterSize(size: 's' | 'm' | 'l', fontSize: string): string {
    if (fontSize) {
        return fontSize;
    } else {
        const fontSizesTable = {
            s: 'm',
            m: 'l',
            l: '3xl'
        };
        const result: string = fontSizesTable[size];
        return result || 'l';
    }
}

export function counterStyle(style: 'primary' | 'secondary' | 'disabled', fontColorStyle: string): string {
    if (fontColorStyle) {
        return fontColorStyle;
    } else {
        const fontStylesTable = {
            primary: 'primary',
            secondary: 'secondary',
            disabled: 'unaccented'
        };
        const result: string = fontStylesTable[style];
        return result || 'primary';
    }
}

export function backSize(options: IBackOptions): { fontSize: string, iconSize: string } {
    if (options.fontSize && options.iconSize) {
        return {fontSize: options.fontSize, iconSize: options.iconSize};
    } else {
        return {fontSize: options.size, iconSize: options.size};
    }
}

export function backStyleOptions(style: 'primary' | 'secondary'): { fontColorStyle: string, iconStyle: string } {
    if (style === 'primary') {
        return {
            fontColorStyle: 'primary', iconStyle: 'secondary'
        };
    } else {
        return {
            fontColorStyle: 'secondary', iconStyle: 'primary'
        };
    }
}

export function backStyle(options: IBackOptions): { fontColorStyle: string, iconStyle: string } {
    if (options.fontColorStyle && options.iconStyle) {
        return {
            fontColorStyle: options.fontColorStyle,
            iconStyle: options.iconStyle
        };
    } else {
        return backStyleOptions(options.style);
    }
}
