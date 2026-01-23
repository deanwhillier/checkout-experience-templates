import {Dispatch} from 'redux';
import {IOrderInitialization} from 'src/types';
import {
    IApiSubrequestSuccessResponse,
    IApiBatchResponse,
    IApiReturnObject,
    sendExternalPaymentGatewayUpdateStateAction,
} from '@boldcommerce/checkout-frontend-library';
import {handleErrorIfNeeded} from 'src/utils';
import {getApplicationStateFromLib, handleBatchSuccess} from 'src/library';

export async function validateBatchResponse(dispatch: Dispatch, getState: () => IOrderInitialization, response: IApiReturnObject): Promise<void> {

    if (!response.success) {
        const batchResponse : IApiBatchResponse = response.response as IApiBatchResponse;
        handleErrorIfNeeded(response, dispatch, getState);
        if (batchResponse && batchResponse.data) {
            batchResponse.data.forEach((subRequest) => {
                if (subRequest.status_code === 200) {
                    handleBatchSuccess(dispatch, getState, subRequest as IApiSubrequestSuccessResponse);
                }
            });
        }
    } else {
        const batchResponse : IApiBatchResponse = response.response as IApiBatchResponse;
        batchResponse.data.forEach( (subRequest) => {
            handleBatchSuccess(dispatch, getState, subRequest as IApiSubrequestSuccessResponse);
        });
    }

    dispatch(getApplicationStateFromLib);
    const state = getState();
    for (const external_payment_gateway of state.data.initial_data.external_payment_gateways) {
        sendExternalPaymentGatewayUpdateStateAction(external_payment_gateway, state.data);
    }
    console.log(
        '[CHECKOUT]', {method: 'validateBatchResponse', state}
    );
}
