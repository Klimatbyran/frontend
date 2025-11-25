interface VisualizationModeSelectorProps<Mode extends string> {
  mode: Mode;
  modes: Array<[Mode, string]>;
  onModeChange: (mode: Mode) => void;
}

export function VisualizationModeSelector<Mode extends string>({
  mode,
  modes,
  onModeChange,
}: VisualizationModeSelectorProps<Mode>) {
  return (
    <div className="flex gap-2">
      {modes.map(([m, label]) => (
        <button
          key={m}
          onClick={() => onModeChange(m)}
          className={`px-4 py-2 rounded-level-1 border transition-colors ${
            mode === m
              ? "bg-black-3 border-black-4 text-white"
              : "bg-black-2 border-black-3 text-grey hover:bg-black-2/80"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
