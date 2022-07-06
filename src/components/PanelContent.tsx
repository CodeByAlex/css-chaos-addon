import React from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';
import { addons } from '@storybook/addons';
import { useParameter } from "@storybook/api";
import { PARAM_KEY } from "../constants";

let globalCssProps: any [] = [];

const getIframeDoc = () => {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "#storybook-preview-iframe"
  );
  return iframe && iframe.contentWindow && iframe.contentWindow.document ? iframe.contentWindow.document : null;
}

const getForm = () => {
  return document.querySelector("form");
}

const getCSSProps = () => {
  const paramData: any[] = useParameter(PARAM_KEY, null);
  const propnames: string[] = [];
  if (paramData) {
    for (const data of paramData) {
      if (data.name && CSS_PROPS.filter(obj => obj.name === data.name)[0]) {
        if (data.values) {
          CSS_PROPS.filter(obj => obj.name === data.name)[0].values = data.values;
        }
        if (data.description) {
          CSS_PROPS.filter(obj => obj.name === data.name)[0].description = data.description;
        }
        if (data.default) {
          CSS_PROPS.filter(obj => obj.name === data.name)[0].default = data.default;
        }
        propnames.push(data.name);
      }
    }
    if (paramData.filter(obj => !propnames.includes(obj.name))) {
      globalCssProps = [
        ...paramData.filter(obj => !propnames.includes(obj.name)),
        ...CSS_PROPS
      ];
    }
  } else {
    globalCssProps = CSS_PROPS;
  }
}

const setBaseCSS = (cssprops: any[]) => {
  const iframeDoc = getIframeDoc();
  if (iframeDoc && cssprops) {
    let propertyCss = ``;
    for (const prop of cssprops) {
      propertyCss += `${prop.name}: var(--${prop.name});`;
    }
    const css = `body { ${propertyCss} }`;
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
    const propObj: any = globalCssProps.filter(obj => obj.name === el.id)[0];
    (el as any).value = propObj.default;
    updateCSSProps({ name: el.id, value: propObj.default } as any);
  }
}

const initCSSProps = (cssprops: any[]) => {
  cssprops.forEach((obj) => {
    if (obj && obj.name && obj.default) {
      updateCSSProps({ name: obj.name, value: obj.default } as any);
    }
  })
}

export const PanelContent = () => {
  getCSSProps();
  setBaseCSS(globalCssProps)
  initCSSProps(globalCssProps)
  return (
    <div style={{ margin: '16px' }}>
      <Button primary small style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right' }} onClick={randomizePropValues}>Randomize!</Button>
      <Button secondary small style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right', marginRight: '8px' }} onClick={resetPropValues}>Reset</Button>
      <form>
        <div>
          {globalCssProps.sort((a, b) => a.name.localeCompare(b.name)).map(obj => {
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