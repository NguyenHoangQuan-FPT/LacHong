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
    pencil: 'bi-pencil-square',
    trash: 'bi-trash',
    box: 'bi-box-seam',
    eye: 'bi-eye',
    profile: 'bi-person-circle',
    logout: 'bi-box-arrow-right',
    cart: 'bi-cart3',
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