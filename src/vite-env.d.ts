/// <reference types="vite/client" />

declare module "*.geojson" {
  const value: import("geojson").FeatureCollection;
  export default value;
}
