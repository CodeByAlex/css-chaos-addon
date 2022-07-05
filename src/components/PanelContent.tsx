import React from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';
import { addons } from '@storybook/addons';

const getIframeDoc = () => {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "#storybook-preview-iframe"
  );
  return iframe && iframe.contentWindow && iframe.contentWindow.document ? iframe.contentWindow.document : null;
}

const getForm = () => {
  return document.querySelector("form");
}

const setBaseCSS = () => {
  const iframeDoc = getIframeDoc();
  if (iframeDoc && CSS_PROPS) {

    let propertyCss = ``;
    for (const prop of CSS_PROPS) {
      propertyCss += `${prop.name}: var(--${prop.name});`;
    }
    const css = `body { ${propertyCss} }`;
    const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];
    const style: any = iframeDoc.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  }
}

const updateCSSProps = (propObj: any) => {
  const iframeDoc = getIframeDoc();
  if (iframeDoc && propObj) {
    const root = iframeDoc.documentElement;
    if (root) {
      root.style.setProperty(`--${propObj.name}`, propObj.value);
    }
  }
}

const formUpdated = (event: any) => {
  //change the existing css var for property type
  updateCSSProps({ name: event.target.id, value: event.target.value } as any);

}

const randomizePropValues = () => {
  const formElement = getForm();
  for (const el of Array.from(formElement.elements)) {
    const options = el.children;
    const random = Math.floor(Math.random() * options.length);
    (el as any).value = (options[random] as any).value;
    //change the existing css var for property type
    updateCSSProps({ name: el.id, value: (options[random] as any).value } as any);
  }
}

const resetPropValues = () => {
  const formElement = getForm();
  for (const el of Array.from(formElement.elements)) {
    //change the existing css var for property type
    const propObj: any = CSS_PROPS.filter(obj => obj.name === el.id)[0];
    (el as any).value = propObj.default;
    updateCSSProps({ name: el.id, value: propObj.default } as any);
  }
}

const initCSSProps = () => {
  CSS_PROPS.forEach((obj) => {
    if (obj && obj.name && obj.default) {
      updateCSSProps({ name: obj.name, value: obj.default } as any);
    }
  })
}

export const PanelContent = () => {
  setBaseCSS()
  initCSSProps()
  return (
    <div style={{ margin: '16px' }}>
      <Button primary small style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right' }} onClick={randomizePropValues}>Randomize!</Button>
      <Button secondary small style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right', marginRight: '4px' }} onClick={resetPropValues}>Reset</Button>
      <form>
        <div>
          {CSS_PROPS.sort((a, b) => a.name.localeCompare(b.name)).map(obj => {
            const propName = obj.name;
            const propDesc = obj.description;
            const propOptions: String[] = obj.values;
            const propDefaultValue = obj.default;

            return <div style={{ marginBottom: '16px' }}>
              <h3>Name: {propName}</h3>
              <div>Description: {propDesc}</div>
              {propOptions ?
                <Form.Select id={propName} style={{ marginTop: '8px' }} defaultValue={propDefaultValue} onChange={formUpdated}>
                  {propOptions.map((value) => {
                    return (
                      <option>{value}</option>
                    );
                  })}
                </Form.Select>
                : null
              }
            </div>
          })}
        </div>
      </form>
    </div>
  )
};