const CloseButton = ({ setToggleState, ariaLabel }: any): JSX.Element => {
  return (
    <button
      aria-label={ariaLabel}
      onClick={() => {
        setToggleState(false);
      }}
    >
      <svg
        xmlns="https://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="1em"
        height="1em"
        className="cursor-pointer"
        style={{ pointerEvents: "auto" }}
      >
        <path
          fill="#6f6f6f"
          stroke="#6f6f6f"
          opacity={0.8}
          d="M400 145.49L366.51 112L256 222.51L145.49 112L112 145.49L222.51 256L112 366.51L145.49 400L256 289.49L366.51 400L400 366.51L289.49 256z"
        ></path>
      </svg>
    </button>
  );
};

export default CloseButton;
