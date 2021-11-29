import React from 'react';
import { shallow } from 'enzyme';
import Landing from '../Landing';

describe('Landing Component', () => {
    const landingComponent = shallow(<Landing />);

    it('can be mounted', () => {
        expect(landingComponent).not.toBeNull();
    });

    it('has placeholder text', () => {
        const container = landingComponent.find('div').at(0);
        const placeholder = container.text();
        expect(placeholder).toEqual('Hello World');
    });
});
