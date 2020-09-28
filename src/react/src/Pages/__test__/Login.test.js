// Set the harnessApi
import {createMockEnvironment} from "relay-test-utils";
import {setHarnessApi} from "../../index";
import React from "react";
import {expect} from "@jest/globals";
import TestRenderer from 'react-test-renderer';
import Login from "../Login";

setHarnessApi({
    getEnvironment: () => {
        return createMockEnvironment();
    }
})
// router={{createHref: () => {}, createLocation: () => {}}}

test('Test File Result', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    createHref: jest.fn(),
    createLocation: jest.fn(),
    isActive: jest.fn(),
    matcher: {
      match: jest.fn(),
      getRoutes: jest.fn(),
      isActive: jest.fn(),
      format: jest.fn()
    },
    addTransitionHook: jest.fn()
  };
  const renderer = TestRenderer.create(<Login router={router}  match={{}} />);
    expect(renderer).toMatchSnapshot();
});
