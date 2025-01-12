export enum LayoutType {
    Pocketmod = "Pocketmod",
    Pocketfold = "Pocketfold",
}

export interface LayoutPage {
    page: number,
    isReversed?: boolean;
}

export interface Layout {
    method: string;
    data: LayoutPage[];
}

export const Layouts: Layout[] = [
    { method: LayoutType.Pocketmod,
        data: [
            {page: 2},
            {page: 3},
            {page: 4},
            {page: 5},
            {page: 1, isReversed: true},
            {page: 8, isReversed: true},
            {page: 7, isReversed: true},
            {page: 6, isReversed: true}
        ]},
    { method: LayoutType.Pocketfold,
        data: [
            {page: 7, isReversed: true},
            {page: 6, isReversed: true},
            {page: 5, isReversed: true},
            {page: 4, isReversed: true},
            {page: 3},
            {page: 8},
            {page: 1},
            {page: 2}
        ]}
]

export enum PaperType {
    A4="A4",
    Letter="Letter",
}

export interface PaperOption {
    type: PaperType;
    data: {
        width: number;
        height: number;
    }
}

export const PaperOptions: PaperOption[] = [
    {   type: PaperType.A4,
        data: {
            width: 3508,
            height: 2480
        }
    },
    {
        type: PaperType.Letter,
        data: {
           width: 3300,
           height: 2550
        }
    }
]