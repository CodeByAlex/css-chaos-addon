export const getForm = () => {
    return document.querySelector("form");
}

export const getIframeDoc = () => {
    const iframe = document.querySelector<HTMLIFrameElement>(
        "#storybook-preview-iframe"
    );
    return iframe && iframe.contentWindow && iframe.contentWindow.document ? iframe.contentWindow.document : null;
}

export const getCurrentTimeString = () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}.${date.getSeconds()}.${date.getMilliseconds()}`;
}

export const shuffleArray = (arr: any[]) => {
    return arr
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}

export const getCurrentPropCss = (currentCSSPropMap: Map<String, any>) => {
    let css = '';
    if (currentCSSPropMap) {
        for (const [key, value] of currentCSSPropMap as any) {
            css += `
            ${key}: ${value};`
        }
    }
    return css;
}

export const copyToClipboard = (val: any) => {
    navigator.clipboard.writeText(val);
}

export const addStylesToHead = (css) => {
    const iframeDoc = getIframeDoc();
    if (iframeDoc) {
        const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];
        const style: any = iframeDoc.createElement('style');
        if (style) {
            style.type = 'text/css';
            if (style.styleSheet) {
                // This is required for IE8 and below.
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
        }
        if (head && style) {
            head.appendChild(style);
        }
    }
}