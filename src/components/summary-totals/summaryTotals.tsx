import React from 'react';
import {Constants} from 'src/constants';
import {getTotals, getTerm} from 'src/utils';
import {SummaryLineNonExpandable} from 'src/components';
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

    // disable until needed
    // const paymentSection = <SummaryLineExpandable
    //     hasBottom
    //     hasList
    //     hasDeleteButton={!props.orderCompleted}
    //     content={payments}
    //     eventToggleName={Constants.PAYMENTS_TOGGLE}
    //     total={totals.totalPaid}
    //     title={getTerm('payments', Constants.SUMMARY_INFO)}
    //     eventDeleteName={REMOVE_PAYMENT}
    // />;

    // disable until needed
    // const amountDueSection = <SummaryLineNonExpandable
    //     eventName={Constants.AMOUNT_DUE_EVENT}
    //     hasBottom
    //     name={getTerm('amount_remaining',Constants.SUMMARY_INFO)}
    //     total={totals.totalAmountDue}
    // />;

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

    const estimatedTax = Math.round((totals.totalSubtotal + shipping.amount) * 0.13 * 100) / 100; // assume Ontario tax rate for estimation
    const taxesAreEstimated = totals.totalTaxes === 0;
    const finalTaxes = !taxesAreEstimated ? totals.totalTaxes : estimatedTax;
    const finalTaxesLabel = !taxesAreEstimated ? getTerm('taxes',Constants.SUMMARY_INFO) : `${getTerm('taxes',Constants.SUMMARY_INFO)} (estimated)`;

    const taxesSection = <SummaryLineNonExpandable
        hasBottom
        eventName={Constants.TAXES_TOGGLE}
        name={finalTaxesLabel}
        total={finalTaxes}
    />;

    const finalTotal = taxesAreEstimated ? totals.totalSubtotal + shipping.amount + estimatedTax : totals.totalOrder;

    const totalSection = <SummaryLineNonExpandable
        eventName={Constants.TOTAL_EVENT}
        hasBottom
        name={getTerm('total',Constants.SUMMARY_INFO)}
        total={finalTotal}
    />;

    return (
        <div className={'taxes-amount'} data-testid={'summary-totals__lines'}>
            <SummaryLineNonExpandable
                eventName={Constants.SUBTOTAL_EVENT}
                name={getTerm('subtotal',Constants.SUMMARY_INFO)}
                total={totals.totalSubtotal}
            />
            {/* disable until needed */}
            {/* {discounts && discounts.length > 0 && discountSection} */}

            {/* disable until needed */}
            {/* {fees && fees.length > 0 && feesSection} */}

            { taxesSection
            }
            {/* disable until needed */}
            {/* <SummaryLineExpandable
                hasBottom
                hasList
                content={taxes}
                eventToggleName={Constants.TAXES_TOGGLE}
                total={totals.totalTaxes}
                title={getTerm('taxes',Constants.SUMMARY_INFO)}
            /> */}

            {requiresShipping && shippingSection}

            { totalSection }

            {/* disable until needed */}
            {/* {payments && payments.length > 0 && paymentSection} */}

            {/* disable until needed */}
            {/* {payments && payments.length > 0 && amountDueSection} */}
        </div>
    );
}
