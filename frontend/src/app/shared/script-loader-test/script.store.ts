interface Scripts {
    name: string;
    src: string;
}

export const StyleStore: Scripts[] = [
    { name: 'fancybox-css', src: 'https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css' }
];

export const ScriptStore: Scripts[] = [
    { name: 'jquery', src: 'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js' },
    { name: 'other', src: '[other script source]'}
];