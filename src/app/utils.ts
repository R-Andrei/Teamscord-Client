export const getTextWidth = (text: string): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
        context.font = getComputedStyle(document.body).font;

        return context.measureText(text).width;
    }
    return -1;
}