import { Composition } from "remotion";
import { PlanaDemo } from "./PlanaDemo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="PlanaDemo"
      component={PlanaDemo}
      durationInFrames={1440}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
