import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { finiteBlend } from "./studio-math";
export function useFiniteTween(
  identity: string,
  target: string,
  immediate: boolean,
  apply: (amount: number) => void,
  seconds = 0.35,
) {
  const { invalidate } = useThree(),
    callback = useRef(apply),
    state = useRef({ identity: "", target: "", elapsed: 0, active: false });
  callback.current = apply;
  useLayoutEffect(() => {
    const current = state.current;
    if (current.identity !== identity || immediate) {
      callback.current(1);
      current.active = false;
    } else {
      current.elapsed = 0;
      current.active = true;
    }
    current.identity = identity;
    current.target = target;
    invalidate();
  }, [identity, target, immediate, seconds, invalidate]);
  useFrame((_, delta) => {
    const current = state.current;
    if (!current.active) return;
    const before = current.elapsed;
    current.elapsed = Math.min(seconds, before + Math.min(delta, 0.05));
    callback.current(
      current.elapsed >= seconds
        ? 1
        : finiteBlend(before, current.elapsed, seconds),
    );
    current.active = current.elapsed < seconds;
    if (current.active) invalidate();
  });
}
