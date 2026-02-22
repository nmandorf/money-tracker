import { fireEvent, render, waitFor } from '@testing-library/react-native';

import App from '../../../../App';
import { createMemoryRepository } from '../testUtils/memoryRepository';

describe('settle up flow', () => {
  it('shows deterministic transfers derived from balances', async () => {
    const screen = render(<App repository={createMemoryRepository()} />);

    fireEvent.press(screen.getByText('Create Group'));
    fireEvent.changeText(screen.getByLabelText('Group Name'), 'Trip');
    fireEvent.press(screen.getByText('Save Group'));
    await waitFor(() => expect(screen.getByText('Group: Trip')).toBeTruthy());

    fireEvent.press(screen.getByText('Add Member'));
    fireEvent.changeText(screen.getByLabelText('Member Name'), 'Alice');
    fireEvent.press(screen.getByText('Save Member'));
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy());

    fireEvent.press(screen.getByText('Add Member'));
    fireEvent.changeText(screen.getByLabelText('Member Name'), 'Bob');
    fireEvent.press(screen.getByText('Save Member'));
    await waitFor(() => expect(screen.getByText('Bob')).toBeTruthy());

    fireEvent.press(screen.getByText('Add Expense'));
    await waitFor(() => expect(screen.getByLabelText('Expense Description')).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText('Expense Description'), 'Hotel');
    fireEvent.changeText(screen.getByLabelText('Expense Amount'), '40.00');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => expect(screen.getByText('Hotel')).toBeTruthy());

    fireEvent.press(screen.getByText('Settle Up'));

    await waitFor(() => {
      expect(screen.getByText('Bob -> Alice')).toBeTruthy();
      expect(screen.getByText('$20.00')).toBeTruthy();
    });
  });
});
