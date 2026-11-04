import {baseReturnObject, validateEmail} from '@boldcommerce/checkout-frontend-library';
import {mocked} from 'jest-mock';
import {EMAIL_NOTE_ATTR_KEY} from 'src/constants';
import {clearStaleEmailNoteAttribute, patchOrderMetaData, syncEmailNoteAttribute} from 'src/library';
import {shippingLines} from 'src/library/shippingLines';
import {validateShippingLine} from 'src/library/validateShippingLine';
import {stateMock} from 'src/mocks/stateMock';

jest.mock('@boldcommerce/checkout-frontend-library/lib/customer');
jest.mock('src/library/patchOrderMetaData');
jest.mock('src/library/shippingLines');
jest.mock('src/library/validateShippingLine');
const shippingLinesMock = mocked(shippingLines, true);
const validateEmailMock = mocked(validateEmail, true);
const patchMock = mocked(patchOrderMetaData, true);

function stateWith(email: string, attribute?: string) {
    const state = JSON.parse(JSON.stringify(stateMock));
    state.data.application_state.customer.email_address = email;
    state.data.application_state.order_meta_data.note_attributes = attribute === undefined ? {} : {[EMAIL_NOTE_ATTR_KEY]: attribute};
    return state;
}

const expectedPayload = (value: string) => ({
    note_attributes: {[EMAIL_NOTE_ATTR_KEY]: value}, cart_parameters: null, notes: null, tags: null,
});

describe('syncEmailNoteAttribute', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        patchMock.mockReturnValue('thunk' as never);
    });

    test('writes the typed email once the API accepts it', async () => {
        getState.mockReturnValue(stateWith('a@b.com'));
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: true});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(patchMock).toHaveBeenCalledWith(expectedPayload('a@b.com'));
    });

    test('refetches shipping lines when a valid shipping address exists', async () => {
        const state = stateWith('a@b.com');
        state.isValid.shippingAddress = true;
        state.data.initial_data.requires_shipping = true;
        getState.mockReturnValue(state);
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: true});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(shippingLinesMock).toHaveBeenCalledWith(true);
        expect(dispatch).toHaveBeenCalledWith(validateShippingLine);
    });

    test('does not refetch shipping when the order does not require shipping', async () => {
        const state = stateWith('a@b.com');
        state.isValid.shippingAddress = true;
        state.data.initial_data.requires_shipping = false;
        getState.mockReturnValue(state);
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: true});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(shippingLinesMock).not.toHaveBeenCalled();
    });

    test('does not refetch shipping when there is no valid shipping address yet', async () => {
        const state = stateWith('a@b.com');
        state.isValid.shippingAddress = false;
        getState.mockReturnValue(state);
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: true});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(shippingLinesMock).not.toHaveBeenCalled();
    });

    test('does nothing when the attribute already holds the email', async () => {
        getState.mockReturnValue(stateWith('a@b.com', 'a@b.com'));
        await syncEmailNoteAttribute(dispatch, getState);
        expect(validateEmailMock).not.toHaveBeenCalled();
        expect(patchMock).not.toHaveBeenCalled();
    });

    test('removes a stored email when the new value is rejected', async () => {
        getState.mockReturnValue(stateWith('bad', 'a@b.com'));
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: false});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(patchMock).toHaveBeenCalledWith(expectedPayload(''));
    });

    test('does not write when the email is rejected and nothing is stored', async () => {
        getState.mockReturnValue(stateWith('bad'));
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: false});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(patchMock).not.toHaveBeenCalled();
    });

    test('removes a stored email when the field is cleared, without validating', async () => {
        getState.mockReturnValue(stateWith('  ', 'a@b.com'));
        await syncEmailNoteAttribute(dispatch, getState);
        expect(validateEmailMock).not.toHaveBeenCalled();
        expect(patchMock).toHaveBeenCalledWith(expectedPayload(''));
    });

    test('discards the result if the shopper kept typing during validation', async () => {
        getState.mockReturnValueOnce(stateWith('a@b.com')).mockReturnValueOnce(stateWith('a@b.com'))
            .mockReturnValue(stateWith('a@b.com2'));
        validateEmailMock.mockResolvedValue({...baseReturnObject, success: true});
        await syncEmailNoteAttribute(dispatch, getState);
        expect(patchMock).not.toHaveBeenCalled();
    });
});

describe('clearStaleEmailNoteAttribute', () => {
    const dispatch = jest.fn();
    const getState = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
        patchMock.mockReturnValue('thunk' as never);
    });

    test('makes no request while nothing is stored', async () => {
        getState.mockReturnValue(stateWith('a'));
        await clearStaleEmailNoteAttribute('a')(dispatch, getState);
        expect(patchMock).not.toHaveBeenCalled();
    });

    test('removes the stored email once the field differs from it', async () => {
        getState.mockReturnValue(stateWith('a@b.co', 'a@b.com'));
        await clearStaleEmailNoteAttribute('a@b.co')(dispatch, getState);
        expect(patchMock).toHaveBeenCalledWith(expectedPayload(''));
    });

    test('keeps the stored email while the field still matches it', async () => {
        getState.mockReturnValue(stateWith('a@b.com', 'a@b.com'));
        await clearStaleEmailNoteAttribute('a@b.com')(dispatch, getState);
        expect(patchMock).not.toHaveBeenCalled();
    });
});
