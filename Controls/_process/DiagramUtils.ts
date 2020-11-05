import {IDiagramCategory} from './Diagram';
const PERCENTS = 100;
export function calculateViewData(data: IDiagramCategory[]): number[] {
    const result: number[] = [];

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum = sum + data[i].value;
        result.push(data[i].value);
    }

    for (let i = 0; i < result.length; i++) {
        let curValue: number;
        curValue = result[i] / sum * PERCENTS;
    }

    return result;
}
