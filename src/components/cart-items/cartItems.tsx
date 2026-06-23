import React from 'react';
import ClassNames from 'classnames';
import {CartItem} from 'src/components';
import {ICartItemsProps} from 'src/types';

export function CartItems(props: ICartItemsProps): React.ReactElement {
    const cartItemsCN = ClassNames('cart-items', {'cart-items__promo-group': props.isPromo});

    return (
        <ul className={cartItemsCN}>
            {props.line_items.map(item =>
                <CartItem
                    key={item.product_data.line_item_key}
                    line_item={item}
                    onUpdateQuantity={props.onUpdateQuantity}
                    quantityDisabled={props.quantityDisabled}
                    showLineItemProperties={props.showLineItemProperties}
                    isPromo={props.isPromo}
                />
            )}
        </ul>
    );
}
