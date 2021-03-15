import { createMockEnvironment } from 'relay-test-utils';
import { setHarnessApi } from '../../index';
import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import TestRenderer from 'react-test-renderer';
import Login from '../Login';

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

describe('loginTests', () => {
    it('login page renders correctly for gwlab', () => {
        expect.hasAssertions();

        // Set the harnessApi
        setHarnessApi({
            getEnvironment: () => createMockEnvironment(),
            isGwLab: () => true
        });

        const renderer = TestRenderer.create(<Login router={router} match={{}}/>);
        expect(renderer).toMatchSnapshot();
    });

    it('login page renders correctly for gwcloud', () => {
        expect.hasAssertions();

        // Set the harnessApi
        setHarnessApi({
            getEnvironment: () => createMockEnvironment(),
            isGwLab: () => false
        });

        const renderer = TestRenderer.create(<Login router={router} match={{}}/>);
        expect(renderer).toMatchSnapshot();
    });
});