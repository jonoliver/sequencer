import React from 'react';
import { mount } from 'enzyme';
import Main from '.';
import renderer from 'react-test-renderer';

it('displays the message (snapshot)', () => {
  const tree = renderer
    .create(<Main />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

xit('displays the message (enzyme)', () => {
  const main = mount(<Main />);
  expect(main.find("p").text()).toBe("Hello World!")
});
