// Set the harnessApi
import {createMockEnvironment} from "relay-test-utils";
import {setHarnessApi} from "../../index";
import React from "react";
import {expect} from "@jest/globals";
import TestRenderer from 'react-test-renderer';
import Login from "../Login";

setHarnessApi({
    getEnvironment: name => {
        return createMockEnvironment();
    }
})

test('Test File Result', () => {
    const renderer = TestRenderer.create(<Login />);
    expect(renderer).toMatchSnapshot();
});
