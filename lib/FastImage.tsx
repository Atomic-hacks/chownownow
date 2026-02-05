import React from "react";
import { Image, ImageProps, ImageResizeMode } from "react-native";

type Priority = "low" | "normal" | "high";

type Source = {
  uri: string;
  priority?: Priority;
};

export interface FastImageProps
  extends Omit<ImageProps, "source" | "resizeMode"> {
  source: Source;
  resizeMode?: ImageResizeMode | "contain" | "cover" | "stretch" | "center";
  style?: any;
}

let RealFastImage: React.ComponentType<FastImageProps> | null = null;
try {
  RealFastImage = require("react-native-fast-image");
} catch {}

const Fallback = ({ source, resizeMode, ...rest }: FastImageProps) => (
  <Image
    source={{ uri: source.uri }}
    resizeMode={resizeMode as any}
    {...rest}
  />
);

const FastImageComp = (props: FastImageProps) => {
  const Comp: any = RealFastImage ?? Fallback;
  return <Comp {...props} />;
};

export const FastImage = Object.assign(FastImageComp, {
  resizeMode: {
    contain: "contain",
    cover: "cover",
    stretch: "stretch",
    center: "center",
  } as const,
  priority: { low: "low", normal: "normal", high: "high" } as const,
});

export default FastImage;
