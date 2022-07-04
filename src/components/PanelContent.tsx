import React, { Fragment } from "react";
import { styled, themes, convert } from "@storybook/theming";
import { TabsState, Placeholder, Button } from "@storybook/components";
import { CSS_PROPS } from '../css-props';

export const PanelContent = () => (
  <div>
    {CSS_PROPS.map(obj => {
      const propName = obj.name;
      const propDesc = obj.description;
      const propOptions: String[] = obj.values;
      const propDefaultValue = obj.default;

      return <div>
        <div>Property Name: {propName}</div>
        <div>Property Description: {propDesc}</div>
        <div>Property Default Value: {propDefaultValue}</div>
        {propOptions ?
          <ul>
            {propOptions.map(function (a) {
              return (
                <li>{a}</li>
              );
            })}
          </ul> : null
        }
        <br />
      </div>
    })}
  </div>
);
