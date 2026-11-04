import {Dispatch} from 'redux';
import {ICartParameters, validateEmail} from '@boldcommerce/checkout-frontend-library';
import {IOrderInitialization} from 'src/types';
import {API_RETRY, EMAIL_NOTE_ATTR_KEY} from 'src/constants';
import {patchOrderMetaData} from 'src/library/patchOrderMetaData';
import {shippingLines} from 'src/library/shippingLines';
import {validateShippingLine} from 'src/library/validateShippingLine';

// The order meta data PATCH can't be told to drop a key, so "removed" is an empty string.
// Consumers should treat '' the same as the attribute being absent.
const REMOVED_VALUE = '';

let patchInFlight = false;

function getCurrentValue(getState: () => IOrderInitialization): string {
    const attributes = getState().data.application_state.order_meta_data?.note_attributes ?? {};
    return (attributes[EMAIL_NOTE_ATTR_KEY] as string | undefined) ?? REMOVED_VALUE;
}

function getTypedEmail(getState: () => IOrderInitialization): string {
    return (getState().data.application_state.customer.email_address ?? '').trim();
}

async function writeAttribute(dispatch: Dispatch, value: string): Promise<void> {
    patchInFlight = true;
    try {
        await dispatch(patchOrderMetaData({
            note_attributes: {[EMAIL_NOTE_ATTR_KEY]: value} as ICartParameters,
            cart_parameters: null,
            notes: null,
            tags: null,
        }));
    } finally {
        patchInFlight = false;
    }
}

/**
 * Called as the shopper types. Note attributes are visible to the shopper, so a previously
 * accepted email must not linger once the field no longer holds it.
 * Only writes when an attribute exists, so ordinary typing makes no requests.
 */
export function clearStaleEmailNoteAttribute(typedValue: string) {
    return async function clearStaleEmailNoteAttributeThunk(dispatch: Dispatch, getState: () => IOrderInitialization): Promise<void> {
        const current = getCurrentValue(getState);
        if (current === REMOVED_VALUE || patchInFlight || current === typedValue.trim()) {
            return;
        }
        await writeAttribute(dispatch, REMOVED_VALUE);
    };
}

/**
 * Called when the email field loses focus, and on load / mount so an email carried over from a
 * previous order (state already holds it, no blur ever happens) still reaches the new order.
 * Writes the typed email to the note attributes
 * only if the API accepts it; otherwise (or if empty) the attribute is removed.
 */
export async function syncEmailNoteAttribute(dispatch: Dispatch, getState: () => IOrderInitialization): Promise<void> {
    const email = getTypedEmail(getState);
    const current = getCurrentValue(getState);

    if (email === REMOVED_VALUE) {
        if (current !== REMOVED_VALUE) {
            await writeAttribute(dispatch, REMOVED_VALUE);
        }
        return;
    }

    if (email === current) {
        return;
    }

    const response = await validateEmail(email, API_RETRY);

    // The shopper kept typing while we validated; the next blur will sync the newer value.
    if (getTypedEmail(getState) !== email) {
        return;
    }

    if (response.success) {
        await writeAttribute(dispatch, email);
        // The shipping override reads this attribute to find the customer's delivery area, so lines
        // already fetched without (or with a different) email are stale. Refetch directly rather than
        // flipping `updatedShippingAddress`: that flag may already be true (e.g. no lines for the area),
        // and the shipping hook may not be mounted on the page the shopper is on. Only needed once a
        // valid shipping address exists; otherwise lines are fetched later with the email set.
        const state = getState();
        if (state.isValid.shippingAddress && state.data.initial_data.requires_shipping) {
            await dispatch(shippingLines(true) as never);
            await dispatch(validateShippingLine as never);
        }
    } else if (getCurrentValue(getState) !== REMOVED_VALUE) {
        await writeAttribute(dispatch, REMOVED_VALUE);
    }
}
