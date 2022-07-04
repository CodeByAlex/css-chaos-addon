import React, { Fragment } from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';


const getForm = () => {
  return document.querySelector("form");
}

const randomizePropValues = () => {
  const formElement = getForm();
  for (const el of Array.from(formElement.elements)) {
    const options = el.children;
    const random = Math.floor(Math.random() * options.length);
    (el as any).value = (options[random] as any).value;
  }
}

export const PanelContent = () => (
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
              <Form.Select style={{ marginTop: '8px' }} defaultValue={propDefaultValue}>
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
  </div >
);

// Form usage: https://github.com/storybookjs/storybook/blob/main/lib/components/src/form/form.stories.tsx