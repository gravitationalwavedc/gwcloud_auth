import {setHarnessApi, harnessApi} from "./index";
import {createMockEnvironment} from "relay-test-utils";
import {expect} from "@jest/globals";

const newApi = {
    getEnvironment: name => {
        return createMockEnvironment();
    },
    currentProject: () => ''
}

// Test setHarnessApi
test('setHarnessApi works correctly', () => {
    // Check that it is initially null
    expect(harnessApi).toBe(null);

    // Set the harness api to our test api
    setHarnessApi(newApi);

    // Confirm that the harnessApi is now correct
    expect(harnessApi).toBe(newApi);
});
