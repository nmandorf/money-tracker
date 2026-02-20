import { render } from '@testing-library/react-native';

import App from '../App';

describe('App placeholder screen', () => {
  it('renders the placeholder title', () => {
    const { getByText } = render(<App />);
    expect(getByText('Money Tracker Mobile')).toBeTruthy();
  });

  it('renders the quality gate subtitle', () => {
    const { getByText } = render(<App />);
    expect(getByText('Milestone 01: Foundation setup complete.')).toBeTruthy();
  });
});
