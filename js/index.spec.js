import React from 'react';
import { mount } from 'enzyme';
import Main from '.';
import renderer from 'react-test-renderer';

it('displays the message (snapshot)', () => {
  const tree = renderer
    .create(<Main message="Hello World!" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('displays the message (enzyme)', () => {
  const main = mount(<Main message="Hello World!" />);
  expect(main.find("p").text()).toBe("Hello World!")
});
