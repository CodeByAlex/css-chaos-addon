import React, { Fragment } from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';


const getIframeDoc = () => {
  const iframe = document.querySelector<HTMLIFrameElement>(
    "#storybook-preview-iframe"
  );
  return iframe && iframe.contentWindow && iframe.contentWindow.document ? iframe.contentWindow.document : null;
}

const getForm = () => {
  return document.querySelector("form");
}

const updateCSSProps = (propObj: any) => {
  const iframeDoc = getIframeDoc();
  if (iframeDoc && propObj) {
    const root = iframeDoc.documentElement;
    if (root) {
      root.style.setProperty(`--${propObj.name}`, propObj.value);
      console.log('set', `--${propObj.name}`)
    }
    console.log(root.style)
  }
}

const formUpdated = (event: any) => {
  console.log(event)
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

const initCSSProps = () => {
  CSS_PROPS.forEach((obj) => {
    if (obj && obj.name && obj.default) {
      updateCSSProps({ name: obj.name, value: obj.default } as any);
    }
  })
}

export const PanelContent = () => {
  initCSSProps()
  return (
    <div style={{ margin: '16px' }}>
      <Button primary small style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right' }} onClick={randomizePropValues}>Randomize!</Button>
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

// Form usage: https://github.com/storybookjs/storybook/blob/main/lib/components/src/form/form.stories.tsx