import { fireEvent, render, waitFor } from '@testing-library/react-native';

import App from '../../../../App';
import { createMemoryRepository } from '../testUtils/memoryRepository';

describe('groups persistence E2E flow', () => {
  it('persists groups/members across app restart with same repository state', async () => {
    const repository = createMemoryRepository();
    const firstRender = render(<App repository={repository} />);

    fireEvent.press(firstRender.getByText('Create Group'));
    fireEvent.changeText(firstRender.getByLabelText('Group Name'), 'Weekend Trip');
    fireEvent.press(firstRender.getByText('Save Group'));

    await waitFor(() => {
      expect(firstRender.getByText('Group: Weekend Trip')).toBeTruthy();
    });

    fireEvent.press(firstRender.getByText('Add Member'));
    fireEvent.changeText(firstRender.getByLabelText('Member Name'), 'Noa');
    fireEvent.press(firstRender.getByText('Save Member'));

    await waitFor(() => {
      expect(firstRender.getByText('Noa')).toBeTruthy();
    });

    firstRender.unmount();
    const secondRender = render(<App repository={repository} />);

    await waitFor(() => {
      expect(secondRender.getByText('Weekend Trip')).toBeTruthy();
    });
  });
});
