import React from 'react';
import {SummaryTotals, CartItems, LifeFields} from 'src/components';
import {useCartSummary, useGetLifeFields} from 'src/hooks';
import {LifeInputLocationConstants} from 'src/constants';
import classNames from 'classnames';
import {ISummarySection} from 'src/types/propsInterface';
import {ILineItem} from '@boldcommerce/checkout-frontend-library';

export function SummarySection (props: ISummarySection) : React.ReactElement {
    // const {expandSummary, showSummary, toggleSummary, totals, lineItems, summaryAriaLabel, formattedPrice} = useCartSummary();
    const {toggleSummary, lineItems, summaryAriaLabel} = useCartSummary();
    const summaryAboveHeaderLifeFields  = useGetLifeFields(LifeInputLocationConstants.SUMMARY_ABOVE_HEADER);
    const summaryAboveHeaderLifeFieldsClassNames = classNames(['summary__life-fields', 'summary-above-header-life-elements']);

    const looseItems: ILineItem[] = [];
    const promoGroupedItems = lineItems.reduce((acc, lineItem) => {
        const details = lineItem.product_data.properties.product_details;
        let promoId:number | null = null;
        let promoCompleted = false;
        if (details) {
            try {
                const parsed = JSON.parse(decodeURI(details));
                promoId = parsed.promoId || null;
                promoCompleted = parsed.promoCompleted || false;
            } catch (e) {
                // handle parse error
            }
        }

        console.log({details: JSON.parse(decodeURI(details)), promoId, promoCompleted, lineItem});

        if (promoId === null || !promoCompleted) {
            looseItems.push(lineItem);
            return acc;
        }

        if (!acc[promoId]) {
            acc[promoId] = [];
        }
        acc[promoId].push(lineItem);
        return acc;
    }, {} as Record<string, ILineItem[]>);

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
                {Object.entries(promoGroupedItems).map(([promoId, items]) => (
                    <CartItems key={promoId} line_items={items} isPromo />
                ))}
                {looseItems.length > 0 && (
                    <CartItems line_items={looseItems} />
                )}
                {/* {showSummary && <SummaryTotals orderCompleted={props.orderCompleted}/>} */}
                {/* {showSummary && !props.orderCompleted && <SummaryDiscountCode />} */}
                {/* {showSummary && <CartItems line_items={lineItems}/>} */}
            </aside>
        </div>
    );
}

