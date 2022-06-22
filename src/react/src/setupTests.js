import { createMockEnvironment } from 'relay-test-utils';

// This ignores the jest global variable from eslint errors.
/* global global */

// Global imports for tests
import '@testing-library/jest-dom/extend-expect';

const environment = createMockEnvironment();

global.router = {
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
    addTransitionHook: jest.fn(),
    addNavigationListener: jest.fn()
};

global.environment = environment;
