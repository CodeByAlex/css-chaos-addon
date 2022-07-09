import React from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';
import { addons } from '@storybook/addons';
import { STORY_CHANGED, SELECT_STORY } from '@storybook/core-events';
import * as utils from './utils/utils';
import * as params from './utils/params';

let globalCssProps: any[] = [];
let currentCSSPropMap: Map<String, any> = new Map();
let history: Map<String, any> = new Map();
let maxVariance: number = null;
let showHistory = true;
let propertyData: any[] = [];

const copyCSS = () => {
  utils.copyToClipboard(utils.getCurrentPropCss(currentCSSPropMap))
  const copyButton = document.getElementById('copy-button');
  if (copyButton) {
    copyButton.innerHTML = "Copied!";
    setTimeout(() => {
      copyButton.innerHTML = "Copy CSS";
    }, 500);
  }
}

const getCSSProps = () => {
  const propnames: string[] = [];
  if (propertyData) {
    for (const data of propertyData) {
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
    const newProps = propertyData.filter(obj => !propnames.includes(obj.name));
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
  if (cssprops) {
    let propertyCss = ``;
    for (const prop of cssprops) {
      propertyCss += `${prop.name}: var(--sb-chaos-${prop.name});`;
    }
    utils.addStylesToHead(`html { ${propertyCss} }`);
  }
}

const updateCSSProps = (propObj: any) => {
  const iframeDoc = utils.getIframeDoc();
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
  if (showHistory) {
    setHistorySelect();
  }
}

const setPointer = (propName: string, propValue: any): any => {
  const prop = globalCssProps.filter(obj => propName === obj.name)[0];
  const starEl = document.getElementById(`${propName}-star`);
  if (starEl) {
    starEl.remove();
  }
  if (prop && prop.default != propValue) {
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

const randomizePropValues = () => {
  const formElement = utils.getForm();
  const varianceVal = maxVariance ? maxVariance : Array.from(formElement.elements).length;
  resetPropValues();
  let index = 0;
  for (let el of utils.shuffleArray(Array.from(formElement.elements))) {
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
  if (showHistory) {
    setHistorySelect();
  }
}

const resetPropValues = () => {
  const formElement = utils.getForm();
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
    if (showHistory) {
      resetHistory();
    }
  })
}

const setHistorySelect = () => {
  addToHistory();
  const historySelect = document.getElementById("history-select");
  historySelect.innerHTML = '';
  const iterableHistoryMap = [...history].sort().reverse();
  let index = 0
  for (const [key, value] of iterableHistoryMap as any) {
    const newOption = document.createElement('option');
    if (index === 0) {
      newOption.innerHTML = 'Current';
      newOption.value = key;
    } else {
      newOption.innerHTML = `Time: ${key}`;
      newOption.value = key;
    }
    historySelect.appendChild(newOption);
    index++;
  }
}

const addToHistory = () => {
  history.set(utils.getCurrentTimeString(), new Map(currentCSSPropMap));
}

const resetHistory = () => {
  const historySelect = document.getElementById("history-select");
  historySelect.innerHTML = '';
  const newOption = document.createElement('option');
  newOption.innerHTML = 'Current';
  newOption.value = null;
  historySelect.appendChild(newOption);
  history = new Map();
}

const setHistoricalProps = (event: any) => {
  //change the existing css var for property type
  const historicalPropMap = history.get(event.target.value);
  if (historicalPropMap) {
    const formElement = utils.getForm();
    resetPropValues();
    for (let el of Array.from(formElement.elements)) {
      (el as any).value = historicalPropMap.get(el.id);
      updateCSSProps({ name: el.id, value: historicalPropMap.get(el.id) } as any);
      setPointer(el.id, historicalPropMap.get(el.id));
    }
  }
}

export const PanelContent = () => {
  getCSSProps();
  setBaseCSS(globalCssProps)
  initCSSProps(globalCssProps)
  setupChannelEvents();
  maxVariance = params.getMaxVariance();
  showHistory = params.getShowHistory();
  propertyData = params.getPropertyData();

  return (
    <div style={{ margin: '16px' }}>
      <div style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right' }}>
        <div>
          <Button secondary small style={{ marginRight: '8px' }} onClick={resetPropValues}>Reset</Button>
          <Button primary small onClick={randomizePropValues}>Randomize!</Button>
        </div>
        {showHistory ?
          <div>
            <h4 style={{ marginBottom: '-4px', fontWeight: 'bold', marginLeft: '2px', marginTop: '4px' }}>History</h4>
            <Form.Select id="history-select" style={{ marginTop: '8px', width: "177px" }} defaultValue='Current' onChange={setHistoricalProps}>
              <option>Current</option>
            </Form.Select>
          </div>
          : null
        }
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