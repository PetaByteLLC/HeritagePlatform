import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";

const layers2D = {
  OSM: new TileLayer({
    source: new OSM(),
    zIndex: 0
  }),
  Google: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      zIndex: 0
    }),
  }),
  Hybrid: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      zIndex: 0
    }),
  }),
  Terrain: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      zIndex: 0
    }),
  }),
  LightMap: new TileLayer({
    source: new XYZ({
      url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
      zIndex: 0
    }),
  }),
  USGSTopo: new TileLayer({
    source: new XYZ({
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
      zIndex: 0
    }),
  }),
  OpenTopoMap: new TileLayer({
    source: new XYZ({
      url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
      zIndex: 0
    }),
  }),
  CartoDBVoyager: new TileLayer({
    source: new XYZ({
      url: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      zIndex: 0
    }),
  }),
  CartoDBDarkMatter: new TileLayer({
    source: new XYZ({
      url: "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
      zIndex: 0
    }),
  }),
  EsriWorldTopo: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      zIndex: 0
    }),
  }),
  EsriWorldImagery: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      zIndex: 0
    }),
  }),
  EsriDarkGrayCanvas: new TileLayer({
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      zIndex: 0
    }),
  }),
};

export default layers2D;