import React from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';
import { addons } from '@storybook/addons';
import { useParameter } from "@storybook/api";
import { PARAM_KEY } from "../constants";
import { STORY_CHANGED, SELECT_STORY } from '@storybook/core-events';

let globalCssProps: any[] = [];
let currentCSSPropMap: Map<String, any> = new Map();
let maxVariance: number = null;

const getIframeDoc = () => {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "#storybook-preview-iframe"
  );
  return iframe && iframe.contentWindow && iframe.contentWindow.document ? iframe.contentWindow.document : null;
}

const getForm = () => {
  return document.querySelector("form");
}

const copyCSS = () => {
  let css = '';
  if (currentCSSPropMap) {
    for (const [key, value] of currentCSSPropMap as any) {
      css += `
      ${key}: ${value};`
    }
  }
  navigator.clipboard.writeText(css);
  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.innerHTML = "Copied!";
    setTimeout(() => {
      copyButton.innerHTML = "Copy CSS";
    }, 500);
  }
}

const setMaxVariance = () => {
  maxVariance = useParameter(PARAM_KEY, null) ? useParameter(PARAM_KEY, null).maxVariance : null;
}

const getCSSProps = () => {
  const paramData: any[] = useParameter(PARAM_KEY, null) ? useParameter(PARAM_KEY, null).propertyData : [];
  const propnames: string[] = [];
  if (paramData) {
    for (const data of paramData) {
      const filteredItem = CSS_PROPS.filter(obj => obj.name === data.name)[0];
      if (data.name && filteredItem) {
        if (data.values) {
          filteredItem.values = data.values;
        }
        if (data.description) {
          filteredItem.description = data.description;
        }
        if (data.default) {
          filteredItem.default = data.default;
        }
        propnames.push(data.name);
      }
    }
    const newProps = paramData.filter(obj => !propnames.includes(obj.name));
    if (newProps) {
      globalCssProps = [
        ...newProps,
        ...CSS_PROPS
      ].filter(obj => obj.values.length);
    }
  } else {
    globalCssProps = CSS_PROPS.filter(obj => obj.values.length);
  }
}

const setBaseCSS = (cssprops: any[]) => {
  const iframeDoc = getIframeDoc();
  if (iframeDoc && cssprops) {
    let propertyCss = ``;
    for (const prop of cssprops) {
      propertyCss += `${prop.name}: var(--sb-chaos-${prop.name});`;
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
      root.style.setProperty(`--sb-chaos-${propObj.name}`, propObj.value);
      currentCSSPropMap.set(propObj.name, propObj.value);
    }
  }
}

const formUpdated = (event: any) => {
  //change the existing css var for property type
  updateCSSProps({ name: event.target.id, value: event.target.value } as any);
  setPointer(event.target.id, event.target.value);
}

const setPointer = (propName: string, propValue: any): any => {
  const prop = globalCssProps.filter(obj => propName === obj.name)[0];
  const starEl = document.getElementById(`${propName}-star`);
  if (starEl) {
    starEl.remove();
  }
  if (prop.default != propValue) {
    const dropdownEl = document.getElementById(propName)
    const starEl = document.createElement("span");
    starEl.id = `${propName}-star`;
    starEl.innerHTML = "&#10042;";
    starEl.style.color = "#FF4785";
    starEl.style.fontSize = "15px";
    starEl.style.marginTop = "14px";
    starEl.style.marginLeft = "14px";
    dropdownEl.parentNode.insertBefore(starEl, dropdownEl.nextSibling);
  }
}

const shuffleArray = (arr: any[]) => {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

const randomizePropValues = () => {
  const formElement = getForm();
  const varianceVal = maxVariance ? maxVariance : Array.from(formElement.elements).length;
  let index = 0;
  resetPropValues();
  for (let el of shuffleArray(Array.from(formElement.elements))) {
    if (index < varianceVal) {
      const options = el.children;
      const random = Math.floor(Math.random() * options.length);
      (el as any).value = (options[random] as any).value;
      //change the existing css var for property type
      updateCSSProps({ name: el.id, value: (options[random] as any).value } as any);
      setPointer(el.id, (options[random] as any).value);
    } else {
      break;
    }
    index++;
  }
}

const resetPropValues = () => {
  const formElement = getForm();
  for (const el of Array.from(formElement.elements)) {
    const propObj: any = globalCssProps.filter(obj => obj.name === el.id)[0];
    (el as any).value = propObj.default;
    //change the existing css var for property type
    updateCSSProps({ name: el.id, value: propObj.default } as any);
    setPointer(el.id, propObj.default);
  }
}

const initCSSProps = (cssprops: any[]) => {
  cssprops.forEach((obj) => {
    if (obj && obj.name && obj.default) {
      updateCSSProps({ name: obj.name, value: obj.default } as any);
    }
  })
}

const setupChannelEvents = () => {
  const channel = addons.getChannel();
  channel.on(STORY_CHANGED, () => {
    resetPropValues();
  })
}

export const PanelContent = () => {
  getCSSProps();
  setBaseCSS(globalCssProps)
  initCSSProps(globalCssProps)
  setupChannelEvents();
  setMaxVariance();
  return (
    <div style={{ margin: '16px' }}>
      <div style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right' }}>
        <Button secondary small style={{ marginRight: '8px' }} onClick={resetPropValues}>Reset</Button>
        <Button primary small onClick={randomizePropValues}>Randomize!</Button>
      </div>
      <form>
        <div>
          {globalCssProps.sort((a, b) => a.name.localeCompare(b.name)).map(obj => {
            const propName = obj.name;
            const propDesc = obj.description;
            const propOptions: String[] = obj.values;
            const propDefaultValue = obj.default;

            return <div style={{ marginBottom: '16px' }}>
              <h3>Name: {propName}</h3>
              <h4>Description: {propDesc} (Default: {propDefaultValue})</h4>
              <div style={{ display: 'flex' }}>
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
            </div>
          })}
        </div>
      </form>
      <Button id="copy-button" tertiary small style={{ marginRight: '-16px', bottom: 0, position: 'sticky', zIndex: 100, float: 'right' }} onClick={copyCSS}>Copy CSS</Button>
    </div>
  )
};