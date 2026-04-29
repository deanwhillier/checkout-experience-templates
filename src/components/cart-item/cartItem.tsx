import React from 'react';
import ClassNames from 'classnames';
import {Price, Image} from '@boldcommerce/stacks-ui';
import {ICartItemProps} from 'src/types';
import {useGetCurrencyInformation, useCartItem, useGetCartParameters, useAppSelector} from 'src/hooks';
import {SemiControlledNumberInput} from '../semi-controlled-number-input/semiControlledNumberInput';
import {getLineItemPropertiesForDisplay} from 'src/utils';

export function CartItem({line_item, quantityDisabled, onUpdateQuantity, showLineItemProperties = false}: ICartItemProps): React.ReactElement {
    const {product_data} = line_item;
    const {formattedPrice} = useGetCurrencyInformation();
    const displayExchangeRate: number = useAppSelector((state) => state.data.application_state?.display_exchange_rate);
    const displayTotal = displayExchangeRate ? displayExchangeRate * product_data.total_price : product_data.total_price;

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
        promoId?: number
        promoLayerId?: number
        promoPriceOverride?: number | null
    } = JSON.parse(decodeURI(product_data.properties.product_details || '{}'));

    const baseAmount = productDetails.price?.base;
    const discountAmount = productDetails.price?.discount;
    const promoOverrideAmount = productDetails.promoPriceOverride;
    const hasPromoOverride = promoOverrideAmount !== undefined && promoOverrideAmount !== null;

    const effectivePrice = hasPromoOverride ? promoOverrideAmount : (discountAmount || baseAmount || 0);
    const comparisonPrice = hasPromoOverride ? (discountAmount || baseAmount || undefined) : baseAmount && discountAmount ? baseAmount : undefined;

    const amount = effectivePrice * localQuantity;
    const amountBeforeDiscount = comparisonPrice ? comparisonPrice * localQuantity : undefined;

    const cartItemCN = ClassNames('cart-item', {'cart-item__free-gift': product_data.total_price === 0}, {'cart-item__rebate': product_data.total_price < 0});

    return (
        <li className={cartItemCN}>
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
