declare module "react-native-fast-image" {
  import { ImageProps, ImageResizeMode } from "react-native";
  export interface FastImageProps
    extends Omit<ImageProps, "source" | "resizeMode"> {
    source: { uri: string; priority?: "low" | "normal" | "high" };
    resizeMode?: ImageResizeMode | "contain" | "cover" | "stretch" | "center";
  }
  const FastImage: React.ComponentType<FastImageProps> & {
    resizeMode: {
      contain: "contain";
      cover: "cover";
      stretch: "stretch";
      center: "center";
    };
    priority: { low: "low"; normal: "normal"; high: "high" };
  };
  export default FastImage;
}
