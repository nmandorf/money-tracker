import { fireEvent, render, waitFor } from '@testing-library/react-native';

import App from '../../../../App';
import { createMemoryRepository } from '../testUtils/memoryRepository';

const createGroupAndMembers = async (repository = createMemoryRepository()) => {
  const screen = render(<App repository={repository} />);

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

  return screen;
};

describe('manual expense flow', () => {
  it('saves manual equal expense and updates balances', async () => {
    const screen = await createGroupAndMembers();

    fireEvent.press(screen.getByText('Add Expense'));
    await waitFor(() => expect(screen.getByLabelText('Expense Description')).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText('Expense Description'), 'Dinner');
    fireEvent.changeText(screen.getByLabelText('Expense Amount'), '12.00');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => {
      expect(screen.getByText('Dinner')).toBeTruthy();
      expect(screen.getByText('Equal split')).toBeTruthy();
      expect(screen.getByText('6.00')).toBeTruthy();
      expect(screen.getByText('-6.00')).toBeTruthy();
    });
  });

  it('enforces exact 100.00 percent split and renders split metadata', async () => {
    const screen = await createGroupAndMembers();

    fireEvent.press(screen.getByText('Add Expense'));
    await waitFor(() => expect(screen.getByLabelText('Expense Description')).toBeTruthy());
    fireEvent.changeText(screen.getByLabelText('Expense Description'), 'Groceries');
    fireEvent.changeText(screen.getByLabelText('Expense Amount'), '20.00');
    fireEvent.press(screen.getByText('Percent'));
    fireEvent.changeText(screen.getByLabelText('Percent Alice'), '60');
    fireEvent.changeText(screen.getByLabelText('Percent Bob'), '30');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => {
      expect(screen.getByText('Total: 90.00%')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByLabelText('Percent Bob'), '40');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeTruthy();
      expect(screen.getByText('Alice: 60.00%, Bob: 40.00%')).toBeTruthy();
    });
  });

  it('prefills from mock receipt while allowing manual edits', async () => {
    const screen = await createGroupAndMembers();

    fireEvent.press(screen.getByText('Add Expense'));
    await waitFor(() => expect(screen.getByLabelText('Expense Description')).toBeTruthy());

    fireEvent.press(screen.getByText('Attach Mock Receipt'));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Blue Bottle Coffee')).toBeTruthy();
      expect(screen.getByDisplayValue('9.25')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByLabelText('Expense Description'), 'Coffee (Edited)');
    fireEvent.press(screen.getByText('Save Expense'));

    await waitFor(() => {
      expect(screen.getByText('Coffee (Edited)')).toBeTruthy();
    });
  });
});
