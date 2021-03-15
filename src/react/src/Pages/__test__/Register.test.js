import { createMockEnvironment } from 'relay-test-utils';
import { setHarnessApi } from '../../index';
import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import TestRenderer from 'react-test-renderer';
import Register from '../Register';

// Set the harnessApi
setHarnessApi({
    getEnvironment: () => createMockEnvironment()
});

describe('registerTests', () => {
    it('register page renders correctly', () => {
        expect.hasAssertions();

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
            addTransitionHook: jest.fn(),
            addNavigationListener: jest.fn()
        };
        const renderer = TestRenderer.create(<Register router={router} match={{}}/>);
        expect(renderer).toMatchSnapshot();
    });
});