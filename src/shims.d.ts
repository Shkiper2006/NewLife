declare module 'react' {
  export const StrictMode: any;
  export const Suspense: any;
  export const useEffect: any;
  export const useRef: any;
  const React: any;
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): { render(node: any): void };
}

declare module '@react-three/fiber' {
  export const Canvas: any;
  export function useFrame(callback: (...args: any[]) => void): void;
  export function useThree(selector?: any): any;
}

declare module '@react-three/drei' {
  export const Html: any;
  export const Float: any;
  export const Loader: any;
  export const Sky: any;
  export const KeyboardControls: any;
  export function useKeyboardControls<T = any>(): [any, () => T];
}

declare module '@react-three/rapier' {
  export const Physics: any;
  export const RigidBody: any;
  export const CapsuleCollider: any;
  export const CuboidCollider: any;
  export type RapierRigidBody = any;
}

declare module 'zustand' {
  export function create<T>(creator: any): any;
}

declare module 'three' {
  export class Group {
    position: any;
    rotation: any;
  }
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    sub(v: any): this;
    normalize(): this;
    length(): number;
    lengthSq(): number;
    addScaledVector(v: Vector3, s: number): this;
    multiplyScalar(s: number): this;
  }
  export const MathUtils: { lerp(a: number, b: number, t: number): number };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
