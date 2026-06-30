import React from 'react';
import ClassNames from 'classnames';
import {Price, Image} from '@boldcommerce/stacks-ui';
import {ICartItemProps} from 'src/types';
// import {useGetCurrencyInformation, useCartItem, useGetCartParameters, useAppSelector} from 'src/hooks';
import {useGetCurrencyInformation, useCartItem, useGetCartParameters} from 'src/hooks';
import {SemiControlledNumberInput} from '../semi-controlled-number-input/semiControlledNumberInput';
import {getLineItemPropertiesForDisplay} from 'src/utils';

export function CartItem({line_item, quantityDisabled, onUpdateQuantity, showLineItemProperties = false}: ICartItemProps): React.ReactElement {
    const {product_data} = line_item;
    const {formattedPrice} = useGetCurrencyInformation();
    // const displayExchangeRate: number = useAppSelector((state) => state.data.application_state?.display_exchange_rate);
    // const displayTotal = displayExchangeRate ? displayExchangeRate * product_data.total_price : product_data.total_price;

    const {
        decrementQuantity: decrementLocalQuantity,
        incrementQuantity: incrementLocalQuantity,
        updateQuantity: commit,
        quantity: localQuantity,
    } = useCartItem(
        line_item,
        quantityDisabled,
        onUpdateQuantity,
    );

    const cartParameters = useGetCartParameters();
    const properties = getLineItemPropertiesForDisplay(product_data.properties, cartParameters);

    const productDetails: {
        cartId: string
        productId: number
        name: string
        image: string
        price?: {
            base?: number
            discount?: number
        }
        sku: string
        uom?: {
            quantity?: number
            code?: string
            id?: number
            label?: string
        }
        localShippingOnly?: boolean
        promo: {
            id: number | null,
            layerId: number | null,
            layerTypeName: string | null,
            priceOverride: number | null,
            completed: boolean | null,
            rewardType: 'free' | 'reduced' | 'rebate' | 'discount' | null
        }
    } = typeof product_data.properties.product_details === 'string' ? JSON.parse(decodeURI(product_data.properties.product_details || '{}')) : product_data.properties.product_details || {};

    const baseAmount = productDetails.price?.base;
    const discountAmount = productDetails.price?.discount;
    const promoOverrideAmount = productDetails.promo?.priceOverride;
    const hasPromoOverride = promoOverrideAmount !== undefined && promoOverrideAmount !== null;
    const isPromoDiscountType = productDetails.promo?.rewardType === 'discount';
    const isPromoRebateType = productDetails.promo?.rewardType === 'rebate';

    let effectivePrice: number;
    let comparisonPrice: number | undefined;
    switch(true) {
        // rebate promos never show a comparison price
        case isPromoRebateType && hasPromoOverride:
            effectivePrice = promoOverrideAmount || discountAmount || baseAmount || 0;
            comparisonPrice = undefined;
            break;
        // discount promos never show a promo override price
        case isPromoDiscountType:
            effectivePrice = discountAmount || baseAmount || 0;
            comparisonPrice = baseAmount && discountAmount ? baseAmount : undefined;
            break;
        // show promo override price if available
        case hasPromoOverride:
            effectivePrice = promoOverrideAmount || discountAmount || baseAmount || 0;
            comparisonPrice = discountAmount || baseAmount || undefined;
            break;
        // default to using standard pricing
        default:
            effectivePrice = discountAmount || baseAmount || 0;
            comparisonPrice = baseAmount && discountAmount ? baseAmount : undefined;
    }

    const amount = effectivePrice * localQuantity;
    const amountBeforeDiscount = comparisonPrice ? comparisonPrice * localQuantity : undefined;

    const isReward = !!productDetails?.promo?.rewardType;
    let rewardLabel:string;
    switch (productDetails?.promo?.rewardType) {
        case 'free':
            rewardLabel = 'Free gift with purchase';
            break;
        case 'reduced':
            rewardLabel = 'Reduced price with purchase';
            break;
        case 'rebate':
            rewardLabel = 'Rebate with purchase';
            break;
        case 'discount':
            rewardLabel = 'Discount applied';
            break;
        default:
            rewardLabel =  'Reward with purchase';
    }
    const Reward = isReward && (
        <span className="cart-item__reward-label">{rewardLabel}</span>
    );

    const cartItemCN = ClassNames(
        'cart-item',
        {'cart-item__reward': !!productDetails?.promo?.rewardType},
        {'cart-item__free-gift': productDetails?.promo?.rewardType === 'free'},
        {'cart-item__reduced-price': productDetails?.promo?.rewardType === 'reduced'},
        {'cart-item__rebate': productDetails?.promo?.rewardType === 'rebate'},
        {'cart-item__discount': productDetails?.promo?.rewardType === 'discount'}
    );


    return (
        <li className={cartItemCN}>
            {Reward}
            <Image src={product_data.image_url} alt={product_data.product_title} className="cart-item__img-container cart-item__img-container--empty" />
            <div className="cart-item__text">
                <h2 className="cart-item__title">{product_data.product_title || product_data.title}</h2>
                {(productDetails.sku ) && (
                    <p className="cart-item__variant-title">
                        SKU #{productDetails.sku}{(productDetails.uom?.quantity || 0) > 1 && productDetails.uom?.label ? ` | ${productDetails.uom?.label}` : ''}
                    </p>
                )}
                {   showLineItemProperties && properties.map((property) => {
                    const el = document.createElement('textarea');
                    el.innerHTML = property;

                    return <p className='cart-item__property' key={property}>{el.value}</p>;
                })
                }
            </div>
            <div className="cart-item__price-quantity">
                <div className="cart-item__quantity-container">
                    {onUpdateQuantity ? (
                        <div className="cart-item__quantity-controls">
                            <button
                                id={'quantity-decrease-button'}
                                className="cart-item__quantity-decrease"
                                aria-disabled={quantityDisabled}
                                aria-label="decrement quantity"
                                onClick={decrementLocalQuantity}
                            >
                                -
                            </button>
                            <SemiControlledNumberInput
                                className="cart-item__quantity-input"
                                min={1}
                                value={localQuantity}
                                aria-disabled={quantityDisabled}
                                onCommit={commit}
                            />
                            <button
                                id={'quantity-increase-button'}
                                className="cart-item__quantity-increase"
                                aria-disabled={quantityDisabled}
                                aria-label="increment quantity"
                                onClick={incrementLocalQuantity}
                            >
                                +
                            </button>
                        </div>
                    ) : (
                        <div className="cart-item__quantity">
                            <span className="cart-item__quantity-number">{localQuantity}</span>
                        </div>
                    )}
                </div>
                <div className="cart-item__price">
                    <Price
                        amount={amount}
                        amountBeforeDiscount={amountBeforeDiscount}
                        moneyFormatString={formattedPrice}
                        textAlign="right"
                    />
                </div>
            </div>
        </li>
    );
}
