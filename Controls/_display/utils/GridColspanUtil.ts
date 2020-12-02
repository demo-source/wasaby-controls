import {IColspanParams} from 'Controls/grid';

interface IColumn extends IColspanParams {}
interface IPreparedColumn extends Required<IColspanParams> {}

interface IPrepareColumnsParams<T extends IPreparedColumn> {
    columns: IColumn[];
    gridColumnsCount: number;
    hasMultiSelect: boolean;
    afterPrepareCallback?(column: T, index: number, columns: T[]): void;
}

export default function prepareColumns<T extends IPreparedColumn>(params: IPrepareColumnsParams<T>): Array<T> {
    const result = [];

    let shouldInsertColumnBefore = false;
    let shouldInsertColumnAfter = false;

    params.columns.forEach((c, index) => {
        const newColumn: IColumn = {...c};

        // Начальный индекс колонки
        if (typeof c.startColumn === 'number') {
            // Если задали индкс начала колонки, то оставляем его и проверям, нужно ли
            // вставить еще колонку до данной(если начальный индекс больше 1)
            newColumn.startColumn = c.startColumn;
            if (index === 0 && c.startColumn !== 1) {
                shouldInsertColumnBefore = true;
            }
        } else if (index === 0) {
            // Если не задали индкс начала колонки, то утанавливаем его как конец
            // предыдущей (или как начало, если это первая колонка)
            newColumn.startColumn = 1;
        } else {
            newColumn.startColumn = result[index - 1].endColumn;
        }

        // Конечный индекс колонки
        if (typeof c.endColumn === 'number') {
            // Если задали индкс конца колонки, то оставляем его и проверям, нужно ли
            // вставить еще колонку после данной(если это последняя колонка из шаблона, но ее
            // конечный индекс задан и он меньше чем индекс последней границы грида)
            newColumn.endColumn = c.endColumn;
            if (index === params.columns.length - 1 && newColumn.endColumn !== params.gridColumnsCount + 1) {
                shouldInsertColumnAfter = true;
            }
        } else {
            // Если не задали индкс конца колонки, то утанавливаем его либо как индекс последней границы грида,
            // либо как стартовый индекс колонки + 1(по умолчанию, колонка не будет растянута)
            if (index === params.columns.length - 1) {
                newColumn.endColumn = params.gridColumnsCount + 1;
            } else {
                newColumn.endColumn = newColumn.startColumn + 1;
            }
        }

        result.push(newColumn);
    });

    // Дополнительная колонка слева, если прикладные колонки показываются не сначала
    if (shouldInsertColumnBefore) {
        result.unshift({
            startColumn: 1,
            endColumn: result[0].startColumn
        });
    }

    // Дополнительная колонка справа, если прикладные колонки показываются не до конца
    if (shouldInsertColumnAfter) {
        result.push({
            startColumn: result[result.length - 1].endColumn,
            endColumn: params.gridColumnsCount + 1
        });
    }

    // Колонка под чекбокс
    if (params.hasMultiSelect) {
        result.unshift({
            startColumn: 0,
            endColumn: 1
        });

        // Смещение индексов из за колонки под чекбокс.
        result.forEach((resultColumn) => {
            resultColumn.startColumn++;
            resultColumn.endColumn++;
        });
    }



    return result;
}
