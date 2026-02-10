import React from 'react';
import {SummaryTotals, CartItems, LifeFields} from 'src/components';
import {useCartSummary, useGetLifeFields} from 'src/hooks';
import {LifeInputLocationConstants} from 'src/constants';
import classNames from 'classnames';
import {ISummarySection} from 'src/types/propsInterface';

export function SummarySection (props: ISummarySection) : React.ReactElement {
    // const {expandSummary, showSummary, toggleSummary, totals, lineItems, summaryAriaLabel, formattedPrice} = useCartSummary();
    const {toggleSummary, lineItems, summaryAriaLabel} = useCartSummary();
    const summaryAboveHeaderLifeFields  = useGetLifeFields(LifeInputLocationConstants.SUMMARY_ABOVE_HEADER);
    const summaryAboveHeaderLifeFieldsClassNames = classNames(['summary__life-fields', 'summary-above-header-life-elements']);

    // const classes = classNames([
    //     'summary__cart--expand',
    //     expandSummary ? 'block__summary-cart--collapse' : ''
    // ]);

    return (
        <div className={'summary-section'}>
            {summaryAboveHeaderLifeFields.length ? <LifeFields className={summaryAboveHeaderLifeFieldsClassNames} lifeFields={summaryAboveHeaderLifeFields}/> : null}
            <aside className={'summary'} data-testid={'CartSummary'} aria-label={summaryAriaLabel}>
                {/* <button className={'summary__cart-icon'} onClick={toggleSummary} data-testid={'summary__cart-icon'}>
                    <span data-testid={'summary__cart--expand'} className={classes} >&nbsp;</span>
                </button> */}
                <div className={'summary__cart-title'} onClick={toggleSummary} data-testid={'summary__cart-total'}>
                    <h2 className={'cart-summary__title-content'} data-testid={'summary__cart-total-title'}>Summary</h2>
                    {/* <Price amount={totals} moneyFormatString={formattedPrice} className={'summary__cart-price'} data-testid={'summary__cart-total-price'}/> */}
                </div>
                {/* <SummaryTotals orderCompleted={props.orderCompleted}/> */}
                <SummaryTotals/>
                <CartItems line_items={lineItems}/>
                {/* {showSummary && <SummaryTotals orderCompleted={props.orderCompleted}/>} */}
                {/* {showSummary && !props.orderCompleted && <SummaryDiscountCode />} */}
                {/* {showSummary && <CartItems line_items={lineItems}/>} */}
            </aside>
        </div>
    );
}

