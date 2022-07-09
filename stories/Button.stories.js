import React from "react";
import { Button } from "./Button";

export default {
  title: "Example/Button",
  component: Button,
  parameters: {
    cssChaos: {
      maxVariance: 5,
      showHistory: false,
      propertyData:
        [
          {
            "name": "hello world",
            "description": "Lorem ipsum",
            "default": "world",
            "values": [
              "hello",
              "world"
            ]
          },
          {
            "name": "caption-side",
            "description": "Specifies the placement of a table caption. Overwritten",
            "default": "hello",
            "values": [
              "hello",
              "world"
            ]
          },
          {
            "name": "direction",
            "values": []
          },
        ]
    }
    ,
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: "Button",
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: "Button",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
  label: "Button",
};

export const Small = Template.bind({});
Small.args = {
  size: "small",
  label: "Button",
};
