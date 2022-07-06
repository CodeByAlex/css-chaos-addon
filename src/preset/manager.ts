import { addons, types } from "@storybook/addons";

import { ADDON_ID, TOOL_ID, PANEL_ID, TAB_ID } from "../constants";
import { Panel } from "../Panel";

// Register the addon
addons.register(ADDON_ID, () => {
  // Register the panel
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "CSS Chaos Tester",
    match: ({ viewMode }) => viewMode === "story",
    render: Panel,
  });

});
