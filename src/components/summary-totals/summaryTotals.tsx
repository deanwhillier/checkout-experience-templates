import React from 'react';
import {Constants} from 'src/constants';
import {getTotals, getTerm} from 'src/utils';
import {SummaryLineExpandable, SummaryLineNonExpandable} from 'src/components';
import {REMOVE_DISCOUNT, REMOVE_PAYMENT} from 'src/action/appActionType';
import {
    useGetDiscounts,
    useGetLineItems,
    useGetPayments,
    useGetSelectShippingLine,
    useGetTaxes,
    useGetFees,
    useGetOrderTotal,
    useGetRequiresShipping,
} from 'src/hooks';
import {ISummaryTotals} from 'src/types';

export function SummaryTotals(props: ISummaryTotals): React.ReactElement {
    const discounts = useGetDiscounts();
    const fees = useGetFees();
    const payments = useGetPayments();
    const taxes = useGetTaxes();
    const shipping = useGetSelectShippingLine();
    const lineItems = useGetLineItems();
    const orderTotal = useGetOrderTotal();
    const requiresShipping = useGetRequiresShipping();
    const totals = getTotals(lineItems, payments, taxes, fees, discounts, orderTotal);

    // disable until needed
    // const discountSection = <SummaryLineExpandable
    //     hasList
    //     hasDeleteButton={!props.orderCompleted}
    //     content={discounts}
    //     eventToggleName={Constants.DISCOUNTS_TOGGLE}
    //     total={totals.totalDiscounts}
    //     title={getTerm('discounts', Constants.SUMMARY_INFO)}
    //     eventDeleteName={REMOVE_DISCOUNT}
    // />;

    // disable until needed
    // const feesSection = <SummaryLineExpandable
    //     hasList
    //     hasDeleteButton={false}
    //     content={fees}
    //     eventToggleName={Constants.FEES_TOGGLE}
    //     total={totals.totalAdditionalFees}
    //     title={getTerm('fees', Constants.SUMMARY_INFO)}
    // />;

    const paymentSection = <SummaryLineExpandable
        hasBottom
        hasList
        hasDeleteButton={!props.orderCompleted}
        content={payments}
        eventToggleName={Constants.PAYMENTS_TOGGLE}
        total={totals.totalPaid}
        title={getTerm('payments', Constants.SUMMARY_INFO)}
        eventDeleteName={REMOVE_PAYMENT}
    />;

    const amountDueSection = <SummaryLineNonExpandable
        eventName={Constants.AMOUNT_DUE_EVENT}
        hasBottom
        name={getTerm('amount_remaining',Constants.SUMMARY_INFO)}
        total={totals.totalAmountDue}
    />;

    const shippingSection = <SummaryLineNonExpandable
        eventName={Constants.SHIPPING_TOGGLE}
        name={getTerm('shipping',Constants.SUMMARY_INFO)}
        total={shipping.amount}
    />;
    // disable until needed
    // const shippingSection = <SummaryLineExpandable
    //     hasList
    //     content={[shipping]}
    //     eventToggleName={Constants.SHIPPING_TOGGLE}
    //     total={shipping.amount}
    //     title={getTerm('shipping',Constants.SUMMARY_INFO)}
    // />;

    return (
        <div className={'taxes-amount'} data-testid={'summary-totals__lines'}>
            <SummaryLineNonExpandable
                eventName={Constants.SUBTOTAL_EVENT}
                name={getTerm('subtotal',Constants.SUMMARY_INFO)}
                total={totals.totalSubtotal}
            />

            {requiresShipping && shippingSection}

            {/* disable until needed */}
            {/* {discounts && discounts.length > 0 && discountSection} */}

            {/* disable until needed */}
            {/* {fees && fees.length > 0 && feesSection} */}

            <SummaryLineNonExpandable
                hasBottom
                eventName={Constants.TAXES_TOGGLE}
                name={getTerm('taxes',Constants.SUMMARY_INFO)}
                total={totals.totalTaxes}
            />
            {/* disable until needed */}
            {/* <SummaryLineExpandable
                hasBottom
                hasList
                content={taxes}
                eventToggleName={Constants.TAXES_TOGGLE}
                total={totals.totalTaxes}
                title={getTerm('taxes',Constants.SUMMARY_INFO)}
            /> */}

            <SummaryLineNonExpandable
                eventName={Constants.TOTAL_EVENT}
                hasBottom
                name={getTerm('total',Constants.SUMMARY_INFO)}
                total={totals.totalOrder}
            />

            {payments && payments.length > 0 && paymentSection}

            {payments && payments.length > 0 && amountDueSection}
        </div>
    );
}
