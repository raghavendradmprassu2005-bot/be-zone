const LuxuryFlower = () => {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="50" cy="18" rx="7" ry="16" />
        <ellipse cx="50" cy="82" rx="7" ry="16" />

        <ellipse
          cx="18"
          cy="50"
          rx="7"
          ry="16"
          transform="rotate(-90 18 50)"
        />

        <ellipse
          cx="82"
          cy="50"
          rx="7"
          ry="16"
          transform="rotate(-90 82 50)"
        />

        <ellipse
          cx="28"
          cy="28"
          rx="7"
          ry="16"
          transform="rotate(-45 28 28)"
        />

        <ellipse
          cx="72"
          cy="72"
          rx="7"
          ry="16"
          transform="rotate(-45 72 72)"
        />

        <ellipse
          cx="72"
          cy="28"
          rx="7"
          ry="16"
          transform="rotate(45 72 28)"
        />

        <ellipse
          cx="28"
          cy="72"
          rx="7"
          ry="16"
          transform="rotate(45 28 72)"
        />

        <circle
          cx="50"
          cy="50"
          r="5"
          fill="currentColor"
          stroke="none"
        />
      </g>
    </svg>
  );
};

export default LuxuryFlower;
