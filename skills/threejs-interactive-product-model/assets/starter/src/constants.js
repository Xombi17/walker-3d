// Dimension table and defaults. All lengths in metres.
export const COLORS = { accent: 0xf26b1d, background: 0xe9eaed };

export const DIM = {
  baseRadius: 0.09,
  baseHeight: 0.03,
  armLength: 0.34,
  armRadius: 0.008,
  headLength: 0.12,
  armAngleRange: [-10, 70], // degrees from vertical
  headTiltRange: [-60, 60],
};

export const DEFAULT_STATE = { armAngle: 25, headTilt: 20, lampOn: 1 };
