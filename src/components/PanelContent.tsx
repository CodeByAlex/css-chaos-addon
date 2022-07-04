import React, { Fragment } from "react";
import { styled, themes, convert } from "@storybook/theming";
import { Placeholder, Button, Form } from "@storybook/components";
import { CSS_PROPS } from '../css-props';


const randomizePropValues = () => {
  console.log('randomizePropValues')
}

export const PanelContent = () => (
  <div style={{ margin: '16px'}}>
    <Button primary small style={{ position: 'sticky', top: 16, zIndex: 100, float: 'right'}} onClick={randomizePropValues}>Randomize!</Button>
    <div>
      {CSS_PROPS.sort((a, b) => a.name.localeCompare(b.name)).map(obj => {
        const propName = obj.name;
        const propDesc = obj.description;
        const propOptions: String[] = obj.values;
        const propDefaultValue = obj.default;

        return <div>
          <h3>Name: {propName}</h3>
          <div>Description: {propDesc}</div>
          {propOptions ?
            <Form.Select defaultValue={propDefaultValue}>
              {propOptions.map(function (a) {
                return (
                  <option>{a}</option>
                );
              })}
            </Form.Select>
            : null
          }
          <br />
          <br />
        </div>
      })}
    </div>
  </div >
);

// Form usage: https://github.com/storybookjs/storybook/blob/main/lib/components/src/form/form.stories.tsx