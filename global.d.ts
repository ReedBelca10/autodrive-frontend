// Allow importing CSS and common asset types in TypeScript
declare module '*.css';
declare module '*.scss';
declare module '*.sass';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.gif';
declare module '*.svg' {
  const src: string;
  export default src;
}

export {};
