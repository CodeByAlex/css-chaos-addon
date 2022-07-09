import { PARAM_KEY } from "../../constants";
import { useParameter } from "@storybook/api";

export const getMaxVariance = () => {
    return useParameter(PARAM_KEY, null) ? useParameter(PARAM_KEY, null).maxVariance : null;
}

export const getShowHistory = () => {
    return useParameter(PARAM_KEY, null) ? useParameter(PARAM_KEY, null).showHistory : true;
}

export const getPropertyData = () => {
    return useParameter(PARAM_KEY, null) ? useParameter(PARAM_KEY, null).propertyData : [];
}