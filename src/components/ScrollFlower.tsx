import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import LuxuryFlower from "./LuxuryFlower";

const ScrollFlower = () => {
  const { scrollY } = useScroll();

  // Rotate continuously for the entire page.
  // Every 100px of scrolling = 18 degrees of rotation.
  const rotation = useTransform(scrollY, (value) => value * 0.18);

  // Smooth luxury-style movement
  const smoothRotation = useSpring(rotation, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  return (
    <motion.div
      style={{
        rotate: smoothRotation,
      }}
      className="
        relative
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        text-[#C4921A]
        pointer-events-none
      "
      aria-hidden="true"
    >
      <LuxuryFlower />
    </motion.div>
  );
};

export default ScrollFlower;