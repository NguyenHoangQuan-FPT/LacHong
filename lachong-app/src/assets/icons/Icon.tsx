import React from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export type IconName =
    | 'plus'
    | 'pencil'
    | 'trash'
    | 'box'
    | 'exclamation-circle'
    | 'eye'
    | 'arrow-repeat'
    | 'profile'
    | 'cart'
    | 'shop'
    | 'comment'
    | 'like'
    | 'options'
    | 'justify'
    | 'search'
    | 'back'
    | 'bell'
    | 'heart'
    | 'hearted'
    | 'share'
    | 'home'
    | 'overview'
    | 'caret'
    | 'start'
    | 'logout';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
    name: IconName;
    size?: number;      // font-size (px)
    color?: string;     // css color
}

/**
 * Map tên đơn giản -> class bootstrap icon
 */
const ICON_CLASS_MAP: Record<IconName, string> = {
    plus: 'bi-plus-lg',
    pencil: 'bi-pencil',
    trash: 'bi-trash',
    box: 'bi-box-seam',
    eye: 'bi-eye',
    profile: 'bi-person',
    logout: 'bi-box-arrow-right',
    cart: 'bi-cart3',
    shop: 'bi-shop',
    comment: 'bi-chat-dots',
    like: 'bi-hand-thumbs-up-fill',
    options: 'bi-three-dots',
    justify: 'bi-justify',
    search: 'bi-search',
    back: 'bi-arrow-left',
    bell: 'bi-bell',
    share: 'bi-share',
    heart: 'bi-heart',
    hearted: 'bi-heart-fill',
    home: 'bi-house',
    overview: 'bi-layout-text-window-reverse',
    caret: 'bi-caret-right',
    start: 'bi-star-fill',
    'exclamation-circle': 'bi-exclamation-circle',
    'arrow-repeat': 'bi-arrow-repeat',
};

const Icon: React.FC<IconProps> = ({ name, size = 16, color, className = '', ...rest }) => {
    const iconClass = ICON_CLASS_MAP[name];

    return (
        <i
            className={`bi ${iconClass} ${className}`.trim()}
            style={{ fontSize: size, color }}
            {...rest}
        />
    );
};

export default Icon;