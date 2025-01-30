import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

const layers2D = {
  OSM: new TileLayer({
    source: new OSM(),
  }),
  Google: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    }),
  }),
  Hybrid: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    }),
  }),
  Terrain: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    }),
  }),
  LightMap: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
    }),
  }),
  USGSTopo: new TileLayer({
    source: new XYZ({
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
    }),
  }),
  OpenTopoMap: new TileLayer({
    source: new XYZ({
      url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
    }),
  }),
  CartoDBVoyager: new TileLayer({
    source: new XYZ({
      url: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    }),
  }),
  CartoDBDarkMatter: new TileLayer({
    source: new XYZ({
      url: "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
    }),
  }),
  EsriWorldTopo: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    }),
  }),
  EsriWorldImagery: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    }),
  }),
  EsriDarkGrayCanvas: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    }),
  }),
};

export default layers2D;