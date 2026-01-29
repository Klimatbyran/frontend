interface ISetOrDeleteSearchParam {
  (
    setter: React.Dispatch<React.SetStateAction<URLSearchParams>>,
    value: string | null,
    param: string,
  ): void;
}

const setOrDeleteSearchParam: ISetOrDeleteSearchParam = (
  setter,
  value,
  param,
) => {
  setter((searchParams) => {
    if (value) {
      searchParams.set(param, value);
    } else {
      searchParams.delete(param);
    }
    return searchParams;
  });
};

export default setOrDeleteSearchParam;
