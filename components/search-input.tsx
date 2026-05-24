import { Input } from "@base-ui/react";

export const SearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  return (
    <Input
      placeholder="Buscar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
