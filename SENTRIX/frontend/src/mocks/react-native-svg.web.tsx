import React from 'react';

function createElement(name: string) {
  return ({ children, ...props }: any) => {
    const attrs = Object.entries(props)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const inner = children ? React.Children.toArray(children).map((c: any) =>
      typeof c === 'string' ? c : c?.props ? createElementFromElement(c) : ''
    ).join('') : '';
    return React.createElement('div', {
      dangerouslySetInnerHTML: { __html: `<${name} ${attrs}>${inner}</${name}>` },
    });
  };
}

function createElementFromElement(el: React.ReactElement) {
  const { children, ...props } = el.props;
  const attrs = Object.entries(props)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  const inner = children ? React.Children.toArray(children).map((c: any) =>
    typeof c === 'string' ? c : c?.props ? createElementFromElement(c) : ''
  ).join('') : '';
  return `<${el.type} ${attrs}>${inner}</${el.type}>`;
}

export const Svg = ({ children, width, height, viewBox, ...props }: any) => (
  <svg width={width} height={height} viewBox={viewBox} {...props}>
    {children}
  </svg>
);

export const Circle = (props: any) => React.createElement('circle', props);
export const Rect = (props: any) => React.createElement('rect', props);
export const Line = (props: any) => React.createElement('line', props);
export const Path = (props: any) => React.createElement('path', props);
export const Polyline = (props: any) => React.createElement('polyline', props);
export const G = (props: any) => React.createElement('g', props);
export const Polygon = (props: any) => React.createElement('polygon', props);
export const Ellipse = (props: any) => React.createElement('ellipse', props);
export const Text = (props: any) => React.createElement('text', props);
export const TSpan = (props: any) => React.createElement('tspan', props);
export const Defs = (props: any) => React.createElement('defs', props);
export const ClipPath = (props: any) => React.createElement('clipPath', props);
export const LinearGradient = (props: any) => React.createElement('linearGradient', props);
export const RadialGradient = (props: any) => React.createElement('radialGradient', props);
export const Stop = (props: any) => React.createElement('stop', props);
export const Mask = (props: any) => React.createElement('mask', props);
export const Image = (props: any) => React.createElement('image', props);
export const Symbol = (props: any) => React.createElement('symbol', props);
export const Use = (props: any) => React.createElement('use', props);

export { Svg as default };
