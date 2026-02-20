import { fireEvent, render, waitFor } from '@testing-library/react-native';

import App from '../App';
import { createMemoryRepository } from '../src/features/groups/testUtils/memoryRepository';

describe('Groups app flow', () => {
  it('creates a group and shows detail screen', async () => {
    const repository = createMemoryRepository();
    const { getByText, getByLabelText } = render(<App repository={repository} />);

    fireEvent.press(getByText('Create Group'));
    fireEvent.changeText(getByLabelText('Group Name'), 'Trip');
    fireEvent.press(getByText('Save Group'));

    await waitFor(() => {
      expect(getByText('Group: Trip')).toBeTruthy();
    });
  });

  it('rejects duplicate member names in a group', async () => {
    const repository = createMemoryRepository();
    const { getByText, getByLabelText } = render(<App repository={repository} />);

    fireEvent.press(getByText('Create Group'));
    fireEvent.changeText(getByLabelText('Group Name'), 'House');
    fireEvent.press(getByText('Save Group'));

    await waitFor(() => {
      expect(getByText('Add Member')).toBeTruthy();
    });

    fireEvent.press(getByText('Add Member'));
    fireEvent.changeText(getByLabelText('Member Name'), 'Alex');
    fireEvent.press(getByText('Save Member'));

    await waitFor(() => {
      expect(getByText('Alex')).toBeTruthy();
    });

    fireEvent.press(getByText('Add Member'));
    fireEvent.changeText(getByLabelText('Member Name'), 'Alex');
    fireEvent.press(getByText('Save Member'));

    await waitFor(() => {
      expect(getByText('Member name already exists in this group.')).toBeTruthy();
    });
  });
});
